import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(data: {
  amount: number;
  currency: string;
  classId: string;
  enrollmentData: any;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      metadata: {
        classId: data.classId,
        customerEmail: data.enrollmentData.email,
        customerName: `${data.enrollmentData.firstName} ${data.enrollmentData.lastName}`,
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    throw new Error(error.message);
  }
}