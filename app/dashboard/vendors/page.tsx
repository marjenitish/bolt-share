'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorsTable } from '@/components/vendors/vendors-table';
import { VendorModal } from '@/components/vendors/vendor-modal';
import { VendorDetails } from '@/components/vendors/vendor-details';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';

export default function VendorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  const handleEdit = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleView = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedVendor) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update({
            name: data.name,
            api_key: data.api_key,
            username: data.username,
            ip_whitelist: data.ip_whitelist,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedVendor.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Vendor updated successfully',
        });
      } else {
        // Create new vendor
        const { error } = await supabase.from('vendors').insert([{
          name: data.name,
          api_key: data.api_key,
          username: data.username,
          ip_whitelist: data.ip_whitelist,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Vendor created successfully',
        });
      }

      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const canManageVendors = hasPermission('vendor_manage');
  
  if (!canManageVendors) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage vendors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <VendorsTable
        onEdit={handleEdit}
        onView={handleView}
        refreshKey={refreshKey}
      />

      <VendorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vendor={selectedVendor}
        onSubmit={handleSubmit}
      />

      <VendorDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        vendor={selectedVendor}
      />
    </div>
  );
}