'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
  admin_notes: z.string().optional(),
});

export default function ClassCancellationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'pending',
      admin_notes: '',
    },
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('class_cancellation_requests')
      .select(
        `
        *,
        classes (name),
        instructors (name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cancellation requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    form.reset({
      status: request.status,
      admin_notes: request.admin_notes || '',
    });
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = async (values: z.infer<typeof formSchema>) => {
    if (!selectedRequest) return;

    const { data, error } = await supabase
      .from('class_cancellation_requests')
      .update({
        status: values.status,
        admin_notes: values.admin_notes,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: 'Error updating request',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Request updated successfully',
        description: 'The cancellation request status has been updated.',
      });
      setIsDetailsModalOpen(false);
      fetchRequests(); // Refresh the list
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Class Cancellation Requests</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Cancellation Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No cancellation requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.classes?.name}</TableCell>
                  <TableCell>{request.instructors?.name}</TableCell>
                  <TableCell>
                    {format(
                      new Date(request.cancellation_date),
                      'dd/MM/yyyy'
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell className="capitalize">
                    {request.status}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.admin_notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRequest && (
        <Dialog
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancellation Request Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class_name" className="text-right">
                  Class:
                </Label>
                <div className="col-span-3">
                  {selectedRequest.classes?.name}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructor_name" className="text-right">
                  Instructor:
                </Label>
                <div className="col-span-3">
                  {selectedRequest.instructors?.name}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cancellation_date" className="text-right">
                  Date:
                </Label>
                <div className="col-span-3">
                  {format(
                    new Date(selectedRequest.cancellation_date),
                    'dd/MM/yyyy'
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason:
                </Label>
                <div className="col-span-3">{selectedRequest.reason}</div>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdateStatus)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Status:</FormLabel>
                        <FormControl className="col-span-3">
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
                  <FormField
                    control={form.control}
                    name="admin_notes"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">
                          Admin Notes:
                        </FormLabel>
                        <FormControl className="col-span-3">
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}