// app/api/stripe/webhook/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.created':
        // Log the creation of a new payment intent
        console.log('Payment intent created:', event.data.object.id);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const enrollmentId = paymentIntent.metadata.enrollmentId;
        const selectedClassIdsString = paymentIntent.metadata.selectedClasses;

        // 1. Update enrollment status
        const { error: enrollmentUpdateError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'paid',
            payment_intent: paymentIntent.id,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollmentId);

        // Update enrollment status
        const { error: successError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'paid',
            payment_intent: paymentIntent.id,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentIntent.metadata.enrollmentId);

        if (successError) throw successError;

        if (enrollmentUpdateError) throw enrollmentUpdateError;

        // 2. Create bookings for each selected class
        const selectedClassIds = selectedClassIdsString.split(',');
        const bookingsToInsert = [];

        for (const classId of selectedClassIds) {
          // Fetch class details to get the date
          const { data: classDetails, error: classDetailsError } = await supabase
            .from('classes')
            .select('id, date')
            .eq('id', classId)
            .single();

          if (classDetailsError) {
            console.error(`Error fetching class ${classId}:`, classDetailsError);
            // Decide how to handle this - skip booking or throw an error
            continue;
          }

          bookingsToInsert.push({
            enrollment_id: enrollmentId,
            class_id: classId,
            booking_date: classDetails.date,
            term: 'Term1', // Assuming a default term
            is_free_trial: false, // Assuming paid enrollment is not a free trial
          });
        }

        if (bookingsToInsert.length > 0) {
          const { error: bookingsError } = await supabase
            .from('bookings')
            .insert(bookingsToInsert);

          if (bookingsError) throw bookingsError;
        }

        // 3. Create payment row
        const { data: receiptNumber, error: receiptError } = await supabase
          .rpc('generate_receipt_number'); // Assuming you have this Supabase function

        if (receiptError) throw receiptError;

         // Insert payment record
         const { error: paymentError } = await supabase
         .from('payments')
         .insert({
           enrollment_id: enrollmentId,
           amount: paymentIntent.amount,
           payment_method: 'stripe',
           payment_status: 'completed',
           transaction_id: paymentIntent.id,
           receipt_number: receiptNumber,
           payment_date: new Date().toISOString(),
           notes: `Payment for class: ${enrollmentId}`,
         });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;

        // Update enrollment status to failed
        const { error: failureError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', failedPayment.metadata.enrollmentId);

        if (failureError) throw failureError;
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;

        // Update enrollment status to cancelled
        const { error: cancelError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'cancelled',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', canceledPayment.metadata.enrollmentId);

        if (cancelError) throw cancelError;
        break;

      case 'payment_intent.requires_action':
        // Handle additional authentication required
        const actionRequired = event.data.object as Stripe.PaymentIntent;
        console.log('Additional authentication required for:', actionRequired.id);
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Refund;

        // Update enrollment status to refunded
        const { error: refundError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'refunded',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', (refund.metadata as any).enrollmentId);

        if (refundError) throw refundError;
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;

        // Mark the enrollment as disputed
        const { error: disputeError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'disputed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', (dispute.metadata as any).enrollmentId);

        if (disputeError) throw disputeError;
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}