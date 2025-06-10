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

interface InstructorsTableProps {
  onEdit?: (instructor: any) => void;
  onView?: (instructor: any) => void;
  refreshKey: number;
}

export function InstructorsTable({ onEdit, onView, refreshKey }: InstructorsTableProps) {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('instructors')
          .select('*')
          .order('name');

        if (error) throw error;

        setInstructors(data || []);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [refreshKey]);

  const filteredInstructors = instructors.filter((instructor) => {
    const searchString = searchTerm.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(searchString) ||
      instructor.email.toLowerCase().includes(searchString) ||
      instructor.specialty?.toLowerCase().includes(searchString)
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
            placeholder="Search instructors..."
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
              <TableHead>Email</TableHead>
              <TableHead>Contact No</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell className="font-medium">{instructor.name}</TableCell>
                <TableCell>{instructor.email}</TableCell>
                <TableCell>{instructor.contact_no}</TableCell>
                <TableCell>{instructor.specialty}</TableCell>
                <TableCell>{instructor.address}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(instructor)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(instructor)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredInstructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No instructors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}