'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/shared/navigation';
import { ClassAttendanceModal } from '@/components/instructor-portal/class-attendance-modal';

export default function InstructorClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchClasses = async () => {
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

      // Get today's classes
      const today = new Date().toISOString().split('T')[0];
      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          *,
          bookings (
            id,
            customers (
              id,
              first_name,
              surname
            )
          )
        `)
        .eq('instructor_id', instructor.id)
        .eq('date', today)
        .order('time');

      setClasses(classesData || []);
      setLoading(false);
    };

    fetchClasses();
  }, []);

  const handleAttendance = (classData: any) => {
    setSelectedClass(classData);
    setIsAttendanceModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Today's Classes</h1>
        
        <div className="space-y-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{cls.name}</h2>
                  <p className="text-muted-foreground">
                    {cls.time} • {cls.venue}
                  </p>
                  <div className="mt-2">
                    <Badge>
                      {cls.bookings?.length || 0} Enrolled
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => handleAttendance(cls)}>
                  Take Attendance
                </Button>
              </div>
            </Card>
          ))}

          {classes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No classes scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      <ClassAttendanceModal
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        classData={selectedClass}
      />
    </div>
  );
}