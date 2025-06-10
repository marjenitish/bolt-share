'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface InstructorDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor: any;
}

export function InstructorDetails({
  open,
  onOpenChange,
  instructor,
}: InstructorDetailsProps) {
  if (!instructor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{instructor.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={instructor.image_link} alt={instructor.name} />
              <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{instructor.name}</h2>
              <p className="text-lg text-primary">{instructor.specialty}</p>
            </div>
          </div>

          {instructor.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{instructor.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">{instructor.email}</p>
              <p className="text-muted-foreground">{instructor.contact_no}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Address</h3>
            <p className="text-muted-foreground">{instructor.address}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}