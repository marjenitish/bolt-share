import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-6">About SHARE</h1>
            <p className="text-xl text-muted-foreground">
              Empowering adults aged 50+ to live active, healthy, and connected lives through exercise and community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To provide accessible, engaging, and effective exercise programs that promote physical health, mental wellbeing, and social connection for adults aged 50 and above.
              </p>
              <Button size="lg">
                Join Our Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/7991159/pexels-photo-7991159.jpeg"
                alt="Senior adults exercising together"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Community",
                description: "Building connections and fostering a supportive environment where everyone belongs"
              },
              {
                title: "Accessibility",
                description: "Making exercise accessible to all, regardless of fitness level or experience"
              },
              {
                title: "Quality",
                description: "Delivering professional instruction and evidence-based programs"
              }
            ].map((value, i) => (
              <div key={i} className="rounded-xl border bg-card p-6">
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                name: "Sarah Johnson",
                role: "Program Director",
                image: "https://images.pexels.com/photos/7507786/pexels-photo-7507786.jpeg"
              },
              {
                name: "Michael Chen",
                role: "Lead Instructor",
                image: "https://images.pexels.com/photos/8941760/pexels-photo-8941760.jpeg"
              },
              {
                name: "Emma Williams",
                role: "Community Manager",
                image: "https://images.pexels.com/photos/7507801/pexels-photo-7507801.jpeg"
              },
              {
                name: "David Thompson",
                role: "Fitness Coordinator",
                image: "https://images.pexels.com/photos/8941764/pexels-photo-8941764.jpeg"
              }
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 mx-auto max-w-[200px]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join our community today and discover the benefits of active living with SHARE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Find a Class
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}