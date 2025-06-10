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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const cancelSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason for cancellation'),
  medicalCertificate: z.any().optional(),
});

type CancelFormValues = z.infer<typeof cancelSchema>;

interface CancelBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onCancel: () => void;
}

export function CancelBookingModal({
  open,
  onOpenChange,
  booking,
  onCancel,
}: CancelBookingModalProps) {
  const [uploading, setUploading] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: '',
      medicalCertificate: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(file);
    }
  };

  const onSubmit = async (data: CancelFormValues) => {
    if (!booking) return;
    
    try {
      setUploading(true);
      
      let medicalCertificateUrl = '';
      
      // Upload medical certificate if provided
      if (fileSelected) {
        const fileName = `medical_certificates/${booking.id}_${Date.now()}_${fileSelected.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bookings')
          .upload(fileName, fileSelected, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('bookings')
          .getPublicUrl(fileName);
          
        medicalCertificateUrl = urlData.publicUrl;
      }
      
      // Update booking with cancellation details
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          cancellation_reason: data.reason,
          medical_certificate_url: medicalCertificateUrl,
          cancellation_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Cancellation Request Submitted',
        description: 'Your cancellation request has been submitted for review.',
      });
      
      onCancel();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
              <p className="text-lg font-medium">{booking?.classes?.name}</p>
              <p className="text-sm text-muted-foreground">
                {booking?.classes?.start_time} - {booking?.classes?.end_time} • {booking?.classes?.venue}
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Cancellation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed reason for cancellation..."
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
              name="medicalCertificate"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Medical Certificate (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          handleFileChange(e);
                          onChange(e.target.files?.[0]);
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Upload a medical certificate to support your cancellation request.
                    Accepted formats: PDF, JPG, PNG.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}