'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/shared/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Instructor {
  id: string;
  name: string;
  specialty: string;
  description: string;
  image_link: string;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchInstructors = async () => {
      const { data } = await supabase
        .from('instructors')
        .select('*')
        .order('name');
      
      if (data) {
        setInstructors(data);
      }
    };

    fetchInstructors();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Our Instructors</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-muted-foreground">
              Meet our dedicated team of certified fitness instructors who specialize in senior fitness and are passionate about helping you achieve your health goals.
            </p>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-4">
                  <img
                    src={instructor.image_link || 'https://images.pexels.com/photos/7991539/pexels-photo-7991539.jpeg'}
                    alt={instructor.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">{instructor.name}</h2>
                    <p className="text-white/90 font-medium">{instructor.specialty}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {instructor.description && (
                    <p className="text-muted-foreground line-clamp-3">
                      {instructor.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {instructor.specialty?.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Classes</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the expertise of our instructors and start your journey to better health today.
          </p>
          <Button size="lg" className="h-14 text-lg px-8">
            Find a Class
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}