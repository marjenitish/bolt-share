'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseTypesTable } from '@/components/exercise-types/exercise-types-table';
import { ExerciseTypeModal } from '@/components/exercise-types/exercise-type-modal';
import { ExerciseTypeDetails } from '@/components/exercise-types/exercise-type-details';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';

export default function ExerciseTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExerciseType, setSelectedExerciseType] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  const handleEdit = (exerciseType: any) => {
    setSelectedExerciseType(exerciseType);
    setIsModalOpen(true);
  };

  const handleView = (exerciseType: any) => {
    setSelectedExerciseType(exerciseType);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedExerciseType(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedExerciseType) {
        // Update existing exercise type
        const { error } = await supabase
          .from('exercise_types')
          .update({
            name: data.name,
            description: data.description,
            what_to_bring: data.whatToBring,
            duration: `${data.duration} minutes`,
            cost: data.cost,
            image_link: data.imageLink,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedExerciseType.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Exercise type updated successfully',
        });
      } else {
        // Create new exercise type
        const { error } = await supabase.from('exercise_types').insert([{
          name: data.name,
          description: data.description,
          what_to_bring: data.whatToBring,
          duration: `${data.duration} minutes`,
          cost: data.cost,
          image_link: data.imageLink,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Exercise type created successfully',
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

  const canCreate = hasPermission('exercise_type_create');
  const canEdit = hasPermission('exercise_type_update');
  const canView = hasPermission('exercise_type_read');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exercise Types</h1>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise Type
          </Button>
        )}
      </div>

      <ExerciseTypesTable
        onEdit={canEdit ? handleEdit : undefined}
        onView={canView ? handleView : undefined}
        refreshKey={refreshKey}
      />

      {canEdit && (
        <ExerciseTypeModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          exerciseType={selectedExerciseType}
          onSubmit={handleSubmit}
        />
      )}

      {canView && (
        <ExerciseTypeDetails
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          exerciseType={selectedExerciseType}
        />
      )}
    </div>
  );
}