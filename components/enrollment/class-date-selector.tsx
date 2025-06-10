'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isWithinInterval, addWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClassDateSelectorProps {
  selectedClasses: any[];
  onComplete: (dateSelections: Record<string, string>) => void;
}

export function ClassDateSelector({ selectedClasses, onComplete }: ClassDateSelectorProps) {
  const [dateSelections, setDateSelections] = useState<Record<string, Date>>({});
  const [currentClass, setCurrentClass] = useState<number>(0);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Generate available dates for the current class
  useEffect(() => {
    if (selectedClasses.length === 0 || currentClass >= selectedClasses.length) return;
    
    const cls = selectedClasses[currentClass];
    const dates: Date[] = [];
    
    // Generate dates for the next 8 weeks
    const today = new Date();
    const dayOfWeek = cls.day_of_week; // 1 = Monday, 7 = Sunday
    
    // Find the first occurrence of the class day
    let currentDate = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    currentDate = addDays(currentDate, dayOfWeek - 1); // Adjust to the class day
    
    // If the day has already passed this week, move to next week
    if (currentDate < today) {
      currentDate = addDays(currentDate, 7);
    }
    
    // Generate 8 occurrences
    for (let i = 0; i < 8; i++) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 7); // Add a week
    }
    
    setAvailableDates(dates);
    
    // Set calendar to show the month of the first available date
    setCalendarDate(dates[0]);
  }, [currentClass, selectedClasses]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || selectedClasses.length === 0 || currentClass >= selectedClasses.length) return;
    
    const cls = selectedClasses[currentClass];
    setDateSelections(prev => ({
      ...prev,
      [cls.id]: date
    }));
    
    // Move to next class or complete if this was the last one
    if (currentClass < selectedClasses.length - 1) {
      setCurrentClass(currentClass + 1);
    } else {
      // Convert Date objects to ISO strings for API
      const dateSelectionsFormatted: Record<string, string> = {};
      Object.entries(dateSelections).forEach(([classId, date]) => {
        dateSelectionsFormatted[classId] = format(date, 'yyyy-MM-dd');
      });
      
      // Add the last selection
      dateSelectionsFormatted[cls.id] = format(date, 'yyyy-MM-dd');
      
      onComplete(dateSelectionsFormatted);
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  const currentClassData = selectedClasses[currentClass];
  
  if (!currentClassData) {
    return <div>No classes selected</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Select Class Dates</h2>
        <p className="text-sm text-muted-foreground">
          Please select a date for each class you want to attend.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <Card className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">
                Class {currentClass + 1} of {selectedClasses.length}
              </h3>
              <div className="mt-2 space-y-2">
                <p className="font-medium">{currentClassData.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{currentClassData.start_time} - {currentClassData.end_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{currentClassData.venue}</span>
                </div>
                <div className="mt-2">
                  <Badge>
                    {currentClassData.day_of_week === 1 ? 'Monday' : 
                     currentClassData.day_of_week === 2 ? 'Tuesday' : 
                     currentClassData.day_of_week === 3 ? 'Wednesday' : 
                     currentClassData.day_of_week === 4 ? 'Thursday' : 
                     currentClassData.day_of_week === 5 ? 'Friday' : 
                     currentClassData.day_of_week === 6 ? 'Saturday' : 'Sunday'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Available Dates:</p>
              <div className="space-y-2">
                {availableDates.map((date, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDateSelect(date)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="md:w-1/2">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={dateSelections[currentClassData.id]}
              onSelect={handleDateSelect}
              month={calendarDate}
              onMonthChange={setCalendarDate}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <p>* Only dates when this class is scheduled are selectable</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {currentClass + 1} of {selectedClasses.length} classes
        </div>
        <div className="flex gap-2">
          {currentClass > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentClass(currentClass - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
          {currentClass < selectedClasses.length - 1 && dateSelections[currentClassData.id] && (
            <Button 
              onClick={() => setCurrentClass(currentClass + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentClass === selectedClasses.length - 1 && dateSelections[currentClassData.id] && (
            <Button 
              onClick={() => {
                // Convert Date objects to ISO strings for API
                const dateSelectionsFormatted: Record<string, string> = {};
                Object.entries(dateSelections).forEach(([classId, date]) => {
                  dateSelectionsFormatted[classId] = format(date, 'yyyy-MM-dd');
                });
                onComplete(dateSelectionsFormatted);
              }}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}