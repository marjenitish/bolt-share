'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const upcomingClasses = [
  {
    id: '1',
    title: 'Gentle Yoga',
    time: '10:00 AM - 11:00 AM',
    date: 'Today',
    location: 'Studio A',
    instructor: {
      name: 'Jane Smith',
      avatar: '',
    },
    attendees: 12,
    capacity: 15,
  },
  {
    id: '2',
    title: 'Chair Fitness',
    time: '2:00 PM - 3:00 PM',
    date: 'Today',
    location: 'Studio B',
    instructor: {
      name: 'Mark Johnson',
      avatar: '',
    },
    attendees: 8,
    capacity: 12,
  },
  {
    id: '3',
    title: 'Strength & Balance',
    time: '11:00 AM - 12:00 PM',
    date: 'Tomorrow',
    location: 'Studio A',
    instructor: {
      name: 'Sarah Williams',
      avatar: '',
    },
    attendees: 15,
    capacity: 15,
  },
  {
    id: '4',
    title: 'Aqua Aerobics',
    time: '9:00 AM - 10:00 AM',
    date: 'Tomorrow',
    location: 'Pool',
    instructor: {
      name: 'David Miller',
      avatar: '',
    },
    attendees: 10,
    capacity: 20,
  },
];

export function UpcomingClasses() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        {upcomingClasses.map((cls, index) => (
          <div
            key={cls.id}
            className={`flex items-center justify-between p-4 ${
              index !== upcomingClasses.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{cls.title}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>
                    {cls.date} • {cls.time} • {cls.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {cls.attendees}/{cls.capacity}
              </div>
              <Badge
                variant={cls.attendees === cls.capacity ? 'destructive' : 'outline'}
              >
                {cls.attendees === cls.capacity ? 'Full' : 'Available'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="outline" className="w-full">
          View All Classes
        </Button>
      </div>
    </div>
  );
}