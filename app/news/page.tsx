'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Navigation } from '@/components/shared/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesResponse, categoriesResponse] = await Promise.all([
          supabase
            .from('news_articles')
            .select(`
              *,
              news_categories (
                name
              )
            `)
            .eq('is_published', true)
            .order('date', { ascending: false }),
          supabase
            .from('news_categories')
            .select('*')
            .eq('status', 'active')
            .order('name')
        ]);

        if (articlesResponse.error) throw articlesResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;

        setArticles(articlesResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      article.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);
  const regularArticles = filteredArticles.filter(article => !article.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">News & Updates</h1>
          <div className="max-w-2xl">
            <p className="text-xl text-muted-foreground">
              Stay informed about the latest news, events, and updates from SHARE. Discover new classes, wellness tips, and community stories.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Stories</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {featuredArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group"
                >
                  <article className="rounded-xl border bg-card overflow-hidden h-full">
                    <div className="aspect-[16/9] relative">
                      <img
                        src={article.banner_image_link || article.alt_image_link}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(article.date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.author}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      {article.subtitle && (
                        <p className="text-muted-foreground mb-4">{article.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge>{article.news_categories?.name}</Badge>
                        {article.tags?.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Articles */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest News</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {regularArticles.map(article => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="group"
              >
                <article className="rounded-xl border bg-card overflow-hidden h-full">
                  <div className="aspect-[16/9] relative">
                    <img
                      src={article.banner_image_link || article.alt_image_link}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(article.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">{article.subtitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <Badge>{article.news_categories?.name}</Badge>
                      <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest news, class updates, and wellness tips directly in your inbox.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <Input placeholder="Enter your email" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}