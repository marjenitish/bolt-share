'use client';

import { useState } from 'react';
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
  TableFooter
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { BookingModal } from './booking-modal';
import { BookingDetailsSheet } from './booking-details-sheet';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface ClassBookingsModalForInstructorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function ClassBookingsModalForInstructor({
  open,
  onOpenChange,
  classData,
}: ClassBookingsModalForInstructorProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  // Initialize attendance state when classData changes
  useState(() => {
    if (classData?.bookings) {
      const initialAttendance: { [key: string]: boolean } = {};
      classData.bookings.forEach((booking: any) => {
        initialAttendance[booking.id] = false; // Default to not present
      });
      setAttendance(initialAttendance);
    }
  }, [classData]);
  if (!classData) return null;

  const handleCancelBooking = async (data: any) => {
    console.log("cancel booking data", data)
  };

  const handleViewDetails = async (booking: any) => {
    try {
      // Fetch the complete booking data including payments
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          enrollments (
            id,
            customer_id,
            enrollment_type,
            customers (
              id,
              surname,
              first_name
            )
          ),
          classes (
            id,
            name,
            fee_amount,
            instructor_id,
            instructors (
              id,
              name
            )
          ),
          payments (
            id,
            amount,
            payment_method,
            payment_status,
            payment_date,
            receipt_number,
            transaction_id,
            notes
          )
        `)
        .eq('id', booking.id)
        .single();

      if (error) throw error;

      setSelectedBooking(data);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleAttendanceChange = (bookingId: string, isChecked: boolean) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [bookingId]: isChecked,
    }));
  };

  const handleUpdateAttendance = async () => {
    const attendanceRecords = Object.keys(attendance)
      .filter((bookingId) => attendance[bookingId])
      .map((bookingId) => ({
        class_id: classData.id,
        booking_id: bookingId,
        attended: true,
      }));

    if (attendanceRecords.length === 0) {
      toast({
        title: 'No attendance to update',
        description: 'Please mark at least one customer as present.',
      });
      return;
    }

    const { data, error } = await supabase.from('class_attendance').insert(attendanceRecords);

    if (error) {
      toast({ title: 'Error updating attendance', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Attendance updated successfully', description: `${attendanceRecords.length} customers marked as present.` });
      onOpenChange(false); // Close the modal after updating
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Class Bookings - {classData.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {classData.start_time} - {classData.end_time} • {classData.venue}
                </p>
                <p className="text-sm text-muted-foreground">
                  Instructor: {classData.instructors?.name}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCancelBooking("cancel")}
                className="h-8"
              >
                <Plus className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px]">SN</TableHead>
                    <TableHead className="w-[250px]">Customer</TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead className="w-[80px]">Present</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.bookings
                    ?.filter((booking: any) => {
                      console.log("booking", booking)
                      //const bookingDate = new Date(booking.booking_date).toISOString().split('T')[0];
                      const bookingDate = booking.booking_date;
                      const currentDate = new Date(classData.currentDate).toLocaleDateString('en-CA', {
                        timeZone: 'Asia/Kathmandu',
                      });                      
                      return bookingDate === currentDate;
                    })
                    .map((booking: any, index: number) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {index+1}
                        </TableCell>
                        <TableCell>
                          {booking.enrollments?.customers?.surname}, {booking.enrollments?.customers?.first_name}
                        </TableCell>
                        <TableCell>
                          {booking.enrollments?.enrollment_type === 'trial' ? 'Trial' : 'Regular'}
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={attendance[booking.id] || false}
                            onChange={(e) =>
                              handleAttendanceChange(booking.id, e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                        </TableCell>
                      </TableRow>
                  ))}

                  {!classData.bookings?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {classData.bookings?.length > 0 && (
                <div className="p-4 text-right">
                  <Button onClick={handleUpdateAttendance}>Update Attendance</Button>
                </div>
              )}

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}