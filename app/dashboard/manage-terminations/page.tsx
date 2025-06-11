'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Loader2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Termination {
  id: string;
  customer_id: string;
  termination_date: string;
  status: 'accepted' | 'rejected' | 'pending';
  reason: string | null;
  admin_notes: string | null;
  created_at: string;
  customers: {
    first_name: string;
    surname: string;
  } | null;
}

export default function ManageTerminationsPage() {
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'accepted' | 'rejected' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const supabase = createBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTerminations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('terminations')
        .select(
          `
          id, customer_id, termination_date, status, reason, admin_notes, created_at,
          customers (first_name, surname)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching terminations:', error);
        setTerminations([]);
      } else {
        setTerminations(data || []);
      }
      setLoading(false);
    };

    fetchTerminations();
  }, [refreshKey]);

  const handleReviewClick = (termination: Termination) => {
    setSelectedTermination(termination);
    setReviewStatus(termination.status); // Set current status in modal
    setAdminNotes(termination.admin_notes || ''); // Set current admin notes
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTermination || !reviewStatus) return;

    setIsSubmitting(true);

    try {
      // Update termination status
      const { error } = await supabase
        .from('terminations')
        .update({
          status: reviewStatus,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTermination.id);

      if (error) throw error;

      // If accepted, update customer status to Inactive
      if (reviewStatus === 'accepted') {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            status: 'Inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTermination.customer_id);

        if (customerError) throw customerError;
      }

      // Close modal and trigger refresh
      setIsModalOpen(false);
      setSelectedTermination(null);
      setReviewStatus('');
      setAdminNotes('');
      setRefreshKey(prev => prev + 1);


      toast({
        title: 'Success',
        description: 'Termination status updated successfully',
      });

    } catch (error: any) {
      console.error('Error updating termination status:', error);
      toast({
        title: 'Error',
        description: `Failed to update termination status: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Manage Terminations
      </h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : terminations.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No termination requests found.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Termination Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminations.map(termination => (
                <TableRow key={termination.id}>
                  <TableCell>
                    {termination.customers?.first_name}{' '}
                    {termination.customers?.surname}
                  </TableCell>
                  <TableCell>
                    {format(new Date(termination.termination_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {termination.reason
                      ? termination.reason.substring(0, 100) +
                      (termination.reason.length > 100 ? '...' : '')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="capitalize">{termination.status}</TableCell>
                  <TableCell>
                    {termination.admin_notes
                      ? termination.admin_notes.substring(0, 100) +
                      (termination.admin_notes.length > 100 ? '...' : '')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReviewClick(termination)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Review Termination</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Review Termination Request</DialogTitle>
          </DialogHeader>
          {selectedTermination && (
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                <p className="text-sm font-medium">Customer:</p>
                <p className="text-muted-foreground text-sm">
                    {selectedTermination.customers?.first_name}{' '}
                    {selectedTermination.customers?.surname}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Termination Date:</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(selectedTermination.termination_date), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Reason:</p>
                <p className="text-muted-foreground text-sm">
                  {selectedTermination.reason || 'No reason provided.'}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value: 'accepted' | 'rejected') =>
                    setReviewStatus(value)
                  }
                  value={reviewStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepted">Accept</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add notes for this request..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleUpdateStatus}
              disabled={!reviewStatus || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}