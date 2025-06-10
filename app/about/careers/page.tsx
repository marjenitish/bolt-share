'use client';

import { Navigation } from '@/components/shared/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Heart, 
  Shield, 
  Star, 
  Users 
} from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  resume: z.string().min(1, 'Resume link is required'),
  experience: z.string().min(50, 'Please provide more details about your experience'),
  certifications: z.string().min(1, 'Please list your certifications'),
  availability: z.string().min(1, 'Please specify your availability'),
  agreeToTerms: z.boolean().refine(val => val, 'You must agree to the terms'),
});

export default function CareersPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      resume: '',
      experience: '',
      certifications: '',
      availability: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
  };

  const benefits = [
    {
      icon: Users,
      title: "Supportive Team",
      description: "Work alongside experienced and passionate instructors"
    },
    {
      icon: Heart,
      title: "Make a Difference",
      description: "Help improve the lives of our community members"
    },
    {
      icon: Star,
      title: "Career Growth",
      description: "Opportunities for progression within the organization"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work hours that suit your lifestyle"
    }
  ];

  const requirements = [
    {
      icon: Award,
      title: "Minimum Certificate III",
      description: "In Fitness & Personal Training"
    },
    {
      icon: Clock,
      title: "Experience Required",
      description: "Training people over 50"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Criminal Record Check & Insurance"
    },
    {
      icon: Shield,
      title: "COVID-19 Vaccination",
      description: "Full vaccination required"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Join Our Team</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-muted-foreground">
              Are You Our Next Fitness Leader? Join our community of dedicated instructors helping those over 50 improve their health and enhance their quality of life.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Information Column */}
            <div className="space-y-8">
              <div className="prose">
                <h2 className="text-3xl font-bold mb-4">About The Role</h2>
                <p className="text-muted-foreground">
                  As a Group Fitness Instructor, you will conduct safe, appropriate, and engaging group fitness classes within format guidelines. Our Instructors motivate, educate, and enhance each participant's experience, fostering a commitment to improved health and wellbeing.
                </p>
              </div>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>What we offer to our team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <benefit.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>Essential qualifications and criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {requirements.map((requirement, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <requirement.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{requirement.title}</h3>
                          <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Apply Now</CardTitle>
                  <CardDescription>Fill out the form below to apply for the instructor position</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="resume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resume Link</FormLabel>
                            <FormControl>
                              <Input type="url" {...field} />
                            </FormControl>
                            <FormDescription>
                              Please provide a link to your resume (Google Drive, Dropbox, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relevant Experience</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Tell us about your experience working with seniors and teaching fitness classes..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="List your relevant certifications and qualifications..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Please specify your availability for classes..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the terms and conditions and confirm that all information provided is accurate
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">Submit Application</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Volunteer With Us</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our team of dedicated volunteers and help make a difference in your community. We're currently seeking volunteer drivers to help seniors access our wellness programs.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Driver Position</CardTitle>
                <CardDescription>Help seniors stay connected and active</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We are seeking volunteer drivers with:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Current NSW Driver's Licence (C class)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Proven safe driving record</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Valid Police Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Minimum commitment of 1 day per month</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Apply to Volunteer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}