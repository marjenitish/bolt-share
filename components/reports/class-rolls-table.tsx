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
import { Search, Calendar, Download, FileText, Printer } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface ClassRollsTableProps {
  refreshKey: number;
  onRefresh: () => void;
}

export function ClassRollsTable({ refreshKey, onRefresh }: ClassRollsTableProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { toast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchClasses();
  }, [refreshKey, selectedDate]);

  const fetchClasses = async () => {
    try {
      let query = supabase
        .from('classes')
        .select(`
          *,
          instructors (
            name
          ),
          bookings (
            id,
            customers (
              id,
              first_name,
              surname
            )
          )
        `)
        .order('date', { ascending: false });

      if (selectedDate) {
        query = query.eq('date', selectedDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClasses(data || []);
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

  const generatePDF = (classData: any) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Class Roll: ${classData.name}`, 14, 22);
    
    // Add class details
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(classData.date), 'dd/MM/yyyy')}`, 14, 32);
    doc.text(`Time: ${classData.time}`, 14, 38);
    doc.text(`Venue: ${classData.venue}`, 14, 44);
    doc.text(`Instructor: ${classData.instructors?.name}`, 14, 50);
    
    // Create table
    const tableColumn = ["Name", "Present", "Signature", "Notes"];
    const tableRows = classData.bookings?.map((booking: any) => [
      `${booking.customers.surname}, ${booking.customers.first_name}`,
      "", // Present checkbox
      "", // Signature
      ""  // Notes
    ]) || [];
    
    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 }
      }
    });
    
    // Save the PDF
    doc.save(`class-roll-${classData.name}-${format(new Date(classData.date), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: 'Success',
      description: 'Class roll PDF generated successfully',
    });
  };

  const generateCSV = (classData: any) => {
    // Create CSV content
    const headers = ["Name", "Present", "Notes"];
    const rows = classData.bookings?.map((booking: any) => [
      `${booking.customers.surname}, ${booking.customers.first_name}`,
      "",
      ""
    ]) || [];
    
    const csvContent = [
      `Class: ${classData.name}`,
      `Date: ${format(new Date(classData.date), 'dd/MM/yyyy')}`,
      `Time: ${classData.time}`,
      `Venue: ${classData.venue}`,
      `Instructor: ${classData.instructors?.name}`,
      "",
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `class-roll-${classData.name}-${format(new Date(classData.date), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Success',
      description: 'Class roll CSV generated successfully',
    });
  };

  const printRoll = (classData: any) => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Class Roll: ${classData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 18px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .present-col { width: 60px; }
            .signature-col { width: 150px; }
          </style>
        </head>
        <body>
          <h1>Class Roll: ${classData.name}</h1>
          <div class="details">
            <p>Date: ${format(new Date(classData.date), 'dd/MM/yyyy')}</p>
            <p>Time: ${classData.time}</p>
            <p>Venue: ${classData.venue}</p>
            <p>Instructor: ${classData.instructors?.name}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th class="present-col">Present</th>
                <th class="signature-col">Signature</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${classData.bookings?.map((booking: any) => `
                <tr>
                  <td>${booking.customers.surname}, ${booking.customers.first_name}</td>
                  <td>□</td>
                  <td></td>
                  <td></td>
                </tr>
              `).join('') || ''}
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
      description: 'Class roll sent to printer',
    });
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.instructors?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell>
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-sm text-muted-foreground">{cls.venue}</div>
                </TableCell>
                <TableCell>
                  {format(new Date(cls.date), 'dd/MM/yyyy')}
                  <div className="text-sm text-muted-foreground">{cls.time}</div>
                </TableCell>
                <TableCell>{cls.instructors?.name}</TableCell>
                <TableCell>
                  <Badge>
                    {cls.bookings?.length || 0} Enrolled
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(cls)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateCSV(cls)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printRoll(cls)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No classes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}