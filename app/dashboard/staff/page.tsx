'use client';

import { useState } from 'react';
import { StaffTable } from '@/components/staff/staff-table';
import { StaffModal } from '@/components/staff/staff-modal';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/components/providers/permission-provider';

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Check if user has permission to manage staff
  const canManageStaff = hasPermission('roles_manage');

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  if (!canManageStaff) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage staff accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage backend staff accounts and their roles.
        </p>
      </div>

      <StaffTable
        onEdit={handleEdit}
        onCreate={handleCreate}
        refreshKey={refreshKey}
      />

      <StaffModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        staff={selectedStaff}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey(prev => prev + 1);
          toast({
            title: 'Success',
            description: selectedStaff 
              ? 'Staff member updated successfully'
              : 'Staff member created successfully',
          });
        }}
      />
    </div>
  );
}