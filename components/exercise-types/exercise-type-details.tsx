'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExerciseTypeDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseType: any;
}

export function ExerciseTypeDetails({
  open,
  onOpenChange,
  exerciseType,
}: ExerciseTypeDetailsProps) {
  if (!exerciseType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{exerciseType.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{exerciseType.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What to Bring</h3>
            <ul className="list-disc list-inside space-y-1">
              {exerciseType.what_to_bring?.map((item: string, index: number) => (
                <li key={index} className="text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Duration</h3>
              <p className="text-muted-foreground">{exerciseType.duration}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Cost</h3>
              <p className="text-muted-foreground">${exerciseType.cost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}