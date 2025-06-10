'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffRolesTable } from '@/components/roles-permissions/staff-roles-table';
import { PermissionsTable } from '@/components/roles-permissions/permissions-table';
import { usePermissions } from '@/components/providers/permission-provider';

export default function RolesPermissionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { hasPermission } = usePermissions();

  // Check if user has permission to manage roles
  const canManageRoles = hasPermission('roles_manage');

  if (!canManageRoles) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage roles and permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage staff roles and their associated permissions.
        </p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Staff Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <StaffRolesTable refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTable refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}