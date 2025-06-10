// components/customers/new-customer-wizard.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerFormContent, customerSchema, type CustomerFormValues } from './customer-form-content';
import { PAQProfileForm } from '@/components/profile/paq-profile-form';
import { ArrowLeft } from 'lucide-react';

interface NewCustomerWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function NewCustomerWizard({
  open,
  onOpenChange,
  onComplete,
}: NewCustomerWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      surname: '',
      firstName: '',
      email: '',
      contactNo: '',
      streetNumber: '',
      streetName: '',
      suburb: '',
      postCode: '',
      countryOfBirth: '',
      dateOfBirth: '',
      workMobile: '',
      occupation: '',
      nextOfKinName: '',
      nextOfKinRelationship: '',
      nextOfKinMobile: '',
      nextOfKinPhone: '',
    },
  });

  const handleProfileSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      // Store the form data for later use
      setCustomerData(data);
      // Move to the next step
      setStep(2);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePAQSubmit = async () => {
    setLoading(true);
    try {
      // Complete the wizard
      onComplete();
      // Reset the form and close the dialog
      form.reset();
      setStep(1);
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex items-center ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium">
                1
              </div>
              <span className="ml-2">Profile Details</span>
            </div>
            <div className={`flex items-center ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium">
                2
              </div>
              <span className="ml-2">PAQ Form</span>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 ? (
            <CustomerFormContent
              form={form}
              onSubmit={handleProfileSubmit}
              loading={loading}
            />
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <PAQProfileForm
                onSubmit={handlePAQSubmit}
                defaultValues={{
                  fullName: `${customerData?.firstName} ${customerData?.surname}`,
                  dateOfBirth: customerData?.dateOfBirth,
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
