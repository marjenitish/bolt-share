'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceReportsTable } from '@/components/reports/attendance-reports-table';
import { ClassRollsTable } from '@/components/reports/class-rolls-table';
import { ParticipantReportsTable } from '@/components/reports/participant-reports-table';
import { usePermissions } from '@/components/providers/permission-provider';

export default function ReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { hasPermission } = usePermissions();

  // Check if user has permission to view reports
  const canViewReports = hasPermission('reports_view');

  if (!canViewReports) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View and manage class attendance reports and rolls.
        </p>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
          <TabsTrigger value="rolls">Class Rolls</TabsTrigger>
          <TabsTrigger value="participants">Participant Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <AttendanceReportsTable refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="rolls">
          <ClassRollsTable refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="participants">
          <ParticipantReportsTable refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}