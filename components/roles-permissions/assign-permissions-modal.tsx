'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: any;
  onSubmit: (roleId: string, permissionIds: string[]) => void;
}

export function AssignPermissionsModal({
  open,
  onOpenChange,
  role,
  onSubmit,
}: AssignPermissionsModalProps) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const supabase = createBrowserClient();

  useEffect(() => {
    if (role) {
      fetchPermissions();
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (error) throw error;
      setPermissions(data || []);

      // Set initially selected permissions
      const selectedIds = role.staff_role_permissions?.map((rp: any) => rp.permissions.id) || [];
      setSelectedPermissions(selectedIds);
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

  const handleSubmit = () => {
    onSubmit(role.id, selectedPermissions);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Assign Permissions - {role.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {filteredPermissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center space-x-2 p-4"
              >
                <Checkbox
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={() => togglePermission(permission.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={permission.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.name}
                  </label>
                  {permission.description && (
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Save Permissions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}