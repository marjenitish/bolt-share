'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Using Input for simplicity with comma-separated
import { Loader2 } from 'lucide-react';

const emailingListSchema = z.object({
  enrollments: z.string().optional(),
  paq_forms: z.string().optional(),
  payments: z.string().optional(),
  class_cancellation: z.string().optional(),
});

type EmailingListFormValues = z.infer<typeof emailingListSchema>;

export default function EmailingListsPage() {
  const [emailingList, setEmailingList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<EmailingListFormValues>({
    resolver: zodResolver(emailingListSchema),
    defaultValues: {
      enrollments: '',
      paq_forms: '',
      payments: '',
      class_cancellation: '',
    },
  });

  useEffect(() => {
    const fetchEmailingList = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('emailing_list')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no row found
        console.error('Error fetching emailing list:', error);
        toast({
          title: 'Error',
          description: 'Failed to load emailing list.',
          variant: 'destructive',
        });
        setEmailingList(null);
      } else if (data) {
        setEmailingList(data);
        form.reset({
          enrollments: data.enrollments?.join(', ') || '',
          paq_forms: data.paq_forms?.join(', ') || '',
          payments: data.payments?.join(', ') || '',
          class_cancellation: data.class_cancellation?.join(', ') || '',
        });
      } else {
        setEmailingList(null); // No row exists yet
        form.reset({
          enrollments: '',
          paq_forms: '',
          payments: '',
          class_cancellation: '',
        });
      }
      setLoading(false);
    };

    fetchEmailingList();
  }, [form, toast, supabase]); // Added dependencies

  const onSubmit = async (values: EmailingListFormValues) => {
    setIsSubmitting(true);

    const emails = {
      enrollments: values.enrollments?.split(',').map(email => email.trim()).filter(email => email !== '') || [],
      paq_forms: values.paq_forms?.split(',').map(email => email.trim()).filter(email => email !== '') || [],
      payments: values.payments?.split(',').map(email => email.trim()).filter(email => email !== '') || [],
      class_cancellation: values.class_cancellation?.split(',').map(email => email.trim()).filter(email => email !== '') || [],
    };

    try {
      if (emailingList) {
        // Update existing row
        const { data, error } = await supabase
          .from('emailing_list')
          .update(emails)
          .eq('id', emailingList.id)
          .select()
          .single();

        if (error) throw error;
        setEmailingList(data); // Update state with the latest data
        toast({
          title: 'Success',
          description: 'Emailing list updated successfully.',
        });
      } else {
        // Insert new row
        const { data, error } = await supabase
          .from('emailing_list')
          .insert([emails])
          .select()
          .single();

        if (error) throw error;
        setEmailingList(data); // Update state with the newly created row
        toast({
          title: 'Success',
          description: 'Emailing list created successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error saving emailing list:', error);
      toast({
        title: 'Error',
        description: `Failed to save emailing list: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Emailing Lists</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manage Email Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="enrollments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Emails (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paq_forms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAQ Form Emails (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Emails (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_cancellation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Cancellation Emails (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save Emailing Lists'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}