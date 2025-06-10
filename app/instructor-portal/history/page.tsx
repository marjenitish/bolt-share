'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, isBefore, startOfDay } from 'date-fns';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/shared/navigation';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Eye } from 'lucide-react';
import { ClassHistoryModal } from '@/components/instructor-portal/class-history-modal';

export default function InstructorHistoryPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchClasses();
  }, [selectedMonth]);

  const fetchClasses = async () => {
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

      // Build query for past classes
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
        .eq('instructor_id', instructor.id)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      // Add month filter if selected
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data: classesData } = await query;
      
      // Filter to only include past classes
      const today = startOfDay(new Date());
      const pastClasses = classesData?.filter(cls => 
        isBefore(new Date(cls.date), today)
      ) || [];
      
      setClasses(pastClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (classData: any) => {
    setSelectedClass(classData);
    setIsHistoryModalOpen(true);
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.venue.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Class History</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredClasses.map((cls) => {
            const totalBookings = cls.bookings?.length || 0;
            const totalAttendance = cls.class_attendance?.filter((a: any) => a.attended).length || 0;
            const attendanceRate = totalBookings > 0 ? (totalAttendance / totalBookings) * 100 : 0;
            
            return (
              <Card key={cls.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{cls.name}</h2>
                    <p className="text-muted-foreground">
                      {format(new Date(cls.date), 'dd/MM/yyyy')} • {cls.time} • {cls.venue}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge>
                        {totalAttendance} / {totalBookings} Attended
                      </Badge>
                      <Badge variant={attendanceRate >= 70 ? 'default' : 'secondary'}>
                        {attendanceRate.toFixed(0)}% Attendance
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => handleViewHistory(cls)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past classes found</p>
            </div>
          )}
        </div>
      </div>

      <ClassHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        classData={selectedClass}
      />
    </div>
  );
}