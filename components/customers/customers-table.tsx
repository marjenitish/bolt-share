'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Pencil, Search, Eye } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { usePermissions } from '@/components/providers/permission-provider';

interface CustomersTableProps {
  onEdit?: (customer: any) => void;
  refreshKey: number;
  selectedCustomers: string[];
  onSelectedCustomersChange: (ids: string[]) => void;
}

export function CustomersTable({
  onEdit,
  refreshKey,
  selectedCustomers,
  onSelectedCustomersChange,
}: CustomersTableProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('surname');

        if (error) throw error;

        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [refreshKey]);

  const filteredCustomers = customers.filter((customer) => {
    const searchString = searchTerm.toLowerCase();
    return (
      customer.surname.toLowerCase().includes(searchString) ||
      customer.first_name.toLowerCase().includes(searchString) ||
      customer.email?.toLowerCase().includes(searchString) ||
      customer.contact_no?.includes(searchString)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedCustomersChange(filteredCustomers.map(c => c.id));
    } else {
      onSelectedCustomersChange([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      onSelectedCustomersChange([...selectedCustomers, customerId]);
    } else {
      onSelectedCustomersChange(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleViewDetails = (customer: any) => {
    if (hasPermission('customer_read')) {
      router.push(`/dashboard/customers/${customer.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  const canViewDetails = hasPermission('customer_read');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedCustomers.length === filteredCustomers.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={(checked) => handleSelectCustomer(customer.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {customer.surname}, {customer.first_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {customer.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{customer.contact_no}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.work_mobile}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{customer.street_number} {customer.street_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.suburb}, {customer.post_code}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.date_of_birth
                    ? format(new Date(customer.date_of_birth), 'dd/MM/yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === 'Active' ? 'default' : 'secondary'}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canViewDetails && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(customer)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}