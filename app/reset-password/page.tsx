'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const passwordResetSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createBrowserClient();

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setResetCode(code);
    }
  }, [searchParams]);

  const onSubmit = async (data: PasswordResetFormValues) => {
    if (!resetCode) {
      toast({
        title: 'Error',
        description: 'No reset code found.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await supabase.auth.getSession();

      // Then allow the user to set a new password
      await supabase.auth.updateUser({ password: data.password });

      toast({
        title: 'Success',
        description: 'Your password has been reset.',
      });
      router.push('/auth'); // Redirect to login page
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Password Reset</h1>
        <div className="flex flex-col items-center justify-center">
          <Link href="/">
            <Logo className="h-12 w-auto" />
          </Link>
          </div>
        {resetCode ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center text-red-500">
            <p>Invalid or expired reset link.</p>
            <Button variant="link" className="mt-4" onClick={() => router.push('/auth')}>
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
