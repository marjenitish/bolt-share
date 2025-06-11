'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Loader2, Eye, Check, X } from 'lucide-react';
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

interface PendingBookingCancellation {
  id: string;
  booking_date: string;
  cancellation_reason: string | null;
  medical_certificate_url: string | null;
  classes: {
    id: string; // Add class id to fetch details later
    code: string;
    fee_amount: number;
  } | null;
  enrollments: {
    customers: {
      first_name: string;
      surname: string;
    } | null;
  } | null;
}

export default function CustomerCancelRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<
    PendingBookingCancellation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PendingBookingCancellation | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'accepted' | 'rejected' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          id, booking_date, cancellation_reason, medical_certificate_url,
          enrollment_id, class_id, // Added class_id here
          classes (name, code),
          enrollments (customers (first_name, surname))
        `
        )
        .eq('cancellation_status', 'pending')
        .order('booking_date', { ascending: true });

      if (error) {
        console.error('Error fetching pending requests:', error);
        setPendingRequests([]);
      } else {
        setPendingRequests(data || []);
      }
      setLoading(false);
    };

    fetchPendingRequests();
  }, []);

  const handleReviewClick = (request: PendingBookingCancellation) => {
    setSelectedRequest(request);
    setReviewStatus(''); // Reset status on opening modal
    setAdminNotes(''); // Reset notes on opening modal
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !reviewStatus) return;
  
    setIsSubmitting(true);
  
    try {
      // Update booking cancellation status
      const { error } = await supabase
        .from('bookings')
        .update({
          cancellation_status: reviewStatus,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);
  
      if (error) throw error;
  
      // If accepted and enrollment_id exists
      if (reviewStatus === 'accepted' && selectedRequest.enrollment_id) {
        // Fetch the class details to check if subsidised
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('is_subsidised')
          .eq('id', selectedRequest.class_id)
          .single();

        if (classError) {
          console.error('Error fetching class details for subsidy check:', classError);
          // Continue without adding credit if class data can't be fetched
        }

        // Only add credit if the class is NOT subsidised
        if (classData && !classData.is_subsidised) {
          // Fetch the enrollment to get the customer_id
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('customer_id')
            .eq('id', selectedRequest.enrollment_id)
            .single();
    
          if (enrollmentError) {
            console.error('Error fetching enrollment for customer_id:', enrollmentError);
            // Continue without adding credit if enrollment data can't be fetched
          } else if (enrollmentData?.customer_id) {
            // Fetch the customer's current credit
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('customer_credit')
              .eq('id', enrollmentData.customer_id)
              .single();
    
            if (customerError) throw customerError; // Throw error if customer credit can't be fetched
    
            // Update the customer's credit by incrementing
          const { error: updateCreditError } = await supabase
            .from('customers')
            .update({ customer_credit: newCredit })
            .eq('id', enrollmentData.customer_id);
  
          if (updateCreditError) throw updateCreditError;
        }
      }
      }
  
      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedRequest(null);
      setReviewStatus('');
      setAdminNotes('');
  
      toast({
        title: 'Success',
        description: 'Cancellation status updated successfully',
      });
  
    } catch (error: any) {
      console.error('Error updating cancellation status:', error);
      toast({
        title: 'Error',
        description: `Failed to update cancellation status: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Customer Cancellation Requests
      </h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No pending cancellation requests.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Class Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cancellation Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell>{request.classes?.name}</TableCell>
                  <TableCell>{request.classes?.code}</TableCell>
                  <TableCell>
                    {request.enrollments?.customers?.first_name}{' '}
                    {request.enrollments?.customers?.surname}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.booking_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {request.cancellation_reason
                      ? request.cancellation_reason.substring(0, 100) +
                        (request.cancellation_reason.length > 100 ? '...' : '')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReviewClick(request)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Review Request</span>
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
            <DialogTitle>Review Cancellation Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Cancellation Reason:</p>
                <p className="text-muted-foreground text-sm">
                  {selectedRequest.cancellation_reason || 'No reason provided.'}
                </p>
              </div>
              {selectedRequest.medical_certificate_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Medical Certificate:</p>
                  <a
                    href={selectedRequest.medical_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View Certificate
                  </a>
                </div>
              )}
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