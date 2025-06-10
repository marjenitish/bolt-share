'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PAQProfileForm } from '@/components/profile/paq-profile-form';
import { getDayName } from '@/lib/utils';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .single();

        if (customerError) throw customerError;
        setCustomer(customerData);

        if (customerData.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', customerData.user_id)
            .single();
          setUserProfile(userData);
        }

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            classes (
              id,
              name,
              venue,
              day_of_week,
              start_time,
              end_time,
              instructors (
                name
              )
            )
          `)
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);

        const { data: paymentsData } = await supabase
          .from('payments')
          .select(`
            *,
            bookings (
              id,
              classes (
                name
              )
            )
          `)
          .eq('booking_id', bookingsData?.map(b => b.id))
          .order('payment_date', { ascending: false });

        setPayments(paymentsData || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Customer Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile?.avatar_url} alt={customer.first_name} />
            <AvatarFallback>{customer.first_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{customer.first_name} {customer.surname}</h1>
            <p className="text-muted-foreground">{customer.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{customer.status}</Badge>
              <Badge variant="outline">ID: {customer.id.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="medical">Medical Information</TabsTrigger>
          <TabsTrigger value="paq">Pre-Activity Questionnaire</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd>{customer.contact_no || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Work Mobile</dt>
                  <dd>{customer.work_mobile || 'Not provided'}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Street Address</dt>
                  <dd>{customer.street_number} {customer.street_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Suburb</dt>
                  <dd>{customer.suburb}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Post Code</dt>
                  <dd>{customer.post_code}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd>{customer.date_of_birth ? format(new Date(customer.date_of_birth), 'dd/MM/yyyy') : 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Country of Birth</dt>
                  <dd>{customer.country_of_birth || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Occupation</dt>
                  <dd>{customer.occupation || 'Not provided'}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Next of Kin</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd>{customer.next_of_kin_name || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Relationship</dt>
                  <dd>{customer.next_of_kin_relationship || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Contact</dt>
                  <dd>{customer.next_of_kin_mobile || customer.next_of_kin_phone || 'Not provided'}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical">
          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Medical History</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">PAQ Form Status</h4>
                    <p className="text-sm text-muted-foreground">Pre-Activity Questionnaire</p>
                  </div>
                  <Badge variant={customer.paq_form ? 'default' : 'destructive'}>
                    {customer.paq_form ? 'Completed' : 'Not Completed'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="paq">
          <PAQProfileForm 
            onSubmit={() => {}}
            defaultValues={{
              fullName: `${customer.first_name} ${customer.surname}`,
              dateOfBirth: customer.date_of_birth,
            }}
            readOnly
          />
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bookings History</h3>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{booking.classes?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getDayName(booking.classes?.day_of_week)} at {booking.classes?.start_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.classes?.venue} • {booking.classes?.instructors?.name}
                      </p>
                    </div>
                    <Badge variant={booking.is_free_trial ? 'secondary' : 'default'}>
                      {booking.is_free_trial ? 'Trial' : booking.term}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bookings found.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Receipt #{payment.receipt_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.bookings?.classes?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {payment.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment records found.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}