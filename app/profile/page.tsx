'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Navigation } from '@/components/shared/navigation';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Edit, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { PAQProfileForm } from '@/components/profile/paq-profile-form';
import { CancelBookingModal } from '@/components/bookings/cancel-booking-modal';
import { PAQModal } from '@/components/profile/paq-modal';
import { format } from 'date-fns';
import { TerminationModal } from '@/components/customers/termination-modal';
import { getDayName } from '@/lib/utils';
import Link from 'next/link';

const customerSchema = z.object({
  surname: z.string().min(1, 'Surname is required'),
  first_name: z.string().min(1, 'First name is required'),
  street_number: z.string().optional(),
  street_name: z.string().optional(),
  suburb: z.string().optional(),
  post_code: z.string().optional(),
  contact_no: z.string().optional(),
  email: z.string().email('Invalid email address'),
  country_of_birth: z.string().optional(),
  date_of_birth: z.string().optional(),
  work_mobile: z.string().optional(),
  australian_citizen: z.boolean().default(false),
  language_other_than_english: z.string().optional(),
  english_proficiency: z.enum(['Very Well', 'Well', 'Not Well', 'Not at All']).optional(),
  indigenous_status: z.enum(['Yes', 'No', 'Prefer not to say']).optional(),
  reason_for_class: z.string().optional(),
  how_did_you_hear: z.string().optional(),
  occupation: z.string().optional(),
  next_of_kin_name: z.string().optional(),
  next_of_kin_relationship: z.string().optional(),
  next_of_kin_mobile: z.string().optional(),
  next_of_kin_phone: z.string().optional(),
});

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPAQModalOpen, setIsPAQModalOpen] = useState(false);
  const [terminationRequest, setTerminationRequest] = useState<any>(null);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      surname: '',
      first_name: '',
      email: '',
      australian_citizen: false,
      english_proficiency: 'Well',
      indigenous_status: 'Prefer not to say',
    },
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        setUser(user);

        // Get user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Get customer profile if exists
        const { data: customerProfile } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (customerProfile) {
          setCustomer(customerProfile);
          form.reset(customerProfile);

          console.log("customerProfile", customerProfile)

          // Step 1: Fetch enrollments for the customer
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('customer_id', customerProfile.id);

          if (enrollmentsError) {
            console.error('Error fetching enrollments:', enrollmentsError);
            return;
          }

          const enrollmentIds = enrollments.map((e: any) => e.id);

          // Step 2: Fetch bookings using the enrollment IDs
          const { data: bookingsData, error: bookingsError } = await supabase
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
            .in('enrollment_id', enrollmentIds)
            .order('created_at', { ascending: false });

          if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError);
          }

          console.log("bookingsData", bookingsData)

          setBookings(bookingsData || []);

          // Fetch payments
          const { data: paymentsData } = await supabase
            .from('payments')
            .select(`
              *,
              enrollments (
                id
              )
            `)
            .in('enrollment_id', enrollmentIds)
            .order('payment_date', { ascending: false });

          setPayments(paymentsData || []);

          // Fetch active termination request
          const { data: terminationData, error: terminationError } = await supabase
            .from('terminations')
            .select('*')
            .eq('customer_id', customerProfile.id)
            .in('status', ['pending', 'accepted']) // Assuming these are the statuses for active requests
            .single();

          if (!terminationError && terminationData) setTerminationRequest(terminationData);
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    };

    getProfile();
  }, [refreshKey]);

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    if (!user) return;

    setSubmitting(true);
    try {
      if (customer) {
        // Update existing customer profile
        const { error } = await supabase
          .from('customers')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      } else {
        // Create new customer profile
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...values,
            user_id: user.id,
            status: 'Active',
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Profile created successfully',
        });
      }
      setEditing(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePAQSubmit = async (data: any) => {
    setIsPAQModalOpen(false);
  };

  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancellationSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTerminationSuccess = () => {
    setIsTerminationModalOpen(false);
    // Optionally refresh customer data if needed, or rely on the modal's toast for feedback
  };

  const openImageLink = async (fileName: string) => {
    const { data, error } = await supabase
      .storage
      .from('customers')
      .createSignedUrl(fileName, 10);
  
    if (data?.signedUrl) {
      //const fullUrl = `https://pfoargdymscqqrekzref.supabase.co${data.signedUrl}`;
      window.open(data.signedUrl, '_blank');
    } else {
      console.error('Failed to generate signed URL:', error?.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!customer && !editing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
            <p className="text-muted-foreground mb-8">
              Please complete your profile to access all features.
            </p>
            <Button onClick={() => setEditing(true)}>
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">
                {customer ? 'Edit Profile' : 'Complete Profile'}
              </h1>
              {customer && (
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>

            <Card className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surname</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="street_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="suburb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suburb</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="post_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="country_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="work_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Mobile</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Next of Kin</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="next_of_kin_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="next_of_kin_relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="next_of_kin_mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="next_of_kin_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {customer ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      customer ? 'Update Profile' : 'Create Profile'
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">

            <div className="flex items-center gap-6"></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="destructive" onClick={() => setIsTerminationModalOpen(true)} disabled={!!terminationRequest}>
                {!terminationRequest ? "Terminate Account" : `Terminate: ${terminationRequest.status}`}
              </Button>
            </div>
          </div>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name} />
                <AvatarFallback>{userProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{customer.first_name} {customer.surname}</h1>
                <p className="text-muted-foreground">{customer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>Active Member</Badge>
                  <Badge variant="outline">ID: {customer.id.slice(0, 8)}</Badge>
                  <Badge variant="secondary">Credits: {customer.customer_credit}</Badge>

                  {customer.paq_status == 'pending' ?
                    <Badge variant={'destructive'} onClick={() => openImageLink(customer.paq_document_url)}>
                    PAQ FORM: In-Review
                  </Badge>
                    : null}

                  {customer.paq_status == 'accepted' ?
                    <Badge variant={'default'}>
                      PAQ FORM: Completed
                    </Badge>
                    : null}

                  {(customer.paq_status == 'rejected' || customer.paq_status == null) ?
                    <Badge variant={'destructive'} onClick={() => setIsPAQModalOpen(true)}>
                      PAQ FORM: {'Not Completed'}
                    </Badge>
                    : null}

                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Personal Details</TabsTrigger>
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
                    <div>
                      <dt className="text-sm text-muted-foreground">Australian Citizen</dt>
                      <dd>{customer.australian_citizen ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Language Other Than English</dt>
                      <dd>{customer.language_other_than_english || 'None'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">English Proficiency</dt>
                      <dd>{customer.english_proficiency || 'Not specified'}</dd>
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
                    <div>
                      <dt className="text-sm text-muted-foreground">Country of Birth</dt>
                      <dd>{customer.country_of_birth || 'Not provided'}</dd>
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
                      <dt className="text-sm text-muted-foreground">Indigenous Status</dt>
                      <dd>{customer.indigenous_status || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Occupation</dt>
                      <dd>{customer.occupation || 'Not provided'}</dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
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

            <TabsContent value="bookings">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Bookings</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">{booking.classes?.name}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {getDayName(booking.classes?.day_of_week)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.classes?.start_time} - {booking.classes?.end_time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.classes?.venue}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant={booking.is_free_trial ? 'secondary' : 'default'}>
                                {booking.is_free_trial ? 'Trial' : booking.term}
                              </Badge>
                              {booking.booking_date && (
                                <Badge variant="outline">
                                  {format(new Date(booking.booking_date), 'dd/MM/yyyy')}
                                </Badge>
                              )}
                              {booking.cancellation_status && (
                                <Badge
                                  variant={
                                    booking.cancellation_status === 'pending' ? 'secondary' :
                                      booking.cancellation_status === 'accepted' ? 'default' : 'destructive'
                                  }
                                >
                                  Cancellation: {booking.cancellation_status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!booking.cancellation_status && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking)}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {booking.cancellation_reason && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium">Cancellation Reason:</p>
                            <p className="text-sm text-muted-foreground">{booking.cancellation_reason}</p>
                            {booking.medical_certificate_url && (
                              <div className="mt-2">
                                <a
                                  href={booking.medical_certificate_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  View Medical Certificate
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any bookings yet.</p>
                    <Button className="mt-4" asChild>
                      <a href="/search">Find Classes</a>
                    </Button>
                  </div>
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
      </div>

      <CancelBookingModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        booking={selectedBooking}
        onCancel={handleCancellationSubmitted}
      />
      <TerminationModal
        open={isTerminationModalOpen}
        onOpenChange={setIsTerminationModalOpen}
        customerId={customer?.id}
        onTerminationSuccess={handleTerminationSuccess}
      />
      <PAQModal
        open={isPAQModalOpen}
        onOpenChange={setIsPAQModalOpen}
        customerId={customer?.id}
        onCancel={handlePAQSubmit}
      />
    </div>
  );
}