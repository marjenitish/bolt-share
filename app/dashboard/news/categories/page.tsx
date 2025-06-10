'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryTable } from '@/components/news/category-table';
import { CategoryModal } from '@/components/news/category-modal';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const { error } = await supabase
          .from('news_categories')
          .update({
            name: data.name,
            status: data.status,
            tags: data.tags,
            is_featured: data.isFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedCategory.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        const { error } = await supabase.from('news_categories').insert([{
          name: data.name,
          status: data.status,
          tags: data.tags,
          is_featured: data.isFeatured,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Category created successfully',
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

  const canCreate = hasPermission('news_create');
  const canEdit = hasPermission('news_update');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      <CategoryTable
        onEdit={canEdit ? handleEdit : undefined}
        refreshKey={refreshKey}
      />

      {(canCreate || canEdit) && (
        <CategoryModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          category={selectedCategory}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}