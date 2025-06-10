'use client';

import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { createBrowserClient } from '@/lib/supabase/client';

const bookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  classId: z.string().min(1, 'Class is required'),
  term: z.enum(['Term1', 'Term2', 'Term3', 'Term4'], {
    required_error: 'Term is required',
  }),
  bookingDate: z.string().min(1, 'Date is required'),
  isFreeTrial: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: any;
  onSubmit: (data: BookingFormValues) => void;
  preSelectedClassId?: string;
}

export function BookingModal({
  open,
  onOpenChange,
  booking,
  onSubmit,
  preSelectedClassId,
}: BookingModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: '',
      classId: preSelectedClassId || '',
      term: 'Term1',
      isFreeTrial: false,
      bookingDate: new Date().toISOString().split('T')[0],
    },
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      const [customersResponse, classesResponse, enrollmentsResponse] = await Promise.all([
        supabase
          .from('customers')
          .select('id, surname, first_name')
          .order('surname'),
        supabase
          .from('classes')
          .select('id, name, instructor_id, day_of_week, instructors(name)')
          .order('name'),
        supabase
          .from('enrollments')
          .select('id, customer_id, enrollment_type, status')
          .eq('status', 'active')
      ]);

      if (customersResponse.data) setCustomers(customersResponse.data);
      if (classesResponse.data) {
        setClasses(classesResponse.data);
        
        // If a class ID is selected, find the class details
        if (preSelectedClassId || form.getValues('classId')) {
          const classId = preSelectedClassId || form.getValues('classId');
          const selectedClass = classesResponse.data.find(c => c.id === classId);
          setSelectedClass(selectedClass);
        }
      }
      if (enrollmentsResponse.data) setEnrollments(enrollmentsResponse.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (booking) {
      form.reset({
        customerId: booking.customer_id,
        classId: booking.class_id,
        term: booking.term,
        isFreeTrial: booking.is_free_trial,
        bookingDate: booking.booking_date || new Date().toISOString().split('T')[0],
      });
      
      // Find the selected class
      const classData = classes.find(c => c.id === booking.class_id);
      setSelectedClass(classData);
    } else {
      form.reset({
        customerId: '',
        classId: preSelectedClassId || '',
        term: 'Term1',
        isFreeTrial: false,
        bookingDate: new Date().toISOString().split('T')[0],
      });
      
      // Find the selected class if preSelectedClassId is provided
      if (preSelectedClassId) {
        const classData = classes.find(c => c.id === preSelectedClassId);
        setSelectedClass(classData);
      }
    }
  }, [booking, form, preSelectedClassId, classes]);

  // When class selection changes, update the selectedClass
  const handleClassChange = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    setSelectedClass(classData);
  };

  // Get day name from day of week number
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek - 1];
  };

  const handleSubmit = async (values: BookingFormValues) => {
    // Create or get enrollment
    let enrollmentId;
    
    // Check if there's an existing active enrollment for this customer
    const existingEnrollment = enrollments.find(e => 
      e.customer_id === values.customerId && e.status === 'active'
    );
    
    if (existingEnrollment) {
      enrollmentId = existingEnrollment.id;
    } else {
      // Create a new enrollment
      const { data: newEnrollment, error } = await supabase
        .from('enrollments')
        .insert({
          customer_id: values.customerId,
          enrollment_type: values.isFreeTrial ? 'trial' : 'direct',
          status: 'active',
          payment_status: values.isFreeTrial ? 'not_required' : 'paid' // Assuming admin-created bookings are paid
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating enrollment:', error);
        return;
      }
      
      enrollmentId = newEnrollment.id;
    }
    
    // Now create the booking with the enrollment ID
    const bookingData = {
      ...values,
      enrollment_id: enrollmentId
    };
    
    onSubmit(bookingData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {booking ? 'Edit Booking' : 'Add Booking'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.surname}, {customer.first_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleClassChange(value);
                    }}
                    defaultValue={field.value}
                    disabled={!!preSelectedClassId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.instructors?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Term1">Term 1</SelectItem>
                      <SelectItem value="Term2">Term 2</SelectItem>
                      <SelectItem value="Term3">Term 3</SelectItem>
                      <SelectItem value="Term4">Term 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Date</FormLabel>
                  {selectedClass && (
                    <div className="text-xs text-muted-foreground mb-2">
                      This class runs every {getDayName(selectedClass.day_of_week)}
                    </div>
                  )}
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFreeTrial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Free Trial Class</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {booking ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}