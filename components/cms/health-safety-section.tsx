'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  content: z.string().min(1, 'Content is required'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  button_text: z.string().optional(),
  button_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  stats: z.array(z.object({
    title: z.string(),
    value: z.string()
  })).optional()
});

export function HealthSafetySection() {
  const [content, setContent] = useState<any>(null);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      button_text: '',
      button_link: '',
      stats: [
        { title: 'COVID Safe', value: 'Certified' },
        { title: 'Staff', value: 'Fully Vaccinated' },
        { title: 'Procedures', value: 'Best Practice' },
        { title: 'Guidelines', value: 'NSW Compliant' }
      ]
    },
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('section_id', 'health-safety')
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      setContent(data);
      form.reset({
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        image_url: data.image_url,
        button_text: data.button_text,
        button_link: data.button_link,
        stats: data.stats || form.getValues('stats'),
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .upsert({
          section_id: 'health-safety',
          title: values.title,
          subtitle: values.subtitle,
          content: values.content,
          image_url: values.image_url,
          button_text: values.button_text,
          button_link: values.button_link,
          stats: values.stats,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Health & Safety section updated successfully',
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-[200px] mb-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo/Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="button_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="button_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Link</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="font-medium">Statistics</h3>
              {form.watch('stats')?.map((_, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`stats.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stat {index + 1} Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`stats.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stat {index + 1} Value</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Preview</h3>
        <div className="prose max-w-none">
          <h2>{form.watch('title')}</h2>
          <p>{form.watch('subtitle')}</p>
          <div dangerouslySetInnerHTML={{ __html: form.watch('content') || '' }} />
          {form.watch('stats') && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {form.watch('stats').map((stat, index) => (
                <div key={index} className="p-4 border rounded">
                  <h4>{stat.title}</h4>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}