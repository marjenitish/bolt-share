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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';
import { Checkbox } from '../ui/checkbox';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  code: z.string().min(1, 'Class code is required'),
  exerciseTypeId: z.string().min(1, 'Exercise type is required'),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  zipCode: z.string().optional(),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  instructorId: z.string().min(1, 'Instructor is required'),
  feeCriteria: z.string().min(1, 'Fee criteria is required'),
  feeAmount: z.number().min(0, 'Fee amount must be 0 or greater'),
  term: z.enum(['Term1', 'Term2', 'Term3', 'Term4'], {
    required_error: 'Term is required',
  }),
  classCapacity: z.number().min(0, 'Class capacity must be 0 or greater').optional(),
  isSubsidised: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  onSubmit: (data: ClassFormValues) => void;
}

export function ClassModal({
  open,
  onOpenChange,
  classData,
  onSubmit,
}: ClassModalProps) {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  
  const supabase = createBrowserClient();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      code: '',
      exerciseTypeId: '',
      venue: '',
      address: '',
      zipCode: '',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      instructorId: '',
      feeCriteria: '',
      feeAmount: 0,
      term: 'Term1',
      classCapacity: 0,
      isSubsidised: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [instructorsResponse, exerciseTypesResponse] = await Promise.all([
        supabase
          .from('instructors')
          .select('id, name')
          .order('name'),
        supabase
          .from('exercise_types')
          .select('id, name')
          .order('name'),
      ]);

      if (instructorsResponse.data) setInstructors(instructorsResponse.data);
      if (exerciseTypesResponse.data) setExerciseTypes(exerciseTypesResponse.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (classData) {
      form.reset({
        name: classData.name,
        code: classData.code,
        exerciseTypeId: classData.exercise_type_id,
        venue: classData.venue,
        address: classData.address,
        zipCode: classData.zip_code || '',
        dayOfWeek: classData.day_of_week,
        startTime: classData.start_time,
        endTime: classData.end_time,
        instructorId: classData.instructor_id,
        feeCriteria: classData.fee_criteria,
        feeAmount: classData.fee_amount,
        term: classData.term,
        classCapacity: classData.class_capacity || undefined,
        isSubsidised: classData.is_subsidised || false,
      });
    } else {
      form.reset({
        name: '',
        code: '',
        exerciseTypeId: '',
        venue: '',
        address: '',
        zipCode: '',
        dayOfWeek: 1,
        startTime: '',
        endTime: '',
        instructorId: '',
        feeCriteria: '',
        feeAmount: 0,
        term: 'Term1',
        classCapacity: undefined,
        isSubsidised: false,
      });
    }
  }, [classData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {classData ? 'Edit Class' : 'Add Class'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Gentle Yoga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Code</FormLabel>
                    <FormControl>
                      <Input placeholder="YG101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exerciseTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exerciseTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Studio A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Exercise Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="feeCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Criteria</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter fee criteria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="classCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 20"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isSubsidised"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none"><FormLabel>Is Subsidised</FormLabel></div>
                  <FormMessage />
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
                {classData ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}