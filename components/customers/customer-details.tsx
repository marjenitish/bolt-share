'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CustomerDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
}

export function CustomerDetails({
  open,
  onOpenChange,
  customer,
}: CustomerDetailsProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {customer.surname}, {customer.first_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Contact</h4>
                <p className="text-muted-foreground">{customer.contact_no}</p>
                <p className="text-muted-foreground">{customer.email}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Work Mobile</h4>
                <p className="text-muted-foreground">{customer.work_mobile || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-1">Address</h4>
              <p className="text-muted-foreground">
                {customer.street_number} {customer.street_name}<br />
                {customer.suburb}, {customer.post_code}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Personal Details</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Date of Birth</h4>
                <p className="text-muted-foreground">
                  {customer.date_of_birth ? format(new Date(customer.date_of_birth), 'dd/MM/yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Country of Birth</h4>
                <p className="text-muted-foreground">{customer.country_of_birth || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Language Other Than English</h4>
                <p className="text-muted-foreground">{customer.language_other_than_english || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">English Proficiency</h4>
                <p className="text-muted-foreground">{customer.english_proficiency || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-1">Indigenous Status</h4>
              <p className="text-muted-foreground">{customer.indigenous_status}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Occupation</h4>
                <p className="text-muted-foreground">{customer.occupation || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Reason for Class</h4>
                <p className="text-muted-foreground">{customer.reason_for_class || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-1">How Did You Hear About Us</h4>
              <p className="text-muted-foreground">{customer.how_did_you_hear || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Next of Kin</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Name</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Relationship</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_relationship || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Mobile</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_mobile || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Phone</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Status</h3>
            <div className="mt-4">
              <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                {customer.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}