'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createBrowserClient } from '@/lib/supabase/client';

export function ArticleView({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select(`
            *,
            news_categories (
              name
            )
          `)
          .eq('id', articleId)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Article not found</h1>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to News
      </Button>

      {/* Banner Image */}
      {article.banner_image_link && (
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl mb-8">
          <img
            src={article.banner_image_link}
            alt={article.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Alternative Image (if no banner) */}
      {!article.banner_image_link && article.alt_image_link && (
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl mb-8">
          <img
            src={article.alt_image_link}
            alt={article.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Article Header */}
      <header className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(article.date), 'MMMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.author}
          </span>
          {article.news_categories?.name && (
            <Badge variant="outline">{article.news_categories.name}</Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        {article.subtitle && (
          <p className="text-xl text-muted-foreground">{article.subtitle}</p>
        )}
      </header>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: article.description }} />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {article.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {article.button_link && (
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <Button asChild size="lg">
            <a href={article.button_link} target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </Button>
        </div>
      )}
    </article>
  );
}