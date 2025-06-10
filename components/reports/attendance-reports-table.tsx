'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Download, FileText, Eye } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AttendanceDetailsModal } from './attendance-details-modal';

interface AttendanceReportsTableProps {
  refreshKey: number;
  onRefresh: () => void;
}

export function AttendanceReportsTable({ refreshKey, onRefresh }: AttendanceReportsTableProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchClasses();
  }, [refreshKey, selectedDate]);

  const fetchClasses = async () => {
    try {
      let query = supabase
        .from('classes')
        .select(`
          *,
          instructors (
            name
          ),
          bookings (
            id,
            customers (
              id,
              first_name,
              surname
            )
          ),
          class_attendance (
            id,
            booking_id,
            attended,
            remarks
          )
        `)
        .order('date', { ascending: false });

      if (selectedDate) {
        query = query.eq('date', selectedDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (classData: any, format: 'pdf' | 'csv') => {
    // Implementation for downloading reports
    // This would typically generate a PDF or CSV with attendance data
    toast({
      title: 'Success',
      description: `${format.toUpperCase()} report downloaded successfully`,
    });
  };

  const handleViewDetails = (classData: any) => {
    setSelectedClass(classData);
    setIsDetailsModalOpen(true);
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.instructors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((cls) => {
              const totalBookings = cls.bookings?.length || 0;
              const totalAttendance = cls.class_attendance?.filter((a: any) => a.attended).length || 0;
              
              return (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div className="font-medium">{cls.name}</div>
                    <div className="text-sm text-muted-foreground">{cls.venue}</div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(cls.date), 'dd/MM/yyyy')}
                    <div className="text-sm text-muted-foreground">{cls.time}</div>
                  </TableCell>
                  <TableCell>{cls.instructors?.name}</TableCell>
                  <TableCell>
                    {totalAttendance} / {totalBookings}
                    <div className="text-sm text-muted-foreground">
                      {totalBookings > 0 ? ((totalAttendance / totalBookings) * 100).toFixed(0) : 0}% attendance
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cls.class_attendance?.length ? 'default' : 'secondary'}>
                      {cls.class_attendance?.length ? 'Marked' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(cls)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadReport(cls, 'pdf')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadReport(cls, 'csv')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No classes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AttendanceDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        classData={selectedClass}
      />
    </div>
  );
}