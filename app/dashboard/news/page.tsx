'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { usePermissions } from '@/components/providers/permission-provider';

// Dynamically import components that might use document
const NewsTable = dynamic(() => import('@/components/news/news-table').then(mod => ({ default: mod.NewsTable })), {
  ssr: false
});

const NewsModal = dynamic(() => import('@/components/news/news-modal').then(mod => ({ default: mod.NewsModal })), {
  ssr: false
});

const NewsDetails = dynamic(() => import('@/components/news/news-details').then(mod => ({ default: mod.NewsDetails })), {
  ssr: false
});


export default function NewsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const supabase = createBrowserClient();

  const handleEdit = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleView = (article: any) => {
    setSelectedArticle(article);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedArticle) {
        // Update existing article
        const { error } = await supabase
          .from('news_articles')
          .update({
            category_id: data.categoryId,
            date: data.date,
            author: data.author,
            banner_image_link: data.bannerImageLink,
            alt_image_link: data.altImageLink,
            published_date: data.isPublished ? new Date().toISOString() : null,
            is_published: data.isPublished,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            tags: data.tags,
            is_featured: data.isFeatured,
            gallery_images: data.galleryImages,
            button_link: data.buttonLink,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedArticle.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Article updated successfully',
        });
      } else {
        // Create new article
        const { error } = await supabase.from('news_articles').insert([{
          category_id: data.categoryId,
          date: data.date,
          author: data.author,
          banner_image_link: data.bannerImageLink,
          alt_image_link: data.altImageLink,
          published_date: data.isPublished ? new Date().toISOString() : null,
          is_published: data.isPublished,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          tags: data.tags,
          is_featured: data.isFeatured,
          gallery_images: data.galleryImages,
          button_link: data.buttonLink,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Article created successfully',
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
  const canView = hasPermission('news_read');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">News & Events</h1>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        )}
      </div>

      <NewsTable
        onEdit={canEdit ? handleEdit : undefined}
        onView={canView ? handleView : undefined}
        refreshKey={refreshKey}
      />

      {(canCreate || canEdit) && (
        <NewsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          article={selectedArticle}
          onSubmit={handleSubmit}
        />
      )}

      {canView && (
        <NewsDetails
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          article={selectedArticle}
        />
      )}
    </div>
  );
}