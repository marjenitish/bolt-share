'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const terminationSchema = z.object({
  termination_date: z.date({
    required_error: 'Termination date is required.',
  }),
  reason: z.string().min(10, 'Reason must be at least 10 characters.'),
  admin_notes: z.string().optional(),
});

type TerminationFormValues = z.infer<typeof terminationSchema>;

interface TerminationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onTerminationSuccess?: () => void;
}

export function TerminationModal({
  open,
  onOpenChange,
  customerId,
  onTerminationSuccess,
}: TerminationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const form = useForm<TerminationFormValues>({
    resolver: zodResolver(terminationSchema),
    defaultValues: {
      termination_date: new Date(),
      reason: '',
      admin_notes: '',
    },
  });

  const onSubmit = async (values: TerminationFormValues) => {
    if (!customerId) {
      toast({
        title: 'Error',
        description: 'Customer ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('terminations').insert([
        {
          customer_id: customerId,
          termination_date: format(values.termination_date, 'yyyy-MM-dd'),
          reason: values.reason,
          admin_notes: values.admin_notes,
          status: 'pending', // Set status to pending
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Termination request submitted.',
      });

      form.reset();
      onOpenChange(false);
      if (onTerminationSuccess) {
        onTerminationSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting termination:', error);
      toast({
        title: 'Error',
        description: `Failed to submit termination request: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Account Termination</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="termination_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Termination Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Termination</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for termination..."
                      className="resize-none"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Add any notes for administrators..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}