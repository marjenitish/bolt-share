'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface AttendanceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function AttendanceDetailsModal({
  open,
  onOpenChange,
  classData,
}: AttendanceDetailsModalProps) {
  if (!classData) return null;

  // Create a map of attendance records by booking ID
  const attendanceMap = new Map(
    classData.class_attendance?.map((record: any) => [record.booking_id, record])
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Attendance Details - {classData.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {format(new Date(classData.date), 'EEEE, MMMM d, yyyy')} at {classData.time}
            </p>
            <p className="text-sm text-muted-foreground">
              Instructor: {classData.instructors?.name}
            </p>
          </div>

          <div className="border rounded-lg divide-y">
            {classData.bookings?.map((booking: any) => {
              const attendance = attendanceMap.get(booking.id);
              return (
                <div key={booking.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">
                      {booking.customers.surname}, {booking.customers.first_name}
                    </p>
                    {attendance ? (
                      <Badge variant={attendance.attended ? 'default' : 'destructive'}>
                        {attendance.attended ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {attendance.attended ? 'Present' : 'Absent'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Marked</Badge>
                    )}
                  </div>
                  {attendance?.remarks && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Remarks:</span> {attendance.remarks}
                    </p>
                  )}
                </div>
              );
            })}
            {(!classData.bookings || classData.bookings.length === 0) && (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">No bookings for this class</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}