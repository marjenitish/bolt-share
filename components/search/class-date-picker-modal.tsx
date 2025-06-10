'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, isSameDay, isAfter, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface ClassDatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
  onDateSelect: (classData: any, selectedDate: string) => void;
}

export function ClassDatePickerModal({
  open,
  onOpenChange,
  classData,
  onDateSelect,
}: ClassDatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setSelectedDate(undefined);
    }
  }, [open]);

  if (!classData) return null;

  // Get the day of week from the class (1-7, where 1 is Monday)
  const classDayOfWeek = classData.day_of_week;

  // Function to check if a date is valid for selection
  const isDateValid = (date: Date) => {
    // Only allow dates that match the class day of week
    // JavaScript getDay() returns 0-6 where 0 is Sunday, so we need to convert
    const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfWeek = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 where 1 is Monday, 7 is Sunday
    
    // Only allow future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dayOfWeek === classDayOfWeek && isAfter(date, today);
  };

  // Generate dates for the current month that match the class day of week
  const getValidDatesForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const dates: Date[] = [];
    
    let current = start;
    while (isBefore(current, end) || isSameDay(current, end)) {
      if (isDateValid(current)) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    
    return dates;
  };

  const validDates = getValidDatesForMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(classData, format(selectedDate, 'yyyy-MM-dd'));
      onOpenChange(false);
    }
  };

  // Get day name from day of week number
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek - 1];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a date for {classData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>This class runs every {getDayName(classDayOfWeek)}.</p>
            <p>Please select a date to book this class.</p>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => !isDateValid(date)}
            initialFocus
          />
          
          {validDates.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No available dates for this class in {format(currentMonth, 'MMMM yyyy')}.
              <br />
              Please try another month.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}