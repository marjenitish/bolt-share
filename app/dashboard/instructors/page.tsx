'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstructorsTable } from '@/components/instructors/instructors-table';
import { InstructorModal } from '@/components/instructors/instructor-modal';
import { InstructorDetails } from '@/components/instructors/instructor-details';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';

export default function InstructorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  const handleEdit = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleView = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedInstructor(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedInstructor) {
        // Update existing instructor
        const { error } = await supabase
          .from('instructors')
          .update({
            name: data.name,
            address: data.address,
            contact_no: data.contactNo,
            specialty: data.specialty,
            email: data.email,
            description: data.description,
            image_link: data.imageLink,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedInstructor.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Instructor updated successfully',
        });
      } else {
        // Create new instructor
        const { error } = await supabase.from('instructors').insert([
          {
            name: data.name,
            address: data.address,
            contact_no: data.contactNo,
            specialty: data.specialty,
            email: data.email,
            description: data.description,
            image_link: data.imageLink,
          },
        ]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Instructor created successfully',
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

  const canCreate = hasPermission('instructor_create');
  const canEdit = hasPermission('instructor_update');
  const canView = hasPermission('instructor_read');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Instructor
          </Button>
        )}
      </div>

      <InstructorsTable
        onEdit={canEdit ? handleEdit : undefined}
        onView={canView ? handleView : undefined}
        refreshKey={refreshKey}
      />

      {canEdit && (
        <InstructorModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          instructor={selectedInstructor}
          onSubmit={handleSubmit}
        />
      )}

      {canView && (
        <InstructorDetails
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          instructor={selectedInstructor}
        />
      )}
    </div>
  );
}