'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Search, Pencil } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { PermissionModal } from './permission-modal';
import { useToast } from '@/hooks/use-toast';

interface PermissionsTableProps {
  refreshKey: number;
  onRefresh: () => void;
}

export function PermissionsTable({ refreshKey, onRefresh }: PermissionsTableProps) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchPermissions();
  }, [refreshKey]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (error) throw error;
      setPermissions(data || []);
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

  const handleSubmit = async (data: any) => {
    try {
      if (selectedPermission) {
        const { error } = await supabase
          .from('permissions')
          .update({
            name: data.name,
            description: data.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPermission.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Permission updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('permissions')
          .insert([{
            name: data.name,
            description: data.description,
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Permission created successfully',
        });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setSelectedPermission(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPermission(permission);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredPermissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No permissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PermissionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        permission={selectedPermission}
        onSubmit={handleSubmit}
      />
    </div>
  );
}