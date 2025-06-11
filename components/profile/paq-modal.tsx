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
  paqDocument: z.any().optional(),
});

type PaqFormValues = z.infer<typeof cancelSchema>;

interface PAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onCancel: () => void;
}

export function PAQModal({
  open,
  onOpenChange,
  customerId,
  onCancel,
}: PAQModalProps) {
  const [uploading, setUploading] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<PaqFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      paqDocument: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(file);
    }
  };

  const onSubmit = async (data: PaqFormValues) => {
    console.log("XXX")
    if (!customerId) {
      toast({
        title: 'Error',
        description: 'Customer ID is missing.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploading(true);
      
      let paqDocumentUrl = '';
      let fileName = '';
      
      // Upload medical certificate if provided
      if (fileSelected) {
        fileName = `paq_documents/${customerId}_${Date.now()}_${fileSelected.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customers')
          .upload(fileName, fileSelected, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('customers')
          .getPublicUrl(fileName);
          
        paqDocumentUrl = urlData.publicUrl;
      }
      
      // Update booking with cancellation details
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          paq_document_url: fileName,
          paq_status: 'pending',
          paq_filled_date: new Date().toISOString(),
          paq_form: true
        })
        .eq('id', customerId);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Customer PAQ uploaded successfully',
        description: 'Your Customer PAQ uploaded successfully for review.',
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
          <DialogTitle>Upload PAQ</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">                                    
            <FormField
              control={form.control}
              name="paqDocument"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>PAQ Document (Signed By Doctor)</FormLabel>
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
                    Upload doctor signed PAQ form to be eligible for enrollments.
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