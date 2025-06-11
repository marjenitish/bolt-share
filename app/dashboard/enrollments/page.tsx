'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardEnrollmentWizard } from '@/components/dashboard/enrollment-wizard';
import { getDayName } from '@/lib/utils';
import { usePermissions } from '@/components/providers/permission-provider';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchEnrollments();
  }, [refreshKey]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          customers (
            id,
            first_name,
            surname,
            email
          ),
          bookings (
            id,
            class_id,
            booking_date,
            term,
            is_free_trial,
            classes (
              id,
              name,
              day_of_week,
              start_time,
              end_time,
              venue,
              fee_amount
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const customerName = `${enrollment.customers?.surname}, ${enrollment.customers?.first_name}`.toLowerCase();
    const customerEmail = enrollment.customers?.email?.toLowerCase() || '';
    const searchString = searchTerm.toLowerCase();
    
    return customerName.includes(searchString) || customerEmail.includes(searchString);
  });

  const calculateTotalAmount = (enrollment: any) => {
    return enrollment.bookings?.reduce((sum: number, booking: any) => 
      sum + (booking.classes?.fee_amount || 0), 0) || 0;
  };

  const canCreateEnrollment = hasPermission('create_enrollments');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
          {canCreateEnrollment && (
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Enrollment
            </Button>
          )}
        </div>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
        {canCreateEnrollment && (
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Enrollment
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="font-medium">
                    {enrollment.customers?.surname}, {enrollment.customers?.first_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {enrollment.customers?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={enrollment.enrollment_type === 'trial' ? 'secondary' : 'default'}>
                    {enrollment.enrollment_type === 'trial' ? 'Trial' : 'Direct'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    enrollment.status === 'active' ? 'default' : 
                    enrollment.status === 'pending' ? 'secondary' : 
                    enrollment.status === 'completed' ? 'outline' : 'destructive'
                  }>
                    {enrollment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    enrollment.payment_status === 'paid' ? 'default' : 
                    enrollment.payment_status === 'pending' ? 'secondary' : 
                    'destructive'
                  }>
                    {enrollment.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {enrollment.bookings?.map((booking: any) => (
                      <div key={booking.id} className="text-sm">
                        <div className="font-medium">{booking.classes?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getDayName(booking.classes?.day_of_week)} • {format(new Date(booking.booking_date), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  ${calculateTotalAmount(enrollment).toFixed(2)}
                </TableCell>
                <TableCell>
                  {format(new Date(enrollment.created_at), 'dd/MM/yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {filteredEnrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No enrollments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {canCreateEnrollment && (
        <DashboardEnrollmentWizard
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
}