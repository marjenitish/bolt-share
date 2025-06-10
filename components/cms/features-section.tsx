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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as icons from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const formSchema = z.object({
  icon: z.string().min(1, 'Icon is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  order: z.number().int().min(0),
  is_active: z.boolean().default(true),
});

export function FeaturesSection() {
  const [features, setFeatures] = useState<any[]>([]);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: '',
      title: '',
      description: '',
      order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  useEffect(() => {
    if (editingFeature) {
      form.reset({
        icon: editingFeature.icon,
        title: editingFeature.title,
        description: editingFeature.description,
        order: editingFeature.order,
        is_active: editingFeature.is_active,
      });
    } else {
      form.reset({
        icon: '',
        title: '',
        description: '',
        order: features.length,
        is_active: true,
      });
    }
  }, [editingFeature, form, features.length]);

  const fetchFeatures = async () => {
    const { data, error } = await supabase
      .from('homepage_features')
      .select('*')
      .order('order');

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setFeatures(data || []);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingFeature) {
        const { error } = await supabase
          .from('homepage_features')
          .update({
            icon: values.icon,
            title: values.title,
            description: values.description,
            order: values.order,
            is_active: values.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFeature.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Feature updated successfully',
        });
      } else {
        const { error } = await supabase.from('homepage_features').insert([{
          icon: values.icon,
          title: values.title,
          description: values.description,
          order: values.order,
          is_active: values.is_active,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Feature created successfully',
        });
      }

      setEditingFeature(null);
      form.reset();
      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('homepage_features')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature deleted successfully',
      });

      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Get all icon names from lucide-react
  const iconNames = Object.keys(icons)

  const renderIcon = (name: string) => {    
    const Icon = icons[name as keyof typeof icons];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
             <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Active</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {editingFeature && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFeature(null)}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingFeature ? 'Update' : 'Add'} Feature
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => (
          <Card key={feature.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {renderIcon(feature.icon)}
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingFeature(feature)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(feature.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Order: {feature.order}</span>
              <span>{feature.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}