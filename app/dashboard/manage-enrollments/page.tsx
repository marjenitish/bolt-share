'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface Enrollment {
  id: string;
  enrollment_type: string;
  status: string;
  payment_status: string;
  created_at: string;
  customers: {
    first_name: string;
    surname: string;
  } | null;
}

export default function ManageEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, enrollment_type, status, payment_status, created_at,
          customers (first_name, surname)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      } else {
        setEnrollments(data || []);
      }
      setLoading(false);
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(enrollment => {
    const customerName = `${enrollment.customers?.first_name || ''} ${enrollment.customers?.surname || ''}`.toLowerCase();
    const enrollmentType = enrollment.enrollment_type.toLowerCase();
    const paymentStatus = enrollment.payment_status.toLowerCase();
    const enrolledDate = format(new Date(enrollment.created_at), 'yyyy-MM-dd').toLowerCase();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return (
      customerName.includes(lowerCaseSearchTerm) ||
      enrollmentType.includes(lowerCaseSearchTerm) ||
      paymentStatus.includes(lowerCaseSearchTerm) ||
      enrolledDate.includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Enrollments</h1>
        <Button asChild>
          <Link href="/dashboard/create-enrollment">Create Enrollment</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="p-4">
            <Input
              placeholder="Search enrollments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SN</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Enrollment Type</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No enrollments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment, index) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{enrollment.customers?.first_name} {enrollment.customers?.surname}</TableCell>
                      <TableCell>{enrollment.enrollment_type}</TableCell>
                      <TableCell>{enrollment.payment_status}</TableCell>
                      <TableCell>{format(new Date(enrollment.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          {/* Link to view enrollment details (create this page later) */}
                          <Link href={`/dashboard/view-enrollment/${enrollment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                  )
                )
              }
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}