import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Phone, Clock, Car, Info } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';

export default function VenuesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">Our Venues</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Find a SHARE exercise venue near you. All our locations are carefully selected to ensure accessibility, comfort, and a welcoming atmosphere.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Input placeholder="Enter your postcode" className="max-w-sm" />
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Find Venues
            </Button>
          </div>
        </div>
      </section>

      {/* Venue List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6">
            {[
              {
                name: "Fitness Center",
                address: "123 Exercise Street, Fitness VIC 3000",
                description: "Our main facility featuring multiple studios and modern equipment",
                facilities: ["Parking available", "Wheelchair accessible", "Change rooms", "Water stations"],
                image: "https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg"
              },
              {
                name: "Community Hall",
                address: "456 Community Road, Active VIC 3000",
                description: "Spacious venue perfect for group classes and social activities",
                facilities: ["Street parking", "Wheelchair accessible", "Kitchen facilities", "Air-conditioned"],
                image: "https://images.pexels.com/photos/7991518/pexels-photo-7991518.jpeg"
              },
              {
                name: "Wellness Studio",
                address: "789 Wellness Avenue, Health VIC 3000",
                description: "Intimate studio space ideal for smaller group sessions",
                facilities: ["Limited parking", "Ground floor access", "Change rooms", "Meditation space"],
                image: "https://images.pexels.com/photos/3822724/pexels-photo-3822724.jpeg"
              }
            ].map((venue, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="aspect-video md:aspect-square relative">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="object-cover absolute inset-0 h-full w-full"
                    />
                  </div>
                  <div className="p-6 md:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{venue.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{venue.address}</span>
                        </div>
                      </div>
                      <Button>View Classes</Button>
                    </div>
                    <p className="text-muted-foreground mb-4">{venue.description}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {venue.facilities.map((facility, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Need More Information?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our team is here to help you find the perfect venue for your exercise journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>1800 XXX XXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Mon-Fri: 8am-6pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <span>Free parking available at most venues</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/7991535/pexels-photo-7991535.jpeg"
                alt="Our facilities"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}