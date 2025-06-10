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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Shield } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { StaffRoleModal } from './staff-role-modal';
import { AssignPermissionsModal } from './assign-permissions-modal';
import { useToast } from '@/hooks/use-toast';

interface StaffRolesTableProps {
  refreshKey: number;
  onRefresh: () => void;
}

export function StaffRolesTable({ refreshKey, onRefresh }: StaffRolesTableProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchRoles();
  }, [refreshKey]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_roles')
        .select(`
          *,
          staff_role_permissions (
            permissions (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setRoles(data || []);
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
      if (selectedRole) {
        const { error } = await supabase
          .from('staff_roles')
          .update({
            name: data.name,
            description: data.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedRole.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Role updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('staff_roles')
          .insert([{
            name: data.name,
            description: data.description,
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Role created successfully',
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

  const handlePermissionsSubmit = async (roleId: string, permissionIds: string[]) => {
    try {
      // First, delete existing permissions
      const { error: deleteError } = await supabase
        .from('staff_role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // Then, insert new permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('staff_role_permissions')
          .insert(
            permissionIds.map(permissionId => ({
              role_id: roleId,
              permission_id: permissionId,
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
      });

      setIsPermissionsModalOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search roles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setSelectedRole(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.staff_role_permissions?.map((rp: any) => (
                      <Badge key={rp.permissions.id} variant="outline">
                        {rp.permissions.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsPermissionsModalOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="sr-only">Permissions</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No roles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StaffRoleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        role={selectedRole}
        onSubmit={handleSubmit}
      />

      <AssignPermissionsModal
        open={isPermissionsModalOpen}
        onOpenChange={setIsPermissionsModalOpen}
        role={selectedRole}
        onSubmit={handlePermissionsSubmit}
      />
    </div>
  );
}