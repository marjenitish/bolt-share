'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getDayName } from '@/lib/utils';

// Step 1: Customer Selection Schema
const customerSelectionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
});

// Step 2: Class Selection Schema
const classSelectionSchema = z.object({
  selectedClasses: z.array(z.object({
    classId: z.string(),
    bookingDate: z.string(),
    term: z.enum(['Term1', 'Term2', 'Term3', 'Term4']),
  })).min(1, 'At least one class must be selected'),
});

// Step 3: Payment Schema
const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'cheque', 'card']),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

interface EnrollmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function DashboardEnrollmentWizard({
  open,
  onOpenChange,
  onComplete,
}: EnrollmentWizardProps) {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [classDateSelections, setClassDateSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  // Forms for each step
  const customerForm = useForm<z.infer<typeof customerSelectionSchema>>({
    resolver: zodResolver(customerSelectionSchema),
    defaultValues: {
      customerId: '',
    },
  });

  const classForm = useForm<z.infer<typeof classSelectionSchema>>({
    resolver: zodResolver(classSelectionSchema),
    defaultValues: {
      selectedClasses: [],
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'cash',
      amount: 0,
      transactionId: '',
      notes: '',
    },
  });

  // Fetch customers and classes on mount
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchClasses();
    } else {
      // Reset state when modal closes
      setStep(1);
      setSelectedCustomer(null);
      setSelectedClasses([]);
      setClassDateSelections({});
      customerForm.reset();
      classForm.reset();
      paymentForm.reset();
    }
  }, [open]);

  // Update payment amount when selected classes change
  useEffect(() => {
    if (selectedClasses.length > 0) {
      const totalAmount = selectedClasses.reduce((sum, cls) => sum + cls.fee_amount, 0);
      paymentForm.setValue('amount', totalAmount);
    }
  }, [selectedClasses, paymentForm]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('surname');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          instructors (
            id,
            name
          ),
          exercise_types (
            id,
            name
          )
        `)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCustomerSelect = async (data: z.infer<typeof customerSelectionSchema>) => {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.customerId)
        .single();

      if (error) throw error;
      setSelectedCustomer(customer);
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClassToggle = (classData: any) => {
    setSelectedClasses(prev => {
      const isSelected = prev.some(cls => cls.id === classData.id);
      if (isSelected) {
        return prev.filter(cls => cls.id !== classData.id);
      } else {
        return [...prev, classData];
      }
    });
  };

  const handleClassDateChange = (classId: string, date: string) => {
    setClassDateSelections(prev => ({
      ...prev,
      [classId]: date
    }));
  };

  const handleClassSelectionComplete = () => {
    // Validate that all selected classes have dates
    const allClassesHaveDates = selectedClasses.every(cls => 
      classDateSelections[cls.id] && classDateSelections[cls.id].trim() !== ''
    );

    if (!allClassesHaveDates) {
      toast({
        title: 'Missing dates',
        description: 'Please select a date for each class',
        variant: 'destructive',
      });
      return;
    }

    setStep(3);
  };

  const handlePaymentSubmit = async (data: z.infer<typeof paymentSchema>) => {
    try {
      setLoading(true);

      // 1. Create enrollment record
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          customer_id: selectedCustomer.id,
          enrollment_type: 'direct',
          status: 'active',
          payment_status: 'paid'
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // 2. Create booking records for each selected class
      for (const cls of selectedClasses) {
        const bookingDate = classDateSelections[cls.id];
        
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            enrollment_id: enrollment.id,
            class_id: cls.id,
            term: 'Term1', // Default term
            booking_date: bookingDate,
            is_free_trial: false
          });

        if (bookingError) throw bookingError;
        
        // 3. Get the booking ID for the payment record
        const { data: bookingData, error: fetchError } = await supabase
          .from('bookings')
          .select('id')
          .eq('enrollment_id', enrollment.id)
          .eq('class_id', cls.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        // 4. Generate receipt number
        const { data: receiptNumber, error: receiptError } = await supabase
          .rpc('generate_receipt_number');
          
        if (receiptError) throw receiptError;
        
        // 5. Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingData.id,
            amount: cls.fee_amount,
            payment_method: data.paymentMethod,
            payment_status: 'completed',
            transaction_id: data.transactionId || null,
            receipt_number: receiptNumber,
            payment_date: new Date().toISOString(),
            notes: data.notes || `Payment for ${cls.name}`,
          });
          
        if (paymentError) throw paymentError;
      }

      toast({
        title: 'Success',
        description: 'Enrollment created successfully',
      });
      
      onOpenChange(false);
      onComplete();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Enrollment</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between mb-6">
          {[
            { id: 1, title: 'Select Customer' },
            { id: 2, title: 'Select Classes' },
            { id: 3, title: 'Payment' },
          ].map((s) => (
            <div
              key={s.id}
              className={`flex items-center ${
                s.id === step
                  ? 'text-primary'
                  : s.id < step
                  ? 'text-primary/50'
                  : 'text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium">
                {s.id < step ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{s.id}</span>
                )}
              </div>
              <span className="ml-2 text-sm">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCustomerSelect)} className="space-y-6">
              <FormField
                control={customerForm.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.surname}, {customer.first_name} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Continue</Button>
            </form>
          </Form>
        )}

        {/* Step 2: Class Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Classes for {selectedCustomer?.first_name} {selectedCustomer?.surname}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the classes and dates for this enrollment.
              </p>
            </div>

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="selected">Selected ({selectedClasses.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4 mt-4">
                {classes.map((cls) => (
                  <Card key={cls.id} className={`cursor-pointer transition-all ${
                    selectedClasses.some(c => c.id === cls.id) ? 'border-primary' : ''
                  }`}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <Button 
                          variant={selectedClasses.some(c => c.id === cls.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleClassToggle(cls)}
                        >
                          {selectedClasses.some(c => c.id === cls.id) ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{getDayName(cls.day_of_week)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{cls.start_time} - {cls.end_time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{cls.venue}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Instructor:</span> {cls.instructors?.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Type:</span> {cls.exercise_types?.name}
                          </p>
                          <p className="text-sm font-medium">
                            Fee: ${cls.fee_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {selectedClasses.some(c => c.id === cls.id) && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Select Date:</label>
                            <Input
                              type="date"
                              value={classDateSelections[cls.id] || ''}
                              onChange={(e) => handleClassDateChange(cls.id, e.target.value)}
                              className="w-auto"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="selected" className="space-y-4 mt-4">
                {selectedClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No classes selected yet</p>
                  </div>
                ) : (
                  <>
                    {selectedClasses.map((cls) => (
                      <Card key={cls.id} className="border-primary">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{cls.name}</CardTitle>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleClassToggle(cls)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{getDayName(cls.day_of_week)}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{cls.start_time} - {cls.end_time}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Fee: ${cls.fee_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">Select Date:</label>
                              <Input
                                type="date"
                                value={classDateSelections[cls.id] || ''}
                                onChange={(e) => handleClassDateChange(cls.id, e.target.value)}
                                className="w-auto"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Amount:</span>
                        <span>${selectedClasses.reduce((sum, cls) => sum + cls.fee_amount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button 
                onClick={handleClassSelectionComplete}
                disabled={selectedClasses.length === 0}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete the enrollment by processing the payment.
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Enrollment Summary</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Customer:</span> {selectedCustomer?.first_name} {selectedCustomer?.surname}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Classes:</span> {selectedClasses.length}
                    </p>
                    <div className="border-t pt-2 mt-2">
                      {selectedClasses.map((cls) => (
                        <div key={cls.id} className="flex justify-between text-sm py-1">
                          <span>{cls.name} ({classDateSelections[cls.id] ? format(new Date(classDateSelections[cls.id]), 'dd/MM/yyyy') : 'No date selected'})</span>
                          <span>${cls.fee_amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${selectedClasses.reduce((sum, cls) => sum + cls.fee_amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Complete Enrollment'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}