'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, LayoutGrid, CalendarDays, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';
import { ClassSearch } from '@/components/shared/class-search';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EnrollmentSteps } from '@/components/enrollment/enrollment-steps';
import { EnrollmentComplete } from '@/components/enrollment/enrollment-complete';
import { SearchCalendarView } from '@/components/search/search-calendar-view';
import { createBrowserClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassesToEnroll, setSelectedClassesToEnroll] = useState<any[]>([]);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [isEnrollmentComplete, setIsEnrollmentComplete] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<'trial' | 'direct'>('direct');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchResults = async () => {
      const location = searchParams.get('location');
      const exerciseTypeId = searchParams.get('exerciseTypeId');      

      let query = supabase
        .from('classes')
        .select(`
          *,
          exercise_types (name),
          instructors (name)
        `);

      if (location) {
        query = query.or(`venue.ilike.%${location}%,zip_code.ilike.%${location}%`);
      }

      if (exerciseTypeId && exerciseTypeId !== 'all') {
        query = query.eq('exercise_type_id', exerciseTypeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching classes:', error);
        return;
      }

      const formattedResults = data?.map(cls => ({
        id: cls.id,
        name: cls.name,
        venue: cls.venue,
        day_of_week: cls.day_of_week,
        start_time: cls.start_time,
        end_time: cls.end_time,
        instructor_name: cls.instructors?.name,
        exercise_type: cls.exercise_types?.name,
        fee_amount: cls.fee_amount
      })) || [];

      setSearchResults(formattedResults);
      setLoading(false);
    };

    fetchResults();
  }, [searchParams]);

  const handleToggleClass = (classData: any) => {
    setSelectedClassesToEnroll(prev => {
      const isSelected = prev.some(cls => cls.id === classData.id);
      if (isSelected) {
        return prev.filter(cls => cls.id !== classData.id);
      } else {
        return [...prev, classData];
      }
    });
  };

  const handleEnrollSelected = () => {
    if (selectedClassesToEnroll.length > 0) {
      setIsEnrollmentOpen(true);
    }
  };

  const handleEnrollmentComplete = () => {
    setIsEnrollmentOpen(false);
    setIsEnrollmentComplete(true);
    // Clear selected classes after enrollment is complete
    setSelectedClassesToEnroll([]);
  };

  const calculateTotalFee = () => {
    return selectedClassesToEnroll.reduce((total, cls) => total + cls.fee_amount, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ClassSearch />
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Search Results</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </div>
            </div>
            
            {/* Selected Classes Summary */}
            {selectedClassesToEnroll.length > 0 && (
              <div className="bg-card border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Selected Classes ({selectedClassesToEnroll.length})</h3>
                    <p className="text-sm text-muted-foreground">Total: ${calculateTotalFee().toFixed(2)}</p>
                  </div>
                  <Button onClick={handleEnrollSelected}>
                    Enroll in Selected Classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedClassesToEnroll.map((cls) => (
                    <Badge key={cls.id} variant="outline" className="flex items-center gap-1 py-1.5 px-3">
                      {cls.name}
                      <button 
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleToggleClass(cls)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((cls) => {
                    const isSelected = selectedClassesToEnroll.some(selected => selected.id === cls.id);
                    
                    return (
                      <div 
                        key={cls.id} 
                        className={`rounded-xl border bg-card overflow-hidden transition-all ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        
                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          )}
                        <div className="p-6">
                          
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold">{cls.name}</h3>
                            <div className="flex items-center">
                              <Checkbox 
                                id={`select-${cls.id}`}
                                checked={isSelected}
                                onCheckedChange={() => handleToggleClass(cls)}
                                className="mr-2"
                              />
                              <label htmlFor={`select-${cls.id}`} className="text-sm cursor-pointer">
                                Select
                              </label>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {cls.exercise_type}
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground mb-6">
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {cls.venue}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              {cls.day_of_week === 1 ? 'Monday' : 
                               cls.day_of_week === 2 ? 'Tuesday' : 
                               cls.day_of_week === 3 ? 'Wednesday' : 
                               cls.day_of_week === 4 ? 'Thursday' : 
                               cls.day_of_week === 5 ? 'Friday' : 
                               cls.day_of_week === 6 ? 'Saturday' : 'Sunday'}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              {cls.start_time} - {cls.end_time}
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              {cls.instructor_name}
                            </p>
                            <p className="flex items-center gap-2 font-medium text-foreground">
                              ${cls.fee_amount.toFixed(2)}
                            </p>
                          </div>
                          
                          <Button 
                            variant={isSelected ? "outline" : "default"}
                            className="w-full"
                            onClick={() => handleToggleClass(cls)}
                          >
                            {isSelected ? 'Deselect' : 'Select Class'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <SearchCalendarView 
                  classes={searchResults}
                  onClassSelect={handleToggleClass}
                  selectedClasses={selectedClassesToEnroll}
                />
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Classes Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria to find more classes.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollmentOpen} onOpenChange={setIsEnrollmentOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>Class Enrollment</DialogTitle>
          <EnrollmentSteps
            selectedClasses={selectedClassesToEnroll}
            onComplete={handleEnrollmentComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Enrollment Complete Dialog */}
      <Dialog open={isEnrollmentComplete} onOpenChange={setIsEnrollmentComplete}>
        <DialogContent className="max-w-md">
          <DialogTitle>Enrollment Complete</DialogTitle>
          <EnrollmentComplete
            selectedClasses={selectedClassesToEnroll}
            enrollmentType={enrollmentType}
            onClose={() => setIsEnrollmentComplete(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}