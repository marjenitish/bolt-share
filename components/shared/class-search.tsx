'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase/client';

export function ClassSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const supabase = createBrowserClient();
  
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [exerciseTypeId, setExerciseTypeId] = useState(searchParams.get('exerciseTypeId') || 'all');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchExerciseTypes = async () => {
      const { data } = await supabase
        .from('exercise_types')
        .select('id, name')
        .order('name');
      
      if (data) {
        setExerciseTypes(data);
      }
    };

    fetchExerciseTypes();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (exerciseTypeId) params.set('exerciseTypeId', exerciseTypeId);
    if (date) params.set('date', date);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border bg-gradient-to-br from-secondary/10 via-background to-tertiary/10 p-8 shadow-lg">
      <div className="max-w-xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Find Your Perfect Class</h2>
        <p className="text-muted-foreground">
          Join our welcoming community and discover classes that match your interests and schedule.
        </p>
      </div>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Location</label>
            <Input 
              placeholder="Enter postcode or suburb" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Class Type</label>
            <Select value={exerciseTypeId} onValueChange={setExerciseTypeId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {exerciseTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Date</label>
            <Input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex items-end">
            <Button 
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Find Classes
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Need help finding a class? Call us at 1800 XXX XXX</p>
      </div>
    </div>
  );
}