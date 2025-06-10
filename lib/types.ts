export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'instructor' | 'staff';
  avatarUrl?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  maxCapacity: number;
  currentBookings: number;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Instructor {
  id: string;
  userId: string;
  bio: string;
  specialties: string[];
  rating: number;
  classesCompleted: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Booking {
  id: string;
  classId: string;
  clientId: string;
  status: 'confirmed' | 'cancelled' | 'attended' | 'no-show';
  bookingDate: string;
  createdAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  emergencyContact?: string;
  healthNotes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}