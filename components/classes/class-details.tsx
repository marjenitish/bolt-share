'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClassDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function ClassDetails({
  open,
  onOpenChange,
  classData,
}: ClassDetailsProps) {
  if (!classData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{classData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Code</h3>
              <p className="text-muted-foreground">{classData.code}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Exercise Type</h3>
              <p className="text-muted-foreground">{classData.exercise_types?.name}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-muted-foreground">{classData.venue}</p>
            <p className="text-sm text-muted-foreground">
              {classData.address}
              {classData.zip_code && `, ${classData.zip_code}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Date</h3>
              <p className="text-muted-foreground">
                {/* {format(new Date(classData.date), 'dd/MM/yyyy')} */}
                N/A
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Time</h3>
              <p className="text-muted-foreground">{classData.time}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Instructor</h3>
            <p className="text-muted-foreground">{classData.instructors?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Fee Criteria</h3>
              <p className="text-muted-foreground">{classData.fee_criteria}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fee Amount</h3>
              <p className="text-muted-foreground">${classData.fee_amount.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Term</h3>
            <p className="text-muted-foreground">{classData.term}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}