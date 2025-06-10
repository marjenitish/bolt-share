// components/cms/exercises-section.tsx
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Must be a valid URL'),
  duration: z.string().min(1, 'Duration is required'),
  order: z.number().int().min(0),
  is_active: z.boolean().default(true),
});

export function ExercisesSection() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      duration: '',
      order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (editingExercise) {
      form.reset({
        name: editingExercise.name,
        description: editingExercise.description.join('\n'),
        image: editingExercise.image,
        duration: editingExercise.duration,
        order: editingExercise.order,
        is_active: editingExercise.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        image: '',
        duration: '',
        order: exercises.length,
        is_active: true,
      });
    }
  }, [editingExercise, form, exercises.length]);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('homepage_exercises')
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

    setExercises(data || []);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Convert description string to array
      const descriptionArray = values.description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (editingExercise) {
        const { error } = await supabase
          .from('homepage_exercises')
          .update({
            name: values.name,
            description: descriptionArray,
            image: values.image,
            duration: values.duration,
            order: values.order,
            is_active: values.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingExercise.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Exercise updated successfully',
        });
      } else {
        const { error } = await supabase.from('homepage_exercises').insert([{
          name: values.name,
          description: descriptionArray,
          image: values.image,
          duration: values.duration,
          order: values.order,
          is_active: values.is_active,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Exercise created successfully',
        });
      }

      setEditingExercise(null);
      form.reset();
      fetchExercises();
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
        .from('homepage_exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Exercise deleted successfully',
      });

      fetchExercises();
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Description (one step per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Stand up straight with the feet shoulder-width apart&#10;Dip the chin slightly toward the chest&#10;Gently roll the head in a clockwise motion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="30 seconds" />
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
              {editingExercise && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingExercise(null)}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingExercise ? 'Update' : 'Add'} Exercise
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map(exercise => (
          <Card key={exercise.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{exercise.name}</h3>
                <p className="text-sm text-muted-foreground">{exercise.duration}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingExercise(exercise)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(exercise.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-4 aspect-video rounded-lg overflow-hidden">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {exercise.description.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Order: {exercise.order}</span>
              <span>{exercise.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
