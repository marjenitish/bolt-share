'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Search, Eye } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface ExerciseTypesTableProps {
  onEdit?: (exerciseType: any) => void;
  onView?: (exerciseType: any) => void;
  refreshKey: number;
}

export function ExerciseTypesTable({ onEdit, onView, refreshKey }: ExerciseTypesTableProps) {
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchExerciseTypes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exercise_types')
          .select('*')
          .order('name');

        if (error) throw error;

        setExerciseTypes(data || []);
      } catch (error) {
        console.error('Error fetching exercise types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseTypes();
  }, [refreshKey]);

  const filteredExerciseTypes = exerciseTypes.filter((type) => {
    const searchString = searchTerm.toLowerCase();
    return type.name.toLowerCase().includes(searchString);
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercise types..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExerciseTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>{type.duration}</TableCell>
                <TableCell>${type.cost.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(type)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(type)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredExerciseTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No exercise types found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}