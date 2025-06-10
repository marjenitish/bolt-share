'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchCalendarViewProps {
  classes: any[];
  onClassSelect: (classData: any, selectedDate?: string) => void;
  selectedClasses: any[];
}

export function SearchCalendarView({ classes, onClassSelect, selectedClasses }: SearchCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  const handlePreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Function to get class background color based on exercise type
  const getClassColor = (exerciseType: string) => {
    const colors: { [key: string]: string } = {
      'Yoga': 'bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-900',
      'Pilates': 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-900',
      'Strength': 'bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-900',
      'Balance': 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-900',
      'Aqua': 'bg-cyan-100 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-900'
    };

    // Default color if exercise type doesn't match
    return colors[exerciseType] || 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  // Check if a specific class instance (class + date) is selected
  const isClassInstanceSelected = (classId: string, date: string) => {
    return selectedClasses.some(cls => 
      cls.classDetails.id === classId && cls.selectedDate === date
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
        <h3 className="text-lg font-semibold">
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </h3>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="grid grid-cols-7 gap-px border-b bg-muted">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-24 min-h-[600px] divide-x divide-border">
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const currentDate = addDays(startDate, dayIndex);
            const formattedDate = format(currentDate, 'yyyy-MM-dd');
            const dayClasses = classes.filter(cls => 
              cls.day_of_week === dayIndex + 1 // Match day of week (1-7)
            );
            const isCurrentDay = isToday(currentDate);

            return (
              <div
                key={dayIndex}
                className={`relative min-h-[120px] p-2 ${
                  isCurrentDay ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`sticky top-0 z-10 -mx-2 -mt-2 px-2 py-1 text-sm font-medium ${
                  isCurrentDay ? 'bg-primary/10 text-primary' : 'bg-muted/50'
                }`}>
                  {format(currentDate, 'MMM d')}
                </div>
                <div className="space-y-1.5 mt-2">
                  {dayClasses.map((cls) => {
                    const selected = isClassInstanceSelected(cls.id, formattedDate);
                    
                    return (
                      <TooltipProvider key={cls.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              className={`border ${getClassColor(cls.exercise_type)} 
                                hover:scale-[1.02] transition-all cursor-pointer shadow-sm
                                hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => onClassSelect(cls, formattedDate)}
                            >
                              <div className="p-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">{cls.name}</h4>
                                  <Checkbox 
                                    checked={selected}
                                    className="h-3 w-3"
                                    onCheckedChange={() => onClassSelect(cls, formattedDate)}
                                  />
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{cls.start_time}</span>
                                </div>
                                {selected && (
                                  <div className="absolute top-1 right-1 text-primary">
                                    <CheckCircle className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-3">
                            <div className="space-y-2">
                              <p className="font-medium">{cls.name}</p>
                              <p className="text-xs text-primary font-medium">{cls.exercise_type}</p>
                              <div className="text-xs space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3" />
                                  <span>{cls.venue}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3 w-3" />
                                  <span>{cls.instructor_name}</span>
                                </div>
                                <p className="font-medium text-sm mt-2">${cls.fee_amount.toFixed(2)}</p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}