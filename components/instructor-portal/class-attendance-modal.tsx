'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function ClassAttendanceModal({
  open,
  onOpenChange,
  classData,
}: ClassAttendanceModalProps) {
  const [attendees, setAttendees] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    if (classData && open) {
      // Initialize with existing attendance data
      const existingAttendees = classData.class_attendance
        ?.filter((a: any) => a.attended)
        .map((a: any) => a.booking_id) || [];
      
      setAttendees(existingAttendees);
      
      // Get the most recent remarks if any
      const latestRemarks = classData.class_attendance?.[0]?.remarks || '';
      setRemarks(latestRemarks);
    }
  }, [classData, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // First, delete existing attendance records
      const { error: deleteError } = await supabase
        .from('class_attendance')
        .delete()
        .eq('class_id', classData.id);

      if (deleteError) throw deleteError;

      // Create attendance records for all bookings
      const attendanceRecords = classData.bookings.map((booking: any) => ({
        class_id: classData.id,
        booking_id: booking.id,
        attended: attendees.includes(booking.id),
        remarks: remarks,
      }));

      // Insert new attendance records
      const { error: insertError } = await supabase
        .from('class_attendance')
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Attendance recorded successfully',
      });
      
      // Refresh the page to show updated data
      window.location.reload();
      
      onOpenChange(false);
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

  const toggleAttendance = (bookingId: string) => {
    setAttendees(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  if (!classData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Take Attendance - {classData.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            {classData.bookings?.map((booking: any) => (
              <div key={booking.id} className="flex items-center space-x-2">
                <Checkbox
                  id={booking.id}
                  checked={attendees.includes(booking.id)}
                  onCheckedChange={() => toggleAttendance(booking.id)}
                />
                <label htmlFor={booking.id} className="text-sm font-medium">
                  {booking.customers.surname}, {booking.customers.first_name}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes about the class..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              Save Attendance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}