'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentForm } from './enrollment-form';
import { PAQForm } from './paq-form';
import { BiAnnualSurvey } from './bi-annual-survey';
import { PaymentForm } from './payment-form';
import { ClassDateSelector } from './class-date-selector';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentStepsProps {
  selectedClasses: any[];
  onComplete: () => void;
}

export function EnrollmentSteps({ selectedClasses, onComplete }: EnrollmentStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [enrollmentType, setEnrollmentType] = useState<'trial' | 'direct'>('direct');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [classDateSelections, setClassDateSelections] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const steps = [
    { id: 1, title: 'Choose Type' },
    { id: 2, title: 'Select Dates' },
    { id: 3, title: 'Details' },
    // { id: 4, title: 'PAQ Form' },
    // { id: 5, title: 'Survey' },
    { id: 4, title: 'Payment' },
  ];

  const handleEnrollmentTypeSelect = (type: 'trial' | 'direct') => {
    setEnrollmentType(type);
    setCurrentStep(2);
  };

  const handleDateSelectionComplete = (dateSelections: Record<string, string>) => {
    setClassDateSelections(dateSelections);
    setCurrentStep(3);
  };

  const handleEnrollmentFormSubmit = async (data: any) => {
    try {
      // First, check if customer exists
      let customerId;
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .limit(1);

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            first_name: data.firstName,
            surname: data.lastName,
            email: data.email,
            contact_no: data.phone,
            date_of_birth: data.dateOfBirth,
            next_of_kin_name: data.emergencyContact,
            next_of_kin_mobile: data.emergencyPhone,
            status: 'Active'
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create enrollment record
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          customer_id: customerId,
          enrollment_type: enrollmentType,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Create booking records for each selected class with the selected dates
      const bookingPromises = selectedClasses.map(cls => {
        const selectedDate = classDateSelections[cls.id];
        if (!selectedDate) {
          throw new Error(`No date selected for class: ${cls.name}`);
        }
        
        return supabase
          .from('bookings')
          .insert({
            enrollment_id: enrollment.id,
            class_id: cls.id,
            term: 'Term1', // Default term, could be made selectable
            booking_date: selectedDate,
            is_free_trial: enrollmentType === 'trial'
          });
      });

      await Promise.all(bookingPromises);

      setEnrollmentId(enrollment.id);
      setEnrollmentData(data);
      if (enrollmentType === 'direct') {
        setCurrentStep(4);
      } else {
        const { error } = await supabase
          .from('enrollments')
          .update({
            status: 'active',
            payment_status: 'paid'
          })
          .eq('id', enrollment.id);
  
        if (error) throw error;
        onComplete()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePAQSubmit = () => {
    setCurrentStep(5);
  };



  const handlePaymentComplete = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate total fee for all selected classes
  const calculateTotalFee = () => {
    return selectedClasses.reduce((total, cls) => total + cls.fee_amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center ${
              step.id === currentStep
                ? 'text-primary'
                : step.id < currentStep
                ? 'text-primary/50'
                : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium">
              {step.id < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span className="ml-2 hidden sm:inline text-xs">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-4">
        {currentStep > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Choose Your Enrollment Type</h2>
            <Tabs defaultValue="direct" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct" onClick={() => handleEnrollmentTypeSelect('direct')}>
                  Enrollment Form
                </TabsTrigger>
                <TabsTrigger value="trial" onClick={() => handleEnrollmentTypeSelect('trial')}>
                  Free Trial Form
                </TabsTrigger>
              </TabsList>
              <TabsContent value="direct">
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold">Enrollment Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Enroll directly in the selected classes and enjoy full access to all sessions.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Full term access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Regular class schedule</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Progress tracking</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="trial">
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold">Free Trial Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Try a single class to see if it's right for you.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>One-time class</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>No commitment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Meet the instructor</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            {/* Selected Classes Summary */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Selected Classes ({selectedClasses.length})</h3>
              <div className="space-y-3">
                {selectedClasses.map((cls) => (
                  <div key={cls.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.day_of_week === 1 ? 'Monday' : 
                         cls.day_of_week === 2 ? 'Tuesday' : 
                         cls.day_of_week === 3 ? 'Wednesday' : 
                         cls.day_of_week === 4 ? 'Thursday' : 
                         cls.day_of_week === 5 ? 'Friday' : 
                         cls.day_of_week === 6 ? 'Saturday' : 'Sunday'} • {cls.start_time}
                      </p>
                    </div>
                    <p className="font-medium">${cls.fee_amount.toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg font-medium">
                  <span>Total</span>
                  <span>${calculateTotalFee().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <ClassDateSelector
            selectedClasses={selectedClasses}
            onComplete={handleDateSelectionComplete}
          />
        )}

        {currentStep === 3 && (
          <EnrollmentForm
            selectedClasses={selectedClasses}
            enrollmentType={enrollmentType}
            onSubmit={handleEnrollmentFormSubmit}
          />
        )}

        

        {currentStep === 4 && enrollmentType === 'direct' && (
          <PaymentForm
            selectedClasses={selectedClasses}
            enrollmentData={enrollmentData}
            enrollmentId={enrollmentId!}
            onComplete={handlePaymentComplete}
          />
        )}
      </Card>
    </div>
  );
}