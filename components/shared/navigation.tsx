'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Phone, ChevronDown, Menu, X } from 'lucide-react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { createBrowserClient } from '@/lib/supabase/client';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems = [
    {
      title: 'About Us',
      items: [
        { href: '/about/who-we-are', label: 'Who We Are' },
        { href: '/about/mission', label: 'Mission and Vision' },
        { href: '/about/board', label: 'SHARE Board' },
        { href: '/about/instructors', label: 'SHARE Instructors' },
        { href: '/about/careers', label: 'Join Our Team' },
        { href: '/about/events', label: 'Events' },
      ]
    },
    {
      title: 'Classes',
      items: [
        { href: '/classes/yoga', label: 'Yoga' },
        { href: '/classes/pilates', label: 'Pilates' },
        { href: '/classes/strength', label: 'Strength & Balance' },
      ]
    },
    {
      title: 'Venues',
      items: [
        { href: '/venues/fitness-center', label: 'Fitness Center' },
        { href: '/venues/community-hall', label: 'Community Hall' },
        { href: '/venues/wellness-studio', label: 'Wellness Studio' },
        { href: '/venues/locations', label: 'All Locations' },
        { href: '/venues/accessibility', label: 'Accessibility' },
        { href: '/venues/parking', label: 'Parking Information' },
      ]
    },
    {
      title: 'Enrollment Process',
      items: [
        { href: '/how-to-enroll', label: 'How to Enroll?' },
        { href: '/how-to-enroll', label: 'Enrollment Process' },
        { href: '/how-to-enroll', label: 'Check Eligibility' },
        { href: '/how-to-enroll', label: 'Apply Assessment' },
      ]
    },
    {
      title: 'News',
      items: [
        { href: '/news', label: 'Latest News' },
        { href: '/news', label: 'Upcoming Events' },
        { href: '/news', label: 'Blog' },
      ]
    },
  ];

  return (
    <header className="border-b">
      {/* Top Bar */}
      <div className="bg-muted py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/find-location" className="text-sm hover:text-primary">Find your local SHARE</Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/contact" className="text-sm hover:text-primary">Contact us</Link>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="https://www.facebook.com/sharelearnforlife" className="text-sm hover:text-primary"><Facebook className="h-4 w-4" /></a>
            <a href="https://www.youtube.com/channel/UCfivbREwd88TcwlXvG8PJUA" className="text-sm hover:text-primary"><Youtube className="h-4 w-4" /></a>
            <a href="https://www.linkedin.com/company/share-smr-inc%20/" className="text-sm hover:text-primary"><Linkedin className="h-4 w-4" /></a>
            <a href="mailto:info@share.org.au" className="text-sm hover:text-primary"><Mail className="h-4 w-4" /></a>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name} />
                      <AvatarFallback>{userProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userProfile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {userProfile?.role === 'instructor' ? (
  <DropdownMenuItem asChild>
    <Link href="/instructor-portal">Instructor Portal</Link>
  </DropdownMenuItem>
) : userProfile?.role === 'admin' ? (
  <DropdownMenuItem asChild>
    <Link href="/dashboard">Dashboard</Link>
  </DropdownMenuItem>
) : (
  <DropdownMenuItem asChild>
    <Link href="/profile">My Profile</Link>
  </DropdownMenuItem>
)}
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary" size="sm" className="hidden sm:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {menuItems.map((section) => (
                    <NavigationMenuItem key={section.title}>
                      <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                          <div>
                            <ul className="space-y-2">
                              {section.items.map((item) => (
                                <li key={item.href}>
                                  <NavigationMenuLink asChild>
                                    <Link href={item.href} className="text-sm hover:text-primary">
                                      {item.label}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <img
                              src="https://www.homage.com.au/wp-content/uploads/sites/3/2021/09/anupam-mahapatra-Vz0RbclzG_w-unsplash.jpg"
                              alt="Featured content"
                              className="rounded-md mb-2 aspect-video object-cover"
                            />
                            <h4 className="text-sm font-medium mb-2">Featured Content</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Discover our range of classes and activities designed for active adults.
                            </p>
                            <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                  <NavigationMenuItem>
                    <Link href="/contact" legacyBehavior passHref>
                      <NavigationMenuLink className="text-sm hover:text-primary">
                        Contact
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/search">
              <Button variant="outline" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                Find a Class
              </Button>
            </Link>
            <Button size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Call Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="space-y-4 flex-1">
                  {menuItems.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <h2 className="text-lg font-semibold">{section.title}</h2>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block py-2 text-sm hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-4">
                  <Link href="/search" className="w-full">
                    <Button className="w-full" variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Find a Class
                    </Button>
                  </Link>
                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}