'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/enrollment/payment-form'; // Import the Stripe PaymentForm
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navigation } from '@/components/shared/navigation';

// Load your Stripe publishable key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function EnrollPage() {
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [enrollment, setEnrollment] = useState<any>(null); // State to hold the created enrollment
  const [isCreatingEnrollment, setIsCreatingEnrollment] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const supabase = createBrowserClient();

  // Fetch logged-in user and customer profile
  useEffect(() => {
    const getProfile = async () => {
      setLoadingCustomer(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth'); // Redirect to auth if not logged in
        return;
      }
      setUser(user);

      const { data: customerProfile, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching customer profile:', error);
        toast({
          title: 'Error',
          description:
            'Could not load your profile. Please ensure your profile is complete.',
          variant: 'destructive',
        });
        // Optionally redirect or show a message to complete profile
      } else {
        setCustomer(customerProfile);
      }

      if (!customerProfile) {
        toast({
          title: 'Profile Incomplete',
          description:
            'Please complete your customer profile before enrolling.',
          variant: 'destructive',
        });
        router.push('/profile'); // Redirect to profile to complete
        return;
      }
  
      if (customerProfile.paq_status == 'pending') {
        toast({
          title: 'PAQ Form in review',
          description:
            'Your PAQ Form is in review.',
          variant: 'destructive',
        });
        router.push('/profile'); // Redirect to profile to complete
        return;
      }
  
      if (customerProfile.paq_status == 'rejected' || customerProfile.paq_status == null) {
        toast({
          title: 'PAQ Form not uploaded.',
          description:
            'Your PAQ Form not uploaded.',
          variant: 'destructive',
        });
        router.push('/profile'); // Redirect to profile to complete
        return;
      }


      setLoadingCustomer(false);
    };

    getProfile();
  }, [router, supabase, toast]); // Added supabase and toast to dependencies

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      const { data, error } = await supabase
        .from('classes')
        .select(
          'id, name, code, date, start_time, end_time, venue, fee_amount'
        )
        .order('name')
        .order('code')
        .order('date');

      if (error) {
        console.error('Error fetching classes:', error);
        setAvailableClasses([]);
      } else {
        setAvailableClasses(data || []);
      }
      setLoadingClasses(false);
    };

    fetchClasses();
  }, [supabase]); // Added supabase to dependencies

  useEffect(() => {
    const calculatedTotal = selectedClasses.reduce(
      (sum, cls) => sum + cls.fee_amount,
      0
    );
    setTotalAmount(calculatedTotal);
  }, [selectedClasses]);


  const handleClassSelect = (classData: any) => {
    setSelectedClasses((prevSelected) => {
      const isSelected = prevSelected.some((cls) => cls.id === classData.id);
      if (isSelected) {
        return prevSelected.filter((cls) => cls.id !== classData.id);
      } else {
        return [...prevSelected, classData];
      }
    });
  };

  const handleProceedToPayment = async () => {
    if (!customer) {
      toast({
        title: 'Profile Incomplete',
        description:
          'Please complete your customer profile before enrolling.',
        variant: 'destructive',
      });
      router.push('/profile'); // Redirect to profile to complete
      return;
    }

    if (customer.paq_status == 'pending') {
      toast({
        title: 'PAQ Form in review',
        description:
          'Your PAQ Form is in review.',
        variant: 'destructive',
      });
      router.push('/profile'); // Redirect to profile to complete
      return;
    }

    if (customer.paq_status == 'rejected' || customer.paq_status == null) {
      toast({
        title: 'PAQ Form not uploaded.',
        description:
          'Your PAQ Form not uploaded.',
        variant: 'destructive',
      });
      router.push('/profile'); // Redirect to profile to complete
      return;
    }



    if (selectedClasses.length === 0) {
      toast({
        title: 'No Classes Selected',
        description: 'Please select at least one class to enroll.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingEnrollment(true);

    try {
      // 1. Create enrollment record (status pending payment)
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([
          {
            customer_id: customer.id,
            enrollment_type: 'direct', // Or 'online' if you distinguish
            status: 'pending', // Status is pending until payment is complete
            payment_status: 'pending',
            // payment_intent will be added by the PaymentForm callback
          },
        ])
        .select()
        .single();

      if (enrollmentError || !enrollmentData)
        throw enrollmentError || new Error('Failed to create enrollment');

      setEnrollment(enrollmentData);
      // The PaymentForm will handle creating bookings and payment after successful payment intent

    } catch (error: any) {
      console.error('Enrollment creation error:', error);
      toast({
        title: 'Error',
        description: `Failed to initiate enrollment: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingEnrollment(false);
    }
  };

  // Function to call after successful payment and booking creation
  const handlePaymentSuccess = () => {
    toast({
      title: 'Enrollment Complete',
      description: 'Your enrollment has been successfully processed!',
    });
    router.push('/profile?tab=bookings'); // Redirect to customer profile bookings tab
  };



  return (
    <div className="min-h-screen bg-background">
      <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enroll in Classes</h1>

      {loadingCustomer || loadingClasses ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {!customer ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Please complete your customer profile before enrolling in classes.
                </p>
                <Button asChild>
                  <a href="/profile">Go to Profile</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Filter classes by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {Object.entries(
                      availableClasses
                        .filter(
                          (cls) =>
                            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cls.code.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .reduce((acc, cls) => {
                          const groupKey = `${cls.name} - ${cls.code}`;
                          if (!acc[groupKey]) {
                            acc[groupKey] = [];
                          }
                          acc[groupKey].push(cls);
                          return acc;
                        }, {} as Record<string, any[]>)
                    ).map(([groupKey, classesInGroup]) => (
                      <Collapsible
                        key={groupKey}
                        open={openGroups[groupKey]}
                        onOpenChange={(open) =>
                          setOpenGroups({ ...openGroups, [groupKey]: open })
                        }
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 bg-muted rounded-md text-left font-semibold">
                          {groupKey} ({classesInGroup.length} sessions)
                          {openGroups[groupKey] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 pl-4 space-y-2">
                          {classesInGroup.map((cls) => (
                            <div key={cls.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`class-${cls.id}`}
                                checked={selectedClasses.some(
                                  (selected) => selected.id === cls.id
                                )}
                                onCheckedChange={() => handleClassSelect(cls)}
                              />
                              <Label htmlFor={`class-${cls.id}`} className="cursor-pointer flex-grow">
                                <span className="font-medium">{format(new Date(cls.date), 'PPP')}</span>{' '}
                                ({cls.start_time.substring(0, 5)} -{' '}
                                {cls.end_time?.substring(0, 5)}) -{' '}
                                {cls.venue} (${cls.fee_amount})
                              </Label>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                    {!loadingClasses &&
                      Object.keys(
                        availableClasses
                          .filter(
                            (cls) =>
                              cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cls.code.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .reduce((acc, cls) => {
                            const groupKey = `${cls.name} - ${cls.code}`;
                            if (!acc[groupKey]) {
                              acc[groupKey] = [];
                            }
                            acc[groupKey].push(cls);
                            return acc;
                          }, {} as Record<string, any[]>)
                      ).length === 0 && (
                        <p className="text-center text-muted-foreground">
                          No classes found.
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Enrollment Summary & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedClasses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Classes:</p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {selectedClasses.map((cls) => (
                          <li key={cls.id}>
                            {cls.name} ({cls.code}) -{' '}
                            {format(new Date(cls.date), 'PPP')} (${cls.fee_amount})
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Total Selected Classes: {selectedClasses.length}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                  </div>

                  {/* Show payment button or form based on enrollment state */}
                  {!enrollment ? (
                    <Button
                      onClick={handleProceedToPayment}
                      disabled={selectedClasses.length === 0 || isCreatingEnrollment}
                    >
                      {isCreatingEnrollment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Initiating Payment...
                        </>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </Button>
                  ) : (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        selectedClasses={selectedClasses}
                        enrollmentId={enrollment.id}
                        enrollmentData={enrollment}
                        totalAmount={totalAmount}
                        onComplete={handlePaymentSuccess}
                        customer={customer}
                      />
                    </Elements>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
    </div>
  );
}