'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getDayName } from '@/lib/utils';
import { ClassDetailsModal } from '@/components/classes/class-details-modal'; // New modal for class details

interface Class {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format from Supabase
  start_time: string; // HH:MM:SS format from Supabase
  end_time: string; // HH:MM:SS format from Supabase
  venue: string;
  instructor_id: string;
  instructors?: { name: string } | null;
  bookings?: any[]; // To potentially pass bookings if needed later
} 

export default function ClassCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classBookings, setClassBookings] = useState<any[]>([]); // State to store fetched bookings

  const supabase = createBrowserClient();

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday as end
  const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          date,
          start_time,
          end_time,
          venue,
          instructor_id,
          instructors (
            name
          )
        `)
        .gte('date', format(startOfCurrentWeek, 'yyyy-MM-dd'))
        .lte('date', format(endOfCurrentWeek, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } else {
        setClasses(data || []);
    }
      setLoading(false);
    };

    fetchClasses();
  }, [currentDate]);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1)); 
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleClassClick = async (classData: Class) => {
    setLoading(true);
    // Fetch bookings for the clicked class
    const { data: bookingsData, error: bookingsError } = await supabase
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
      .eq('class_id', classData.id)

    if (bookingsError) {
      console.error('Error fetching bookings for class:', bookingsError);
    }
    setClassBookings(bookingsData || []); // Store fetched bookings in state
    setSelectedClass({ ...classData, bookings: bookingsData || [] });
    setIsClassModalOpen(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Class Calendar</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() =>{handleToday()}}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => {handlePreviousWeek()}}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => {handleNextWeek()}}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Week</span>
          </Button>
        </div>
      </div>

      <div className="text-center text-lg font-medium">
        {format(startOfCurrentWeek, 'MMM dd, yyyy')} - {format(endOfCurrentWeek, 'MMM dd, yyyy')}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {daysInWeek.map((day, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2 min-h-[200px] flex flex-col">
            <div className="text-center font-semibold">
              {format(day, 'EEE')}
            </div>
            <div className="text-center text-sm text-muted-foreground mb-2">
              {format(day, 'MMM dd')}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {loading ? (
                <p className="text-center text-muted-foreground text-sm">Loading...</p>
              ) : (
                classes // Only filter and map if classes data is available
                  .filter(cls => isSameDay(parseISO(cls.date), day))
                  .map(cls => (
                    <div
                      key={cls.id}
                      className={cn(
                        "cursor-pointer rounded-md p-2 text-sm transition-colors",
                        // You might want to add class-specific colors here based on status, etc.
                        "bg-blue-50 hover:bg-blue-100"
                      )}
                      onClick={() => handleClassClick(cls)}
                    >
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-muted-foreground text-xs">{cls.start_time.substring(0, 5)} - {cls.end_time?.substring(0, 5)}</p>
                      <p className="text-muted-foreground text-xs">{cls.venue}</p>
                      {cls.instructors?.name && (
                        <p className="text-muted-foreground text-xs">Instr: {cls.instructors.name}</p>
                      )}
                    </div>
                  ))
              )}
              {!loading && classes.filter(cls => isSameDay(parseISO(cls.date), day)).length === 0 && (
                <p className="text-center text-muted-foreground text-sm">No classes</p>
              )}
            </div>
          </div>
        ))}
      </div>    
      {selectedClass && ( // Make sure selectedClass is not null before rendering
         <ClassDetailsModal
           open={isClassModalOpen} // Controlled by isClassModalOpen state
           onOpenChange={setIsClassModalOpen} // Function to update isClassModalOpen state
           classData={{ // Pass class data and fetched bookings
             ...selectedClass
           }}
         />
      )}  
    </div>
  );
}