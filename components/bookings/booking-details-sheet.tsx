'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Plus, Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from './payment-modal';
import { PaymentList } from './payment-list';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface BookingDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onEdit: () => void;
  onRefresh?: () => void;
}

export function BookingDetailsSheet({
  open,
  onOpenChange,
  booking,
  onEdit,
  onRefresh
}: BookingDetailsSheetProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;
  
  const supabase = createBrowserClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      onOpenChange(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddPayment = async (data: any) => {
    try {
      const { error } = await supabase.from('payments').insert([{
        booking_id: booking.id,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_status: 'completed',
        transaction_id: data.transactionId,
        payment_date: data.paymentDate,
        notes: data.notes,
        receipt_number: await generateReceiptNumber(),
      }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
      setIsPaymentModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generateReceiptNumber = async () => {
    const { data, error } = await supabase
      .rpc('generate_receipt_number');
    
    if (error) throw error;
    return data;
  };

  const handleDownloadReceipt = (payment: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(24);
    doc.text('SHARE CRM', 20, 20);
    
    // Receipt details
    doc.setFontSize(14);
    doc.text(`Receipt #${payment.receipt_number}`, 20, 35);
    doc.text(format(new Date(payment.payment_date), 'dd.MM.yyyy HH:mm'), 140, 35);
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Customer Details
    doc.setFontSize(12);
    doc.text('Customer:', 20, 60);
    doc.setTextColor(100, 100, 100);
    doc.text(`${booking.enrollments?.customers?.surname}, ${booking.enrollments?.customers?.first_name}`, 20, 67);
    
    // Class Details
    doc.setTextColor(0, 0, 0);
    doc.text('Class Details:', 20, 100);
    doc.setTextColor(100, 100, 100);
    doc.text(`Class: ${booking.classes?.name}`, 20, 107);
    doc.text(`Instructor: ${booking.classes?.instructors?.name}`, 20, 114);
    doc.text(`Term: ${booking.term}`, 20, 121);
    doc.text(`Venue: ${booking.classes?.venue}`, 20, 128);
    doc.text(`Date: ${format(new Date(booking.booking_date), 'dd.MM.yyyy')}`, 20, 135);
    
    // Payment Details
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Details:', 20, 147);
    doc.setTextColor(100, 100, 100);
    
    // Create a table for payment details
    const paymentDetails = [
      ['Amount:', `$${payment.amount.toFixed(2)}`],
      ['Payment Method:', payment.payment_method.toUpperCase()],
      ['Status:', payment.payment_status.toUpperCase()],
      ['Transaction ID:', payment.transaction_id || 'N/A']
    ];
    
    let yPos = 154;
    paymentDetails.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.text(value, 70, yPos);
      yPos += 7;
    });
    
    // Notes
    if (payment.notes) {
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 20, yPos + 10);
      doc.setTextColor(100, 100, 100);
      doc.text(payment.notes, 20, yPos + 17);
    }
    
    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Thank you for choosing SHARE CRM!', 20, 270);
    
    // QR Code placeholder (you can add actual QR code implementation if needed)
    doc.rect(140, 240, 30, 30);
    
    // Company Details
    doc.setTextColor(100, 100, 100);
    doc.text('SHARE CRM', 20, 280);
    doc.text('123 Exercise Street, Fitness VIC 3000', 20, 285);
    doc.text('support@sharecrm.com | 1800 XXX XXX', 20, 290);
    
    // Save PDF
    doc.save(`receipt-${payment.receipt_number}.pdf`);
  };

  const handleAcceptCancellation = async () => {
    setProcessing(true);
    try {
      // First update the booking cancellation status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          cancellation_status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      // Then increment the customer's credit
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          customer_credit: booking.enrollments?.customers?.customer_credit + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.enrollments?.customers?.id);

      if (customerError) throw customerError;

      toast({
        title: 'Success',
        description: 'Cancellation accepted and credit added to customer',
      });
      
      setIsConfirmDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectCancellation = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          cancellation_status: 'rejected',
          cancellation_reject_reason: rejectReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Cancellation request rejected',
      });
      
      setIsRejectDialogOpen(false);
      setRejectReason('');
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = booking.classes?.fee_amount || 0;
  const totalPaid = booking.payments?.reduce((sum: number, payment: any) => 
    sum + (payment.payment_status === 'completed' ? payment.amount : 0), 0) || 0;
  const remainingAmount = totalAmount - totalPaid;

  const isTrialClass = booking.enrollments?.enrollment_type === 'trial';
  const hasCancellationRequest = !!booking.cancellation_status;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payments" disabled={isTrialClass}>Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                <p className="text-lg font-medium">{booking.classes?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.classes?.start_time} - {booking.classes?.end_time} • {booking.classes?.venue}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p className="text-lg font-medium">
                  {booking.enrollments?.customers?.surname}, {booking.enrollments?.customers?.first_name}
                </p>
                {booking.enrollments?.customers?.customer_credit > 0 && (
                  <Badge variant="secondary">
                    Available Credits: {booking.enrollments?.customers?.customer_credit}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Instructor</h3>
                <p className="text-lg font-medium">{booking.classes?.instructors?.name}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Term</h3>
                <p className="text-lg font-medium">{booking.term}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Booking Date</h3>
                <p className="text-lg font-medium">
                  {booking.booking_date ? format(new Date(booking.booking_date), "dd/MM/yyyy") : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <Badge variant={isTrialClass ? "secondary" : "default"}>
                  {isTrialClass ? "Free Trial" : "Regular Class"}
                </Badge>
              </div>

              {/* Cancellation Information */}
              {hasCancellationRequest && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Cancellation Request</h3>
                  <Badge 
                    variant={
                      booking.cancellation_status === 'pending' ? 'secondary' :
                      booking.cancellation_status === 'accepted' ? 'default' : 'destructive'
                    }
                  >
                    {booking.cancellation_status.charAt(0).toUpperCase() + booking.cancellation_status.slice(1)}
                  </Badge>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium">Reason:</p>
                    <p className="text-sm text-muted-foreground">{booking.cancellation_reason}</p>
                  </div>
                  
                  {booking.medical_certificate_url && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Medical Certificate:</p>
                      <a 
                        href={booking.medical_certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        View Certificate
                      </a>
                    </div>
                  )}
                  
                  {booking.cancellation_reject_reason && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground">{booking.cancellation_reject_reason}</p>
                    </div>
                  )}
                  
                  {booking.cancellation_status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setIsConfirmDialogOpen(true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </TabsContent>
            
            {!isTrialClass && (
              <TabsContent value="payments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-medium">
                        ${totalPaid.toFixed(2)} / ${totalAmount.toFixed(2)}
                      </span>
                      {remainingAmount > 0 && (
                        <span className="text-sm text-muted-foreground">
                          (${remainingAmount.toFixed(2)} remaining)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setIsPaymentModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </div>

                <PaymentList 
                  payments={booking.payments} 
                  onDownloadReceipt={handleDownloadReceipt}
                />
              </TabsContent>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>
      
      {!isTrialClass && (
        <PaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          onSubmit={handleAddPayment}
          remainingAmount={remainingAmount}
        />
      )}
      
      {/* Confirm Accept Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Cancellation Request</DialogTitle>
            <DialogDescription>
              This will accept the cancellation request and add 1 credit to the customer's account.
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleAcceptCancellation} disabled={processing}>
              {processing ? 'Processing...' : 'Accept Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cancellation Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this cancellation request.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectCancellation} 
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? 'Processing...' : 'Reject Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}