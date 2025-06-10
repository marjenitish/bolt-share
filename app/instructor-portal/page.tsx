'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, History, List } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';
import CalendarPage from '../dashboard/bookings/calendar/page';

export default function InstructorPortalPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Check if user is an instructor
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userData || userData.role !== 'instructor') {
        router.push('/');
        return;
      }

      setUser(userData);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Instructor Portal</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => router.push('/instructor-portal/classes')}>
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Today's Classes</h2>
                <p className="text-muted-foreground">View and manage your upcoming classes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/instructor-portal/all-classes')}>
            <div className="flex items-center gap-4">
              <List className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">All Classes</h2>
                <p className="text-muted-foreground">View all your assigned classes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/instructor-portal/history')}>
            <div className="flex items-center gap-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Class History</h2>
                <p className="text-muted-foreground">View past classes and attendance records</p>
              </div>
            </div>
          </Card>
        </div>

        <CalendarPage />
      </div>
    </div>
  );
}