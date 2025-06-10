'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client'; // Assuming you have a Supabase client
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// Import other components you might need for the page structure

export default function CreateEnrollmentPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true); // Add loading state
  const [loadingClasses, setLoadingClasses] = useState(true); // Add loading state
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque'>('cash');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, surname, email') // Select necessary fields
        .order('surname');

      if (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } else {
        setCustomers(data || []);
      }
      setLoadingCustomers(false);
    };

    fetchCustomers();
  }, []); // Empty dependency array to fetch only once on mount

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, code, date, start_time, end_time, venue, fee_amount')
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
  }, []);

  useEffect(() => {
    const calculatedTotal = selectedClasses.reduce((sum, cls) => sum + cls.fee_amount, 0);
    setTotalAmount(calculatedTotal);
  }, [selectedClasses]);

  const handleCompleteEnrollment = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer.'); // Replace with a toast or better UI
      return;
    }
    if (selectedClasses.length === 0) {
      alert('Please select at least one class.'); // Replace with a toast or better UI
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([
          {
            customer_id: selectedCustomer,
            enrollment_type: 'direct', // Assuming 'direct' for manual enrollment
            status: 'active', // Assuming 'active' for paid enrollment
            payment_status: 'paid',
            // payment_intent: 'placeholder_intent', // Placeholder for now
          },
        ])
        .select()
        .single();

      if (enrollmentError || !enrollmentData) throw enrollmentError || new Error('Failed to create enrollment');

      const enrollmentId = enrollmentData.id;

      // 2. Create bookings for each selected class
      const bookingsToInsert = selectedClasses.map(cls => ({
        enrollment_id: enrollmentId,
        class_id: cls.id,
        term: 'Term1', // Defaulting to Term1 for simplicity, adjust if needed
        booking_date: cls.date,
        is_free_trial: false, // Assuming paid enrollment is not a free trial
      }));

      const { error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookingsToInsert);

      if (bookingsError) throw bookingsError;

      // 3. Create a payment record
      const generateReceiptNumber = () => {
        // Simple random string for receipt number
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = Date.now();
        return `REC-${timestamp}-${randomString}`;
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
                  {
                    enrollment_id: enrollmentId,
                    amount: totalAmount,
                    payment_method: paymentMethod,
                    payment_status: 'completed', // Assuming payment is completed upon enrollment
                    receipt_number: generateReceiptNumber(),
                    payment_date: new Date().toISOString(),
                  },
        ]);

      if (paymentError) throw paymentError;

      toast({
        title: 'Success',
        description: 'Enrollment created successfully!',
      });

      router.push('/dashboard/manage-enrollments'); // Redirect to manage enrollments page
      // Reset form state after successful redirect or handle it differently if not redirecting
      setSelectedCustomer(null);
      setSelectedClasses([]);
      setPaymentMethod('cash');
      setSearchTerm('');
      setOpenGroups({}); // Close all collapsible groups

    } catch (error: any) {
      console.error('Enrollment creation error:', error);
      alert(`Failed to create enrollment: ${error.message}`); // Replace with error toast
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Enrollment</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCustomers ? (
            <p>Loading customers...</p>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <Select onValueChange={setSelectedCustomer}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.surname}, {customer.first_name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

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

          {loadingClasses ? (
            <p>Loading classes...</p>
          ) : (
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
                <Collapsible key={groupKey} open={openGroups[groupKey]} onOpenChange={(open) => setOpenGroups({...openGroups, [groupKey]: open})}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 bg-muted rounded-md text-left font-semibold">
                    {groupKey} ({classesInGroup.length} sessions)
                    {openGroups[groupKey] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 pl-4 space-y-2">
                    {classesInGroup.map((cls) => (
                      <div key={cls.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={selectedClasses.some((selected) => selected.id === cls.id)}
                          onCheckedChange={() => handleClassSelect(cls)}
                        />
                        <Label htmlFor={`class-${cls.id}`} className="cursor-pointer flex-grow">
                          <span className="font-medium">{format(new Date(cls.date), 'PPP')}</span>{' '}
                          ({cls.start_time.substring(0, 5)} - {cls.end_time?.substring(0, 5)}) -{' '}
                          {cls.venue} (${cls.fee_amount})
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {!loadingClasses && Object.keys(
                availableClasses.filter(
                  (cls) =>
                    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cls.code.toLowerCase().includes(searchTerm.toLowerCase())
                ).reduce((acc, cls) => {
                  const groupKey = `${cls.name} - ${cls.code}`;
                  if (!acc[groupKey]) {
                    acc[groupKey] = [];
                  }
                  acc[groupKey].push(cls);
                  return acc;
                }, {} as Record<string, any[]>)
              ).length === 0 && <p className="text-center text-muted-foreground">No classes found.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select onValueChange={(value: 'cash' | 'cheque') => setPaymentMethod(value)} defaultValue={paymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedClasses.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Classes:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {selectedClasses.map(cls => (
                  <li key={cls.id}>{cls.name} ({cls.code}) - {format(new Date(cls.date), 'PPP')}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Selected Classes: {selectedClasses.length}</p>
          <div>
            <Label>Total Amount</Label>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>

          {/* You will add the submission button and logic here later */}
           <Button
             onClick={handleCompleteEnrollment}
             disabled={!selectedCustomer || selectedClasses.length === 0 || isSubmitting}
           >
             {isSubmitting ? 'Completing...' : 'Complete Enrollment'}
           </Button>


        </CardContent>
      </Card>

      {/* Add other sections for payment */}
    </div>
  );
}