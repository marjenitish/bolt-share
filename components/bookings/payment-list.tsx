'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PaymentListProps {
  payments?: any[];
  onDownloadReceipt: (payment: any) => void;
}

export function PaymentList({ payments = [], onDownloadReceipt }: PaymentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'outline';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.receipt_number}</TableCell>
              <TableCell>
                {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="capitalize">{payment.payment_method}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(payment.payment_status)}>
                  {payment.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownloadReceipt(payment)}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Receipt</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!payments || payments.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}