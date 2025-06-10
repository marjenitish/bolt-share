'use client';

import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const customerSchema = z.object({
  surname: z.string().min(1, 'Surname is required'),
  firstName: z.string().min(1, 'First name is required'),
  streetNumber: z.string().optional(),
  streetName: z.string().optional(),
  suburb: z.string().optional(),
  postCode: z.string().optional(),
  contactNo: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  countryOfBirth: z.string().optional(),
  dateOfBirth: z.string().optional(),
  workMobile: z.string().optional(),
  paqForm: z.boolean().default(false),
  australianCitizen: z.boolean().optional(),
  languageOtherThanEnglish: z.string().optional(),
  englishProficiency: z.enum(['very_well', 'well', 'not_well', 'not_at_all']).optional(),
  indigenousStatus: z.enum(['yes', 'no', 'prefer_not_to_say']).optional(),
  reasonForClass: z.string().optional(),
  howDidYouHear: z.string().optional(),
  occupation: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinMobile: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  equipmentPurchased: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
  onSubmit: (data: CustomerFormValues) => void;
}

export function CustomerModal({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: CustomerModalProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      surname: '',
      firstName: '',
      streetNumber: '',
      streetName: '',
      suburb: '',
      postCode: '',
      contactNo: '',
      email: '',
      countryOfBirth: '',
      dateOfBirth: '',
      workMobile: '',
      paqForm: false,
      australianCitizen: false,
      languageOtherThanEnglish: '',
      englishProficiency: 'well',
      indigenousStatus: 'prefer_not_to_say',
      reasonForClass: '',
      howDidYouHear: '',
      occupation: '',
      nextOfKinName: '',
      nextOfKinRelationship: '',
      nextOfKinMobile: '',
      nextOfKinPhone: '',
      equipmentPurchased: [],
      status: 'active',
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        surname: customer.surname,
        firstName: customer.first_name,
        streetNumber: customer.street_number,
        streetName: customer.street_name,
        suburb: customer.suburb,
        postCode: customer.post_code,
        contactNo: customer.contact_no,
        email: customer.email,
        countryOfBirth: customer.country_of_birth,
        dateOfBirth: customer.date_of_birth,
        workMobile: customer.work_mobile,
        paqForm: customer.paq_form,
        australianCitizen: customer.australian_citizen,
        languageOtherThanEnglish: customer.language_other_than_english,
        englishProficiency: customer.english_proficiency,
        indigenousStatus: customer.indigenous_status,
        reasonForClass: customer.reason_for_class,
        howDidYouHear: customer.how_did_you_hear,
        occupation: customer.occupation,
        nextOfKinName: customer.next_of_kin_name,
        nextOfKinRelationship: customer.next_of_kin_relationship,
        nextOfKinMobile: customer.next_of_kin_mobile,
        nextOfKinPhone: customer.next_of_kin_phone,
        equipmentPurchased: customer.equipment_purchased || [],
        status: customer.status,
      });
    } else {
      form.reset({
        surname: '',
        firstName: '',
        streetNumber: '',
        streetName: '',
        suburb: '',
        postCode: '',
        contactNo: '',
        email: '',
        countryOfBirth: '',
        dateOfBirth: '',
        workMobile: '',
        paqForm: false,
        australianCitizen: false,
        languageOtherThanEnglish: '',
        englishProficiency: 'well',
        indigenousStatus: 'prefer_not_to_say',
        reasonForClass: '',
        howDidYouHear: '',
        occupation: '',
        nextOfKinName: '',
        nextOfKinRelationship: '',
        nextOfKinMobile: '',
        nextOfKinPhone: '',
        equipmentPurchased: [],
        status: 'active',
      });
    }
  }, [customer, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'Add Customer'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
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
                  name="firstName"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="streetNumber"
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
                  name="streetName"
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

              <div className="grid grid-cols-2 gap-4">
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
                  name="postCode"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactNo"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="countryOfBirth"
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
                  name="dateOfBirth"
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
                name="workMobile"
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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="paqForm"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">PAQ Form</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="australianCitizen"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Australian Citizen or Resident
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="languageOtherThanEnglish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Spoken at Home other than English</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="englishProficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ability to speak English</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="very_well">Very Well</SelectItem>
                        <SelectItem value="well">Well</SelectItem>
                        <SelectItem value="not_well">Not Well</SelectItem>
                        <SelectItem value="not_at_all">Not at All</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="indigenousStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aboriginal or Torres Strait Islander</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="prefer_not_to_say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reasonForClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main reason for undertaking class</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="howDidYouHear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about SHARE'S program?</FormLabel>
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
                    <FormLabel>Current or Previous Occupation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Next of Kin</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nextOfKinName"
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
                  name="nextOfKinRelationship"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nextOfKinMobile"
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
                  name="nextOfKinPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {customer ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}