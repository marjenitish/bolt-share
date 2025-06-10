'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe with publishable key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
  : null;

interface CheckoutFormProps {
  selectedClasses: any[];
  enrollmentData: any;
  enrollmentId: string;
  onComplete: () => void;
  totalAmount: number;
  customer: any;
}

function CheckoutForm({ selectedClasses, enrollmentData, enrollmentId, onComplete, totalAmount, customer }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Submit the Elements form first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Create payment intent
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          currency: 'aud',
          metadata: {
            selectedClasses: selectedClasses.map(cls => cls.id).join(','),
            enrollmentId: enrollmentId,
            customerEmail: customer.email,
            customerName: `${customer.first_name} ${customer.surname}`,
            classCount: selectedClasses.length,
            classIds: selectedClasses.map(cls => cls.id).join(',')
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const { clientSecret } = await response.json();

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/enrollment/confirmation`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      toast({
        title: 'Payment successful',
        description: 'Your enrollment is complete!',
      });
      onComplete();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Payment failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

interface PaymentFormProps {
  selectedClasses: any[];
  enrollmentData: any;
  enrollmentId: string;
  onComplete: () => void;
  customer: any;
}

export function PaymentForm({ selectedClasses, enrollmentData, enrollmentId, onComplete, customer }: PaymentFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Calculate total amount
  const totalAmount = selectedClasses.reduce((sum, cls) => sum + cls.fee_amount, 0);

  // Only render if we have a positive amount
  if (totalAmount <= 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Payment</h2>
          <p className="text-muted-foreground">
            No payment is required for this enrollment.
          </p>
        </div>
        <Button onClick={onComplete} className="w-full">
          Complete Enrollment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment</h2>
        <p className="text-muted-foreground">
          Complete your enrollment by making the payment.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Selected Classes</h3>
            {selectedClasses.map((cls) => (
              <div key={cls.id} className="flex justify-between items-start border-b pb-3">
                <div>
                  <h4 className="font-medium">{cls.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {cls.day_of_week === 1 ? 'Monday' : 
                     cls.day_of_week === 2 ? 'Tuesday' : 
                     cls.day_of_week === 3 ? 'Wednesday' : 
                     cls.day_of_week === 4 ? 'Thursday' : 
                     cls.day_of_week === 5 ? 'Friday' : 
                     cls.day_of_week === 6 ? 'Saturday' : 'Sunday'} • {cls.start_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${cls.fee_amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 font-bold">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t pt-6">
            {stripePromise && totalAmount > 0 ? (
              <Elements 
                stripe={stripePromise} 
                options={{
                  mode: 'payment',
                  amount: Math.round(totalAmount * 100),
                  currency: 'aud',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0066cc',
                      colorBackground: '#ffffff',
                      colorText: '#1a1a1a',
                    },
                  },
                }}
              >
                <CheckoutForm 
                  selectedClasses={selectedClasses}
                  enrollmentData={enrollmentData}
                  enrollmentId={enrollmentId}
                  onComplete={onComplete}
                  totalAmount={totalAmount}
                  customer={customer}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Payment system is not available.</p>
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}