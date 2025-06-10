import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface NewsDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: any;
}

export function NewsDetails({
  open,
  onOpenChange,
  article,
}: NewsDetailsProps) {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {article.banner_image_link && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={article.banner_image_link}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{format(new Date(article.date), 'MMMM d, yyyy')}</span>
            <span>By {article.author}</span>
            <Badge variant={article.is_published ? 'default' : 'secondary'}>
              {article.is_published ? 'Published' : 'Draft'}
            </Badge>
            {article.is_featured && (
              <Badge>Featured</Badge>
            )}
          </div>

          {article.subtitle && (
            <p className="text-lg text-muted-foreground">{article.subtitle}</p>
          )}

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.description }} />

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {article.gallery_images && article.gallery_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Gallery</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {article.gallery_images.map((imageUrl: string, index: number) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {article.button_link && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Button Link:</span>
              <a
                href={article.button_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {article.button_link}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}