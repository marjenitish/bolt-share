'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/shared/navigation';
import { Input } from '@/components/ui/input';
import { Search, Calendar } from 'lucide-react';

export default function InstructorAllClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchClasses();
  }, [selectedDate]);

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Get instructor ID
      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!instructor) {
        router.push('/');
        return;
      }

      // Build query
      let query = supabase
        .from('classes')
        .select(`
          *,
          bookings (
            *
          )
        `)
        .eq('instructor_id', instructor.id);

      // Add date filter if selected
      if (selectedDate) {
        query = query.eq('date', selectedDate);
      }

      const { data: classesData } = await query;
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Classes</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{cls.name}</h2>
                  <p className="text-muted-foreground">
                    {/* {format(new Date(cls.date), 'dd/MM/yyyy')} • {cls.time} • {cls.venue} */}
                    N/A • {cls.time} • {cls.venue}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">
                      {/* {format(new Date(cls.date), 'EEEE')} */}
                      N/A
                    </Badge>
                    <Badge>
                      {cls.bookings?.length || 0} Enrolled
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/instructor-portal/classes/${cls.id}`)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No classes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}