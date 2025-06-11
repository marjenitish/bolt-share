'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassesTable } from '@/components/classes/classes-table';
import { ClassModal } from '@/components/classes/class-modal';
import { ClassDetails } from '@/components/classes/class-details';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';
import { addDays, eachDayOfInterval, format, getDay, isMonday, parseISO } from 'date-fns';

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  const supabase = createBrowserClient();

  const handleEdit = (classData: any) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleView = (classData: any) => {
    setSelectedClass(classData);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update({
            name: data.name,
            code: data.code,
            exercise_type_id: data.exerciseTypeId,
            venue: data.venue,
            address: data.address,
            zip_code: data.zipCode,
            day_of_week: data.dayOfWeek,
            start_time: data.startTime,
            end_time: data.endTime,
            instructor_id: data.instructorId,
            fee_criteria: data.feeCriteria,
            fee_amount: data.feeAmount,
            term: data.term,
            is_subsidised: data.isSubsidised,
            class_capacity: data.classCapacity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedClass.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Class updated successfully',
        });
      } else {

        // Create Classes
        const values = data

        try {
          // Determine the date range based on the selected term (for 2025)
          let startDate: Date;
          let endDate: Date;

          switch (values.term) {
            case 'Term1':
              startDate = new Date('2025-01-01');
              endDate = new Date('2025-03-31');
              break;
            case 'Term2':
              startDate = new Date('2025-04-01');
              endDate = new Date('2025-06-30');
              break;
            case 'Term3':
              startDate = new Date('2025-07-01');
              endDate = new Date('2025-09-30');
              break;
            case 'Term4':
              startDate = new Date('2025-10-01');
              endDate = new Date('2025-12-31');
              break;
            default:
              throw new Error('Invalid term selected');
          }

          // Get all dates for the selected day of week within the term
          const allDates = eachDayOfInterval({ start: startDate, end: endDate });
          const classDates = allDates.filter(date => getDay(date) === values.dayOfWeek);

          // Prepare the classes to be inserted
          const classesToInsert = classDates.map(date => ({
            name: values.name,
            code: values.code,
            exercise_type_id: values.exerciseTypeId,
            venue: values.venue,
            address: values.address,
            zip_code: values.zipCode,
            day_of_week: values.dayOfWeek,
            start_time: values.startTime,
            end_time: values.endTime,
            instructor_id: values.instructorId,
            fee_criteria: values.feeCriteria,
            fee_amount: values.feeAmount,
            term: values.term,
            date: format(date, 'yyyy-MM-dd'),
            is_recurring: true,
            is_subsidised: values.isSubsidised,
            class_capacity: values.classCapacity,
          }));

          // Insert all classes in a transaction
          const { data, error } = await supabase
            .from('classes')
            .insert(classesToInsert)
            .select();

          if (error) {
            throw error;
          }

          // Handle success (refresh data, close modal, etc.)
          console.log('Classes created successfully:', data);
          // Add your success handling here (e.g., toast notification, closing modal, refreshing data)

        } catch (error) {
          console.error('Error creating classes:', error);
          // Add your error handling here (e.g., toast notification)
        }


        toast({
          title: 'Success',
          description: 'Class created successfully',
        });
      }

      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const canCreate = hasPermission('class_create');
  const canEdit = hasPermission('class_update');
  const canView = hasPermission('class_read');

  console.log("canCreate", canCreate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        )}
      </div>

      <ClassesTable
        onEdit={canEdit ? handleEdit : undefined}
        onView={canView ? handleView : undefined}
        refreshKey={refreshKey}
      />

      {canEdit && (
        <ClassModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          classData={selectedClass}
          onSubmit={handleSubmit}
        />
      )}

      {canView && (
        <ClassDetails
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          classData={selectedClass}
        />
      )}
    </div>
  );
}