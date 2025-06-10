'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface EnrollmentFormProps {
  selectedClasses: any[];
  enrollmentType: 'trial' | 'direct';
  onSubmit: (data: any) => void;
}

export function EnrollmentForm({ selectedClasses, enrollmentType, onSubmit }: EnrollmentFormProps) {
  const [formData, setFormData] = useState({
    firstName: 'xxx',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    fitnessLevel: '',
    goals: '',
    hearAboutUs: '',
    marketingConsent: false,
    termsAccepted: false,
  });
  const supabase = createBrowserClient();

  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [customer, setCustomer] = useState(null)

    useEffect(() => {
    const getProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        console.log("user", user)
        if (!user) throw new Error('Not authenticated');
        setUser(user);

        // Get user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Get customer profile if exists
        const { data: customerProfile } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (customerProfile) {
          setCustomer(customerProfile);
        }
        console.log('customerProfile', customerProfile)

        setFormData({
          firstName: customerProfile?.first_name,
          lastName: customerProfile?.surname,
          email: customerProfile?.email,
          phone: profile?.phone,
          dateOfBirth: customerProfile?.date_of_birth,
          address: customerProfile?.street_number,
          marketingConsent: false,
          termsAccepted: false,
        })

      } catch (error: any) {
        console.error('Error loading profile:', error);
      }
    };

    getProfile();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    onSubmit(formData);
  };

  const calculateTotalFee = () => {
    return selectedClasses.reduce((total, cls) => total + cls.fee_amount, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Enrollment Details</h2>
        <p className="text-muted-foreground">
          {enrollmentType === 'trial' 
            ? 'Complete your trial class registration' 
            : 'Complete your enrollment information'}
        </p>
      </div>

      {/* Selected Classes Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Selected Classes ({selectedClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedClasses.map((cls) => (
              <div key={cls.id} className="flex justify-between items-start p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <h3 className="font-semibold">{cls.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {cls.day_of_week === 1 ? 'Monday' : 
                         cls.day_of_week === 2 ? 'Tuesday' : 
                         cls.day_of_week === 3 ? 'Wednesday' : 
                         cls.day_of_week === 4 ? 'Thursday' : 
                         cls.day_of_week === 5 ? 'Friday' : 
                         cls.day_of_week === 6 ? 'Saturday' : 'Sunday'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{cls.start_time} - {cls.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{cls.venue_name}</span>
                    </div>
                  </div>
                  {cls.description && (
                    <p className="text-sm text-muted-foreground">{cls.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${cls.fee_amount?.toFixed(2) || '0.00'}</p>
                  {enrollmentType === 'trial' && (
                    <p className="text-xs text-muted-foreground">Trial - Free</p>
                  )}
                </div>
              </div>
            ))}
            
            {enrollmentType === 'direct' && (
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg font-semibold">
                <span>Total Fee</span>
                <span>${calculateTotalFee().toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                readOnly
              />
            </div>
          </CardContent>
        </Card>

       
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingConsent"
                checked={formData.marketingConsent}
                onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
              />
              <Label htmlFor="marketingConsent" className="text-sm">
                I consent to receiving marketing communications and updates about classes and events.
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
              />
              <Label htmlFor="termsAccepted" className="text-sm">
                I accept the terms and conditions and privacy policy. *
              </Label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          {enrollmentType === 'trial' ? 'Complete Trial Registration' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}