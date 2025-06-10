'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Phone, Calendar, Info, ArrowRight, Play, Pause, Home, Users, Laptop, Download } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';
import { Logo } from '@/components/ui/logo';
import { ClassSearch } from '@/components/shared/class-search';
import { createBrowserClient } from '@/lib/supabase/client';
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import * as icons from 'lucide-react';

export default function Home() {
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [features, setFeatures] = useState<any[]>([]);
  const [healthSafety, setHealthSafety] = useState<any>(null);
  
  const supabase = createBrowserClient();

  const exercises = [
    {
      name: "Neck Roll",
      description: [
        "Stand up straight with the feet shoulder-width apart and the arms loose.",
        "Dip the chin slightly toward the chest.",
        "Gently roll the head in a clockwise motion for 1 rotation, taking about 7 seconds.",
        "Rest for 5 seconds, then roll the head anticlockwise in the same motion.",
        "Repeat 3 times."
      ],
      image: "https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/10/Neck-roll.gif?w=525",
      duration: "30 seconds"
    },
    {
      name: "Shoulder Roll",
      description: [
        "Stand up straight with the arms loose.",
        "Without bending the arms, slowly raise the shoulders and then roll them back in a circular motion.",
        "Roll the shoulders backward 5 times and then reverse the movement, rolling them forward.",
        "Repeat the sequence 2 times."
      ],
      image: "https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/10/Shoulder-roll.gif?w=525",
      duration: "45 seconds"
    },
    {
      name: "Behind-head Tricep Stretch",
      description: [
        "Extend the left arm straight upward, with the elbow close to the head.",
        "Bend the left elbow so that the left hand drops behind the neck.",
        "Using the right hand, hold the left upper arm behind the elbow and gently press down.",
        "Hold for 10 seconds, then rest for 5 seconds before repeating with the right arm.",
        "Repeat 2 more times."
      ],
      image: "https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/10/Behind-head-tricep-stretch.gif?w=525",
      duration: "40 seconds"
    },
    {
      name: "Standing Hamstring Stretch",
      description: [
        "Stand up straight. Keeping the right foot flat, bend the right knee slightly and extend the left leg forward.",
        "Flex the left foot, with the heel on the ground and the toes facing upward.",
        "Place the hands on the right thigh and lean slightly forward, raising the left toes.",
        "Hold for 20 seconds, then rest for 10 seconds. Repeat with the other leg.",
        "Repeat the entire sequence 3 times."
      ],
      image: "https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/10/Standing-hamstring-stretch.gif?w=525",
      duration: "60 seconds"
    }
  ];

  const virtualServices = [
    {
      title: "Exercise Physiology",
      description: "Receive focused support for your rehabilitation process.",
      image: "https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg",
      modes: ["in-home", "in-centre", "online"],
    },
    {
      title: "Movement Classes",
      description: "Low-impact cardio exercises for seniors to stay fit at home.",
      image: "https://images.pexels.com/photos/7551623/pexels-photo-7551623.jpeg",
      modes: ["in-centre", "online"],
    },
    {
      title: "Stretch and Flow",
      description: "Experience more freedom and flow in your movement.",
      image: "https://images.pexels.com/photos/7551623/pexels-photo-7551623.jpeg",
      modes: ["in-home", "online"],
    },
    {
      title: "Digital Dialogue",
      description: "Learn how to master technology and the internet.",
      image: "https://images.pexels.com/photos/7551674/pexels-photo-7551674.jpeg",
      modes: ["online"],
    },
    {
      title: "Let's Have a Conversation",
      description: "Meet new friends, have a chat and enjoy a laugh or two.",
      image: "https://images.pexels.com/photos/7551684/pexels-photo-7551684.jpeg",
      modes: ["in-centre", "online"],
    },
    {
      title: "Social Sessions",
      description: "Perfect for those who are after some fun and engagement.",
      image: "https://images.pexels.com/photos/7551623/pexels-photo-7551623.jpeg",
      modes: ["online"],
    },
  ];

  const slideImages = [
    "https://insight.study.csu.edu.au/wp-content/uploads/2018/04/Industry-adapting-Ageing-population.jpg",
    "https://assets-au-01.kc-usercontent.com/8eab38bf-c951-027f-23de-36c6b71701df/0201ae14-0415-48d7-8f4c-4fb4a0d5c496/article-strengthening-exercises.jpg?w=945&auto=format&lossless=1",
    "https://salmonhealth.com/wp-content/uploads/2018/01/staying-active-best-low-impact-exercises-for-seniors-700x464-1.jpg",
  ];

  useEffect(() => {
    const fetchExerciseTypes = async () => {
      const { data } = await supabase
        .from('exercise_types')
        .select('*')
        .limit(6);

      if (data) {
        setExerciseTypes(data);
      }
    };

    const fetchFeatures = async () => {
      const { data } = await supabase
        .from('homepage_features')
        .select('*')
        .eq('is_active', true)
        .order('order');

      if (data) {
        setFeatures(data);
      }
    };

    const fetchHealthSafety = async () => {
      const { data } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_id', 'health-safety')
        .single();

      if (data) {
        setHealthSafety(data);
      }
    };

    fetchExerciseTypes();
    fetchFeatures();
    fetchHealthSafety();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentExercise((prev) => (prev + 1) % exercises.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const renderIcon = (iconName: string) => {
    const Icon = icons[iconName];
    return Icon ? <Icon className="h-10 w-10 text-primary mb-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary/10 via-background to-tertiary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
                Exercise Classes for Active Living
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Join our community of active adults aged 50+ and discover classes designed to keep you healthy, social, and engaged.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/search">
                  <Button size="lg" className="h-14 text-lg px-8">
                    Find Classes Near You
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about/who-we-are">
                <Button variant="outline" size="lg" className="h-14 text-lg px-8">
                  Learn More
                </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <div className="embla" ref={emblaRef}>
                <div className="embla__container flex">
                  {slideImages.map((img, index) => (
                    <div className="embla__slide relative w-full flex-[0_0_100%]" key={index}>
                      <img
                        src={img}
                        alt={`Slide ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-primary">Popular Classes</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exerciseTypes.map((type, i) => (
              <div key={i} className="group relative rounded-xl border bg-card overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={type.image_link || `https://source.unsplash.com/800x600/?${encodeURIComponent(type.name.toLowerCase())},exercise`}
                    alt={type.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <ul className="space-y-2 mb-4">
                    {type.what_to_bring?.slice(0, 3).map((item: string, j: number) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center">
                        <Info className="h-4 w-4 mr-2 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/search">
                    <Button variant="outline" className="w-full">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <ClassSearch />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="rounded-xl border bg-card p-6">
                {renderIcon(feature.icon)}
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-secondary/5 via-background to-tertiary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Daily Stretching Guide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple stretches to keep you flexible and active. Perfect for beginners and can be done at home.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted/30 border shadow-lg">
              <img
                src={exercises[currentExercise].image}
                alt={exercises[currentExercise].name}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{exercises[currentExercise].name}</h3>
                    <p className="text-white/80">{exercises[currentExercise].duration}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border  bg-gradient-to-br from-secondary/10 via-background to-tertiary/10 p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">{exercises[currentExercise].name}</h3>
                <div className="space-y-4">
                  {exercises[currentExercise].description.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-none">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm text-primary font-medium">{index + 1}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {exercises.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${currentExercise === index
                      ? 'bg-primary w-8'
                      : 'bg-primary/20'
                      }`}
                    onClick={() => {
                      setCurrentExercise(index);
                      setIsPlaying(false);
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg">
                  View All Exercises
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16  bg-gradient-to-br from-secondary/10 via-background to-tertiary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Virtual Wellness</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our Virtual Wellness Services and stay fit and well no matter where you live.
            </p>
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>In Home</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>In Centre</span>
              </div>
              <div className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" />
                <span>Online</span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {virtualServices.map((service, index) => (
              <div key={index} className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.modes.includes('in-home') && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        <Users className="h-4 w-4 inline-block mr-1" />
                        In Home
                      </span>
                    )}
                    {service.modes.includes('in-centre') && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        <Users className="h-4 w-4 inline-block mr-1" />
                        In Centre
                      </span>
                    )}
                    {service.modes.includes('online') && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        <Laptop className="h-4 w-4 inline-block mr-1" />
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center bg-muted/30 rounded-xl p-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <p className="text-lg font-medium">
                So what's on offer and when? Download your Virtual Wellness Services Timetable
              </p>
              <Button variant="default" size="lg" className="ml-4">
                <Download className="mr-2 h-4 w-4" />
                View & Download
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {healthSafety?.image_url && (
                  <div className="h-16 w-16 shrink-0">
                    <img
                      src={healthSafety.image_url}
                      alt="Health and Safety Certification"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-primary">{healthSafety?.title || 'Health & Safety Assured'}</h2>
              </div>
              <div className="space-y-4">
                <div dangerouslySetInnerHTML={{ __html: healthSafety?.content || '' }} />
                {healthSafety?.button_text && healthSafety?.button_link && (
                  <div className="flex items-center gap-2">
                    <Link href={healthSafety.button_link} target="_blank">
                      <Button variant="outline" className="gap-2">
                        <Info className="h-4 w-4" />
                        {healthSafety.button_text}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {healthSafety?.stats?.map((stat: any, i: number) => (
                <div key={i} className="bg-card rounded-lg p-6 text-center border">
                  <h3 className="text-lg font-semibold text-primary mb-2">{stat.title}</h3>
                  <p className="text-muted-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="font-bold mb-6">About SHARE</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="hover:underline">Who We Are</Link></li>
                <li><Link href="/about#mission" className="hover:underline">Our Mission</Link></li>
                <li><Link href="/about#team" className="hover:underline">Our Team</Link></li>
                <li><Link href="/about#values" className="hover:underline">Values</Link></li>
                <li><Link href="/news" className="hover:underline">Latest News</Link></li>
                <li><Link href="/careers" className="hover:underline">Careers</Link></li>
                <li><Link href="/support" className="hover:underline">Support & Advocacy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Classes & Programs</h4>
              <ul className="space-y-3">
                <li><Link href="/classes" className="hover:underline">All Classes</Link></li>
                <li><Link href="/classes#yoga" className="hover:underline">Yoga</Link></li>
                <li><Link href="/classes#strength" className="hover:underline">Strength & Balance</Link></li>
                <li><Link href="/classes#chair" className="hover:underline">Chair Fitness</Link></li>
                <li><Link href="/classes#schedule" className="hover:underline">Class Schedule</Link></li>
                <li><Link href="/instructors" className="hover:underline">Our Instructors</Link></li>
                <li><Link href="/pricing" className="hover:underline">Pricing & Memberships</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/venues" className="hover:underline">Find a Venue</Link></li>
                <li><Link href="/faq" className="hover:underline">FAQs</Link></li>
                <li><Link href="/health-tips" className="hover:underline">Health & Wellness Tips</Link></li>
                <li><Link href="/blog" className="hover:underline">Blog</Link></li>
                <li><Link href="/testimonials" className="hover:underline">Success Stories</Link></li>
                <li><Link href="/events" className="hover:underline">Community Events</Link></li>
                <li><Link href="/support" className="hover:underline">Support Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Contact & Support</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">1800 XXX XXX</p>
                  <p className="text-sm text-primary-foreground/80">Freecall</p>
                </div>
                <div className="space-y-1">
                  <p>Mon - Fri: 8am - 6pm</p>
                  <p>Saturday: 9am - 1pm</p>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter your email"
                    className="bg-primary-foreground text-primary"
                  />
                  <Button variant="secondary" className="w-full">
                    Subscribe to Newsletter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <Link href="/terms" className="text-sm hover:underline">Terms of Use</Link>
                <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
                <Link href="/accessibility" className="text-sm hover:underline">Accessibility</Link>
                <Link href="/sitemap" className="text-sm hover:underline">Sitemap</Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/auth" className="text-sm hover:underline">Staff Portal</Link>
                <span className="text-sm">© {new Date().getFullYear()} SHARE CRM. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}