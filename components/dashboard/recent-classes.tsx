'use client';

import { CalendarCheck2, User, Bookmark, MapPin, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentClasses = [
  {
    id: '1',
    name: 'Gentle Yoga',
    date: '2023-06-01',
    time: '10:00 AM - 11:00 AM',
    location: 'Studio A',
    instructor: 'Jane Smith',
    attendees: 12,
    capacity: 15,
    status: 'completed',
  },
  {
    id: '2',
    name: 'Chair Fitness',
    date: '2023-06-02',
    time: '2:00 PM - 3:00 PM',
    location: 'Studio B',
    instructor: 'Mark Johnson',
    attendees: 8,
    capacity: 12,
    status: 'completed',
  },
  {
    id: '3',
    name: 'Strength & Balance',
    date: '2023-06-03',
    time: '11:00 AM - 12:00 PM',
    location: 'Studio A',
    instructor: 'Sarah Williams',
    attendees: 15,
    capacity: 15,
    status: 'completed',
  },
  {
    id: '4',
    name: 'Aqua Aerobics',
    date: '2023-06-04',
    time: '9:00 AM - 10:00 AM',
    location: 'Pool',
    instructor: 'David Miller',
    attendees: 10,
    capacity: 20,
    status: 'cancelled',
  },
  {
    id: '5',
    name: 'Tai Chi',
    date: '2023-06-05',
    time: '1:00 PM - 2:00 PM',
    location: 'Studio C',
    instructor: 'Lisa Chen',
    attendees: 6,
    capacity: 10,
    status: 'completed',
  },
];

export function RecentClasses() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentClasses.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{new Date(cls.date).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground">{cls.time}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                  <span>{cls.location}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{cls.instructor.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{cls.instructor}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {Array(3).fill(0).map((_, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">U{i+1}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    +{cls.attendees - 3} more
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={cls.status === 'completed' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {cls.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>View Attendees</DropdownMenuItem>
                    <DropdownMenuItem>Download Report</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Record
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}