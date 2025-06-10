// app/instructor-portal/classes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/shared/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ClassAttendanceModal } from '@/components/instructor-portal/class-attendance-modal';
import { useToast } from '@/hooks/use-toast';

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchClassData();
  }, [params.id]);

  const fetchClassData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Get instructor ID
      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!instructor) {
        router.push('/');
        return;
      }

      // Get class data
      const { data, error } = await supabase
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
        .eq('id', params.id)
        .eq('instructor_id', instructor.id)
        .single();

      if (error) throw error;
      setClassData(data);
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a map of attendance records by booking ID
  const attendanceMap = new Map(
    classData?.class_attendance?.map((record: any) => [record.booking_id, record])
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Class not found</h1>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{classData.name}</h1>
              <p className="text-muted-foreground">
                {format(new Date(classData.date), 'EEEE, MMMM d, yyyy')} at {classData.time}
              </p>
              <p className="text-muted-foreground">
                {classData.venue}
              </p>
            </div>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Attendance</h2>
              
              {classData.bookings?.length > 0 ? (
                <div className="space-y-4">
                  {classData.bookings.map((booking: any) => {
                    const attendance = attendanceMap.get(booking.id);
                    return (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">
                            {booking.customers.surname}, {booking.customers.first_name}
                          </p>
                          {attendance?.remarks && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {attendance.remarks}
                            </p>
                          )}
                        </div>
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
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No students enrolled in this class</p>
              )}
              
              <div className="mt-6">
                <Button onClick={() => setIsAttendanceModalOpen(true)}>
                  {classData.class_attendance?.length ? 'Update Attendance' : 'Take Attendance'}
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Class Details</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Code</dt>
                  <dd>{classData.code}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Term</dt>
                  <dd>{classData.term}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Fee</dt>
                  <dd>${classData.fee_amount}</dd>
                </div>
              </dl>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Enrolled:</span>
                  <span className="font-medium">{classData.bookings?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Present:</span>
                  <span className="font-medium">
                    {classData.class_attendance?.filter((a: any) => a.attended).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Absent:</span>
                  <span className="font-medium">
                    {classData.class_attendance?.filter((a: any) => !a.attended).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not Marked:</span>
                  <span className="font-medium">
                    {(classData.bookings?.length || 0) - (classData.class_attendance?.length || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ClassAttendanceModal
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        classData={classData}
      />
    </div>
  );
}
