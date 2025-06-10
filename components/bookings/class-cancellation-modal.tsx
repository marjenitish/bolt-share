'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

const formSchema = z.object({
  reason: z.string().min(1, { message: 'Reason is required.' }),
  admin_notes: z.string().optional(),
});

interface ClassCancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  instructorId: string;
  cancellationDate: string;
  onCancelSuccess: () => void;
}

export function ClassCancellationModal({
  open,
  onOpenChange,
  classId,
  instructorId,
  onCancelSuccess,
  cancellationDate,
}: ClassCancellationModalProps) {
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      admin_notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from('class_cancellation_requests')
        .insert([
          {
            class_id: classId,
            instructor_id: instructorId,
            cancellation_date: cancellationDate,
            reason: values.reason,
            admin_notes: values.admin_notes,
            status: 'pending',
          },
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Cancellation Request Submitted',
        description: 'Your class cancellation request has been submitted.',
      });
      onCancelSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting cancellation request:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to submit cancellation request.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Class Cancellation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Cancellation</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="admin_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}