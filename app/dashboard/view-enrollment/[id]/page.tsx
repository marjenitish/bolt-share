'use client';

import { jsPDF } from 'jspdf';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Enrollment {
  id: string;
  enrollment_type: string;
  status: string;
  payment_status: string;
  created_at: string;
  customers: {
    first_name: string;
    surname: string;
    email: string;
    contact_no: string;
  } | null;
  bookings: {
    id: string;
    booking_date: string;
    classes: {
      id: string;
      name: string;
      code: string;
      venue: string;
      start_time: string;
      end_time: string;
      fee_amount: number;
    } | null;
    payments: {
      id: string;
      amount: number;
      payment_method: string;
      payment_status: string;
      receipt_number: string;
      payment_date: string;
      notes: string;
    }[];
  }[];
}

export default function ViewEnrollmentPage() {
  const { id } = useParams<{ id: string }>();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!id) return;

    const fetchEnrollment = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(
          `
          id, enrollment_type, status, payment_status, created_at,
          customers (first_name, surname, email, contact_no),
          bookings (
            id, booking_date,
            classes (id, name, code, venue, start_time, end_time, fee_amount)
          ),
          payments:payments!enrollment_id (
            id,
            amount,
            payment_method,
            payment_status,
            transaction_id,
            receipt_number,
            payment_date,
            notes
          )
        `
        )
        .eq('id', id)
        .single();

      console.log("enrollment", data)

      if (error) {
        console.error('Error fetching enrollment:', error);
        setEnrollment(null);
      } else {
        setEnrollment(data as Enrollment);
      }
      setLoading(false);
    };

    fetchEnrollment();
  }, [id]);

  const exportReceiptToPdf = () => {
    if (!enrollment || !enrollment.payments || enrollment.payments.length === 0) {
      console.error('No payment data available to export.');
      return;
    }

    const doc = new jsPDF();
    let yPos = 10;

    doc.setFontSize(18);
    doc.text('Payment Receipt', 10, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text('Receipt For:', 10, yPos);
    doc.text(`${enrollment.customers?.first_name} ${enrollment.customers?.surname}`, 10, yPos + 5);
    doc.text(`${enrollment.customers?.email}`, 10, yPos + 10);
    if (enrollment.customers?.contact_no) {
      doc.text(`${enrollment.customers?.contact_no}`, 10, yPos + 15);
    }

    doc.text('Receipt Number:', 150, yPos, { align: 'right' });
    doc.text(`${enrollment.payments[0]?.receipt_number || 'N/A'}`, 150, yPos + 5, { align: 'right' });
    doc.text('Receipt Date:', 150, yPos + 10, { align: 'right' });
    const receiptDate = enrollment.payments[0]?.payment_date
      ? format(new Date(enrollment.payments[0]?.payment_date), 'dd/MM/yyyy HH:mm')
      : 'N/A';
    doc.text(receiptDate, 150, yPos + 15, { align: 'right' });

    yPos += 30;

    doc.setFontSize(14);
    doc.text('Items', 10, yPos);
    yPos += 5;

    doc.setFontSize(10);
    enrollment.bookings.forEach((booking, index) => {
      const itemY = yPos + (index * 10);
      doc.text(`${booking.classes?.code} - ${booking.classes?.name}`, 10, itemY);
      doc.text(format(new Date(booking.booking_date), 'dd/MM/yyyy'), 80, itemY);
      doc.text(`$${booking.classes?.fee_amount.toFixed(2)}`, 150, itemY, { align: 'right' });
    });

    yPos += (enrollment.bookings.length * 10) + 10;

    doc.setFontSize(12);
    doc.text('Total:', 150, yPos, { align: 'right' });
    doc.text(`$${totalCost.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 5;
    doc.setFontSize(10);
    doc.text('Amount Paid:', 150, yPos, { align: 'right' });
    doc.text(`$${totalPaid.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 5;
    doc.text('Payment Method:', 150, yPos, { align: 'right' });
    doc.text(`${enrollment.payments[0]?.payment_method || 'N/A'}`, 180, yPos, { align: 'right' });

    const filename = `Receipt_Enrollment_${enrollment.id.slice(0, 8)}.pdf`;
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center text-red-500">Enrollment not found.</div>
    );
  }

  const totalCost = enrollment.bookings.reduce(
    (sum, booking) => sum + (booking.classes?.fee_amount || 0),
    0
  );

  const totalPaid = enrollment?.payments[0].amount

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Enrollment Details (ID: {enrollment.id.slice(0, 8)})
      </h1>

      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment Information</TabsTrigger>
          <TabsTrigger value="bookings">Class Bookings</TabsTrigger>
          <TabsTrigger value="payment">Payment Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment Type</p>
                  <p className="text-base capitalize">{enrollment.enrollment_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="capitalize">{enrollment.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className="capitalize">{enrollment.payment_status}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="text-base">
                    {enrollment.customers?.first_name} {enrollment.customers?.surname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Email</p>
                  <p className="text-base">{enrollment.customers?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Contact</p>
                  <p className="text-base">{enrollment.customers?.contact_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Date</p>
                  <p className="text-base">
                    {format(new Date(enrollment.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Code</TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Class Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollment.bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No classes booked for this enrollment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollment.bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.classes?.code}</TableCell>
                        <TableCell>{booking.classes?.name}</TableCell>
                        <TableCell>
                          {format(new Date(booking.booking_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{booking.classes?.venue}</TableCell>
                        <TableCell className="text-right">
                          ${booking.classes?.fee_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payment Receipt</CardTitle>
                <button onClick={() => exportReceiptToPdf()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Export to PDF</button>
              <CardTitle>Payment Receipt</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Receipt For:</p>
                  <p className="text-lg font-semibold">
                    {enrollment.customers?.first_name} {enrollment.customers?.surname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.customers?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.customers?.contact_no}
                  </p>
                </div>
                <div className="space-y-2 text-left md:text-right">
                  <p className="text-sm text-muted-foreground">Receipt Number:</p>
                  <p className="text-lg font-semibold">
                    {enrollment.payments[0]?.receipt_number || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Receipt Date:</p>
                  <p className="text-base">
                    {enrollment.payments[0]?.payment_date
                      ? format(new Date(enrollment.payments[0]?.payment_date), 'dd/MM/yyyy HH:mm')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollment.bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.classes?.code} - {booking.classes?.name} ({booking.classes?.venue})
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.booking_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          ${booking.classes?.fee_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Amount Paid:</span>
                    <span>${totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Method:</span>
                    <span className="capitalize">
                      {enrollment.payments[0]?.payment_method || 'N/A'}
                    </span>
                  </div>
                  {enrollment.payments[0]?.transaction_id && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Transaction ID:</span>
                      <span>{enrollment.payments[0]?.transaction_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {enrollment.payments[0]?.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.payments[0]?.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}