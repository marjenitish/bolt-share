import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface EnrollmentCompleteProps {
  selectedClasses: any[];
  enrollmentType: 'trial' | 'direct';
  onClose: () => void;
}

export function EnrollmentComplete({ selectedClasses, enrollmentType, onClose }: EnrollmentCompleteProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {enrollmentType === 'trial' 
          ? 'Trial Class Booked Successfully!'
          : 'Enrollment Complete!'}
      </h2>

      <p className="text-muted-foreground mb-6">
        {enrollmentType === 'trial'
          ? 'Your trial class has been booked. We look forward to meeting you!'
          : `You've successfully enrolled in ${selectedClasses.length} ${selectedClasses.length === 1 ? 'class' : 'classes'}. We're excited to have you join us!`}
      </p>

      <div className="bg-muted/30 rounded-lg p-6 mb-6 text-left">
        <h3 className="font-semibold mb-2">Class Details</h3>
        <div className="space-y-3">
          {selectedClasses.map((cls) => (
            <div key={cls.id} className="border-b pb-2">
              <p className="font-medium">{cls.name}</p>
              <p className="text-sm text-muted-foreground">
                {cls.day_of_week === 1 ? 'Monday' : 
                 cls.day_of_week === 2 ? 'Tuesday' : 
                 cls.day_of_week === 3 ? 'Wednesday' : 
                 cls.day_of_week === 4 ? 'Thursday' : 
                 cls.day_of_week === 5 ? 'Friday' : 
                 cls.day_of_week === 6 ? 'Saturday' : 'Sunday'} at {cls.start_time}
              </p>
              <p className="text-sm text-muted-foreground">Location: {cls.venue}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Card>
  );
}