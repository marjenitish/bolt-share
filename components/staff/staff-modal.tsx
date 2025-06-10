'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generatePassword } from '@/lib/utils';

const staffSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  generatePassword: z.boolean().default(true),
  staffRoleId: z.string().min(1, 'Staff role is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: any;
  onSuccess: () => void;
}

export function StaffModal({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffModalProps) {
  const [staffRoles, setStaffRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      generatePassword: true,
      staffRoleId: '',
      phone: '',
      bio: '',
    },
  });

  useEffect(() => {
    fetchStaffRoles();
  }, []);

  useEffect(() => {
    if (staff) {
      form.reset({
        fullName: staff.full_name,
        email: staff.email,
        generatePassword: true,
        staffRoleId: staff.staff_role_id || '',
        phone: staff.phone || '',
        bio: staff.bio || '',
      });
    } else {
      form.reset({
        fullName: '',
        email: '',
        password: '',
        generatePassword: true,
        staffRoleId: '',
        phone: '',
        bio: '',
      });
    }
  }, [staff, form]);

  const fetchStaffRoles = async () => {
    const { data } = await supabase
      .from('staff_roles')
      .select('*')
      .order('name');
    
    if (data) {
      setStaffRoles(data);
    }
  };

  const onSubmit = async (values: StaffFormValues) => {
    try {
      setLoading(true);

      if (staff) {
        // Update existing staff member
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: values.fullName,
            staff_role_id: values.staffRoleId,
            phone: values.phone,
            bio: values.bio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', staff.id);

        if (updateError) throw updateError;
      } else {
        // Create new staff member
        const password = values.generatePassword 
          ? generatePassword()
          : values.password!;

        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: password,
          options: {
            data: {
              full_name: values.fullName,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Then update the public.users table
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username: values.email,
              full_name: values.fullName,
              staff_role_id: values.staffRoleId,
              phone: values.phone,
              bio: values.bio,
              role: 'admin',
            })

          if (userError) throw userError;

          if (values.generatePassword) {
            toast({
              title: 'Generated Password',
              description: `The password for ${values.email} is: ${password}`,
            });
          }
        }
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {staff ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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
                      disabled={!!staff}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!staff && (
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
              name="staffRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
              <Button type="submit" disabled={loading}>
                {staff ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}