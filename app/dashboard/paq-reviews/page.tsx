'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Loader2, Eye, Check, X, FileText } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const reviewSchema = z.object({
  paq_status: z.enum(['pending', 'accepted', 'rejected'])
});

interface PendingPAQCustomer {
  id: string;
  first_name: string;
  surname: string;
  paq_form: boolean;
  paq_status: 'pending' | 'accepted' | 'rejected' | null;
  paq_document_url: string;
  paq_filled_date: string | null;
}

export default function PAQReviewsPage() {
  const [pendingCustomers, setPendingCustomers] = useState<PendingPAQCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PendingPAQCustomer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      paq_status: 'pending',
    },
  });

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const fetchPendingCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('paq_status', 'pending')
      .order('paq_filled_date', { ascending: true });

    if (error) {
      console.error('Error fetching pending PAQ customers:', error);
      setPendingCustomers([]);
    } else {
      setPendingCustomers(data || []);
    }
    setLoading(false);
  };

  const handleReviewClick = (customer: PendingPAQCustomer) => {
    setSelectedCustomer(customer);
    form.reset({
      paq_status: customer.paq_status || 'pending'
    });
    setIsReviewModalOpen(true);
  };

  const openImageLink = async (fileName: string) => {
    const { data, error } = await supabase
      .storage
      .from('customers')
      .createSignedUrl(fileName, 10);
  
    if (data?.signedUrl) {
      //const fullUrl = `https://pfoargdymscqqrekzref.supabase.co${data.signedUrl}`;
      window.open(data.signedUrl, '_blank');
    } else {
      console.error('Failed to generate signed URL:', error?.message);
    }
  };

  const handleUpdateStatus = async (values: z.infer<typeof reviewSchema>) => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          paq_status: values.paq_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PAQ status updated successfully',
      });

      setIsReviewModalOpen(false);
      setSelectedCustomer(null);
      form.reset();
      fetchPendingCustomers(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating PAQ status:', error);
      toast({
        title: 'Error',
        description: `Failed to update PAQ status: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("selectedCustomer", selectedCustomer)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">PAQ Reviews</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : pendingCustomers.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No pending PAQ reviews.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>PAQ Filled Date</TableHead>
                <TableHead>PAQ Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.first_name} {customer.surname}</TableCell>
                  <TableCell>
                    {customer.paq_filled_date ? format(new Date(customer.paq_filled_date), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                  {customer?.paq_document_url ? (
                  <a
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center text-sm cursor-pointer"
                    onClick={() => openImageLink(customer?.paq_document_url || "")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Document
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">No document uploaded.</p>
                )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {customer.paq_status || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewClick(customer)}
                      disabled={isSubmitting}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Review PAQ for {selectedCustomer?.first_name} {selectedCustomer?.surname}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">PAQ Document:</p>

                {selectedCustomer.paq_document_url ? (
                  <a
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center text-sm View Document"
                    onClick={() => openImageLink(selectedCustomer?.paq_document_url || "")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Document
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">No document uploaded.</p>
                )}
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateStatus)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paq_status"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Status:</FormLabel>
                        <FormControl className="col-span-6">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Status'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}