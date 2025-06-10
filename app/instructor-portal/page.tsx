'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassBookingsModalForInstructor } from '@/components/bookings/class-bookings-modal-for-instructor';
import { createBrowserClient } from '@/lib/supabase/client';
import { Navigation } from '@/components/shared/navigation';

export default function InstructorPortalPage() {
  const [date, setDate] = useState(new Date());
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const endDate = endOfWeek(date, { weekStartsOn: 1 }); // End on Sunday
  
  const supabase = createBrowserClient();

  // Helper function to convert date-fns day of week to database day of week
  // date-fns: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // database: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  const getDbDayOfWeek = (dayIndex: number): number => {
    return dayIndex === 0 ? 7 : dayIndex; // Convert Sunday (0) to 7, leave others as is
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            instructors (
              id,
              name
            ),
            bookings (
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
            )
          `)
          .order('day_of_week')
          .order('start_time');

        if (error) throw error;
        console.log("classes", data)
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [date, refreshKey]);

  const handlePreviousWeek = () => {
    setDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleClassClick = (classData: any) => {
    setSelectedClass(classData);    
    setIsModalOpen(true);
  };

  // Get day name from day of week number (1-7)
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayOfWeek - 1];
  };

  // Get full day name from day of week number (1-7)
  const getFullDayName = (dayOfWeek: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek - 1];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">      
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="grid grid-cols-7 gap-px border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div
                  key={day}
                  className="bg-muted px-2 py-3 text-center text-sm font-semibold"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-24 gap-px">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const currentDate = addDays(startDate, dayIndex);
                const dbDayOfWeek = getDbDayOfWeek(getDay(currentDate));
                
                // Filter classes for this day of week
                const dayClasses = classes.filter(cls => cls.day_of_week === dbDayOfWeek);

                return (
                  <div
                    key={dayIndex}
                    className="relative min-h-[120px] bg-background p-2"
                  >
                    <div className="sticky top-0 z-10 -mx-2 -mt-2 bg-muted px-2 py-1 text-sm">
                      {format(currentDate, 'MMM d')}
                    </div>
                    <div className="space-y-1">
                      {dayClasses.map((cls) => {
                        // Filter bookings for this specific date
                        const dateBookings = cls.bookings?.filter(
                          (booking: any) => booking.booking_date === format(currentDate, 'yyyy-MM-dd')
                        ) || [];
                        
                        return (
                          <button
                            key={cls.id}
                            onClick={() => handleClassClick({...cls, currentDate})}
                            className="group relative w-full rounded-md bg-primary/10 p-2 text-left hover:bg-primary/20"
                          >
                            <p className="text-sm font-medium">
                              {cls.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cls.start_time} - {cls.end_time} • {cls.venue}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cls.instructors?.name}
                            </p>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {dateBookings.length || 0} bookings
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ClassBookingsModalForInstructor
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            classData={selectedClass}
          />
        </div>
      </div>
    </div>
  );
}