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
import { format } from 'date-fns';

interface ClassesTableProps {
  onEdit?: (classData: any) => void;
  onView?: (classData: any) => void;
  refreshKey: number;
}

export function ClassesTable({ onEdit, onView, refreshKey }: ClassesTableProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            instructors (
              name
            ),
            exercise_types (
              name
            )
          `)
          .order('day_of_week', { ascending: true });

        if (error) throw error;

        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [refreshKey]);

  const filteredClasses = classes.filter((classData) => {
    const searchString = searchTerm.toLowerCase();
    return (
      classData.name.toLowerCase().includes(searchString) ||
      classData.code.toLowerCase().includes(searchString) ||
      classData.exercise_types?.name.toLowerCase().includes(searchString) ||
      classData.instructors?.name.toLowerCase().includes(searchString)
    );
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
            placeholder="Search classes..."
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
              <TableHead>Class Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Exercise Type</TableHead>
              <TableHead>Class Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((classData) => (
              <TableRow key={classData.id}>
                <TableCell className="font-medium">{classData.name}</TableCell>
                <TableCell>{classData.code}</TableCell>
                <TableCell>{classData.exercise_types?.name}</TableCell>
                <TableCell>{classData.date}</TableCell>
                <TableCell>{classData.start_time}</TableCell>
                <TableCell>{classData.end_time}</TableCell>
                <TableCell>{classData.instructors?.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(classData)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(classData)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No classes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}