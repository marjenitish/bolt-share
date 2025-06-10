'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';

interface ClassDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    venue: string;
    instructor_id: string;
    instructors?: { name: string } | null;
  } | null;
}

export function ClassDetailsModal({
  open,
  onOpenChange,
  classData,
}: ClassDetailsModalProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (classData?.id) {
      const fetchBookings = async () => {
        setLoadingBookings(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            term,
            booking_date,
            enrollments (
              id,
              customers (
                id,
                surname,
                first_name
              )
            )
          `)
          .eq('class_id', classData.id);

        if (error) {
          console.error('Error fetching bookings:', error);
          setBookings([]);
        } else {
          setBookings(data || []);
        }
        setLoadingBookings(false);
      };

      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [classData?.id]);

  if (!classData) return null;

  const handleCreateEnrollment = () => {
    // TODO: Implement create enrollment logic
    console.log('Create New Enrollment button clicked');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{classData.name}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {classData.start_time.substring(0, 5)} - {classData.end_time?.substring(0, 5)} • {classData.venue}
            {classData.instructors?.name && ` • Instructor: ${classData.instructors.name}`}
          </div>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Booked Customers</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SN</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Booking Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBookings ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <TableRow key={booking.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {booking.enrollments?.customers?.surname},{' '}
                        {booking.enrollments?.customers?.first_name}
                      </TableCell>
                      <TableCell>{booking.term}</TableCell>
                      <TableCell>{booking.booking_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No bookings found for this class.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>  
  );
}