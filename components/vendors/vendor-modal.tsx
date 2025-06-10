// components/vendors/vendor-modal.tsx
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  api_key: z.string().min(1, 'API Key is required'),
  username: z.string().min(1, 'Username is required'),
  ip_whitelist: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: any;
  onSubmit: (data: VendorFormValues) => void;
}

export function VendorModal({
  open,
  onOpenChange,
  vendor,
  onSubmit,
}: VendorModalProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      api_key: '',
      username: '',
      ip_whitelist: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        api_key: vendor.api_key,
        username: vendor.username,
        ip_whitelist: vendor.ip_whitelist || '',
      });
    } else {
      form.reset({
        name: '',
        api_key: '',
        username: '',
        ip_whitelist: '',
      });
    }
  }, [vendor, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {vendor ? 'Edit Vendor' : 'Add Vendor'}
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
                    <Input placeholder="Vendor Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ip_whitelist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Whitelist (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="127.0.0.1, 192.168.1.1"
                      className="resize-none"
                      {...field}
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
                {vendor ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
