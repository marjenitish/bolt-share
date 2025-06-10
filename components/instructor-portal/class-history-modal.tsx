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

interface ClassHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function ClassHistoryModal({
  open,
  onOpenChange,
  classData,
}: ClassHistoryModalProps) {
  if (!classData) return null;

  // Create a map of attendance records by booking ID
  const attendanceMap = new Map(
    classData.class_attendance?.map((record: any) => [record.booking_id, record])
  );

  // Calculate attendance statistics
  const totalBookings = classData.bookings?.length || 0;
  const totalAttendance = classData.class_attendance?.filter((a: any) => a.attended).length || 0;
  const attendanceRate = totalBookings > 0 ? (totalAttendance / totalBookings) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Class History - {classData.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {format(new Date(classData.date), 'EEEE, MMMM d, yyyy')} at {classData.time}
            </p>
            <p className="text-sm text-muted-foreground">
              Venue: {classData.venue}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Enrolled</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Attended</p>
              <p className="text-2xl font-bold">{totalAttendance}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-bold">{attendanceRate.toFixed(0)}%</p>
            </div>
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