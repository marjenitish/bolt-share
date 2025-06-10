// components/instructors/instructor-modal.tsx
'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { createBrowserClient } from '@/lib/supabase/client';
import { generatePassword } from '@/lib/utils';

const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  generatePassword: z.boolean().default(true),
  contactNo: z.string().min(1, 'Contact number is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  imageLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type InstructorFormValues = z.infer<typeof instructorSchema>;

interface InstructorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: any;
  onSubmit: (data: InstructorFormValues) => void;
}

export function InstructorModal({
  open,
  onOpenChange,
  instructor,
  onSubmit: parentOnSubmit,
}: InstructorModalProps) {
  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      generatePassword: true,
      contactNo: '',
      specialty: '',
      address: '',
      description: '',
      imageLink: '',
    },
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    if (instructor) {
      form.reset({
        name: instructor.name,
        email: instructor.email,
        contactNo: instructor.contact_no,
        specialty: instructor.specialty,
        address: instructor.address,
        description: instructor.description || '',
        imageLink: instructor.image_link || '',
        generatePassword: true,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        generatePassword: true,
        contactNo: '',
        specialty: '',
        address: '',
        description: '',
        imageLink: '',
      });
    }
  }, [instructor, form]);

  const onSubmit = async (values: InstructorFormValues) => {
    try {
      if (instructor) {
        // Update existing instructor
        const { error: instructorError } = await supabase
          .from('instructors')
          .update({
            name: values.name,
            contact_no: values.contactNo,
            specialty: values.specialty,
            email: values.email,
            address: values.address,
            description: values.description,
            image_link: values.imageLink,
            updated_at: new Date().toISOString(),
          })
          .eq('id', instructor.id);

        if (instructorError) throw instructorError;

        // Update user profile if exists
        if (instructor.user_id) {
          const { error: userError } = await supabase
            .from('users')
            .update({
              full_name: values.name,
              phone: values.contactNo,
              bio: values.description,
              updated_at: new Date().toISOString(),
            })
            .eq('id', instructor.user_id);

          if (userError) throw userError;
        }
      } else {
        // Create new instructor with auth account
        const password = values.generatePassword 
          ? generatePassword()
          : values.password!;

        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: password,
          options: {
            data: {
              full_name: values.name,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Update users table
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username: values.email,
              full_name: values.name,
              staff_role_id: values.staffRoleId,
              phone: values.phone,
              bio: values.bio,
              role: 'instructor',
            })

          if (userError) throw userError;

          
          // Create instructor record
          const { data: instructorData, error: instructorError } = await supabase
            .from('instructors')
            .insert([{
              name: values.name,
              contact_no: values.contactNo,
              specialty: values.specialty,
              email: values.email,
              address: values.address,
              description: values.description,
              image_link: values.imageLink,
              user_id: authData.user.id,
            }])
            .select()
            .single();

          if (instructorError) throw instructorError;

          

          if (values.generatePassword) {
            // Show generated password to admin
            alert(`Generated password for ${values.email}: ${password}`);
          }
        }
      }

      parentOnSubmit(values);
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {instructor ? 'Edit Instructor' : 'Add Instructor'}
          </DialogTitle>
        </DialogHeader>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      {...field}
                      disabled={!!instructor}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!instructor && (
              <>
                <FormField
                  control={form.control}
                  name="generatePassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Generate random password
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch('generatePassword') && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
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
                    <Textarea
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {instructor ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
