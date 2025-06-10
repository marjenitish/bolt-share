'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, FileText, Printer } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface ParticipantReportsTableProps {
  refreshKey: number;
  onRefresh: () => void;
}

export function ParticipantReportsTable({ refreshKey, onRefresh }: ParticipantReportsTableProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchCustomers();
  }, [refreshKey]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          bookings (
            id,
            term,
            is_free_trial,
            classes (
              id,
              name,
              date,
              time
            ),
            class_attendance (
              id,
              attended,
              remarks
            )
          )
        `)
        .order('surname');

      if (error) throw error;
      setCustomers(data || []);
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

  const generatePDF = (customer: any) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Participant Report: ${customer.first_name} ${customer.surname}`, 14, 22);
    
    // Add participant details
    doc.setFontSize(12);
    doc.text(`Full Name: ${customer.first_name} ${customer.surname}`, 14, 32);
    doc.text(`Mobile: ${customer.contact_no || 'N/A'}`, 14, 38);
    doc.text(`Email: ${customer.email || 'N/A'}`, 14, 44);
    doc.text(`Address: ${customer.street_number || ''} ${customer.street_name || ''}, ${customer.suburb || ''} ${customer.post_code || ''}`, 14, 50);
    
    // Calculate attendance statistics
    const totalBookings = customer.bookings?.length || 0;
    const attendedClasses = customer.bookings?.reduce((count: number, booking: any) => {
      const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
      return attended ? count + 1 : count;
    }, 0) || 0;
    
    doc.text(`Total Classes: ${totalBookings}`, 14, 60);
    doc.text(`Attended: ${attendedClasses}`, 14, 66);
    doc.text(`Attendance Rate: ${totalBookings > 0 ? Math.round((attendedClasses / totalBookings) * 100) : 0}%`, 14, 72);
    
    // Create table of classes
    const tableColumn = ["Class", "Date", "Time", "Attendance"];
    const tableRows = customer.bookings?.map((booking: any) => {
      const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
      return [
        booking.classes?.name || 'N/A',
        booking.classes?.date ? format(new Date(booking.classes.date), 'dd/MM/yyyy') : 'N/A',
        booking.classes?.time || 'N/A',
        attended ? 'Present' : 'Absent'
      ];
    }) || [];
    
    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Save the PDF
    doc.save(`participant-report-${customer.surname}-${customer.first_name}.pdf`);
    
    toast({
      title: 'Success',
      description: 'Participant report PDF generated successfully',
    });
  };

  const generateCSV = (customer: any) => {
    // Create CSV content
    const headers = ["Class", "Date", "Time", "Attendance"];
    const rows = customer.bookings?.map((booking: any) => {
      const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
      return [
        booking.classes?.name || 'N/A',
        booking.classes?.date ? format(new Date(booking.classes.date), 'dd/MM/yyyy') : 'N/A',
        booking.classes?.time || 'N/A',
        attended ? 'Present' : 'Absent'
      ];
    }) || [];
    
    const csvContent = [
      `Participant Report: ${customer.first_name} ${customer.surname}`,
      `Full Name: ${customer.first_name} ${customer.surname}`,
      `Mobile: ${customer.contact_no || 'N/A'}`,
      `Email: ${customer.email || 'N/A'}`,
      `Address: ${customer.street_number || ''} ${customer.street_name || ''}, ${customer.suburb || ''} ${customer.post_code || ''}`,
      `Total Classes: ${customer.bookings?.length || 0}`,
      ``,
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participant-report-${customer.surname}-${customer.first_name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Success',
      description: 'Participant report CSV generated successfully',
    });
  };

  const printReport = (customer: any) => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Calculate attendance statistics
    const totalBookings = customer.bookings?.length || 0;
    const attendedClasses = customer.bookings?.reduce((count: number, booking: any) => {
      const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
      return attended ? count + 1 : count;
    }, 0) || 0;
    
    const html = `
      <html>
        <head>
          <title>Participant Report: ${customer.first_name} ${customer.surname}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 18px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Participant Report: ${customer.first_name} ${customer.surname}</h1>
          <div class="details">
            <p><strong>Full Name:</strong> ${customer.first_name} ${customer.surname}</p>
            <p><strong>Mobile:</strong> ${customer.contact_no || 'N/A'}</p>
            <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
            <p><strong>Address:</strong> ${customer.street_number || ''} ${customer.street_name || ''}, ${customer.suburb || ''} ${customer.post_code || ''}</p>
            <p><strong>Total Classes:</strong> ${totalBookings}</p>
            <p><strong>Attended:</strong> ${attendedClasses}</p>
            <p><strong>Attendance Rate:</strong> ${totalBookings > 0 ? Math.round((attendedClasses / totalBookings) * 100) : 0}%</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${customer.bookings?.map((booking: any) => {
                const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
                return `
                  <tr>
                    <td>${booking.classes?.name || 'N/A'}</td>
                    <td>${booking.classes?.date ? format(new Date(booking.classes.date), 'dd/MM/yyyy') : 'N/A'}</td>
                    <td>${booking.classes?.time || 'N/A'}</td>
                    <td>${attended ? 'Present' : 'Absent'}</td>
                  </tr>
                `;
              }).join('') || ''}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
    };
    
    toast({
      title: 'Success',
      description: 'Participant report sent to printer',
    });
  };

  const filteredCustomers = customers.filter(customer => 
    `${customer.first_name} ${customer.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_no?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => {
              const totalBookings = customer.bookings?.length || 0;
              const attendedClasses = customer.bookings?.reduce((count: number, booking: any) => {
                const attended = booking.class_attendance?.some((a: any) => a.attended) || false;
                return attended ? count + 1 : count;
              }, 0) || 0;
              
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.surname}, {customer.first_name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.contact_no}</div>
                    <div className="text-sm text-muted-foreground">{customer.work_mobile}</div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.street_number} {customer.street_name}</div>
                    <div className="text-sm text-muted-foreground">{customer.suburb}, {customer.post_code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {totalBookings} Classes
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {totalBookings > 0 ? Math.round((attendedClasses / totalBookings) * 100) : 0}% Attendance
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePDF(customer)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateCSV(customer)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printReport(customer)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No participants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}