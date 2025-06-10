import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/shared/navigation';
import { Target, ArrowRight, CheckCircle, Users, Heart, Brain } from 'lucide-react';

export default function MissionPage() {
  const visionGoals = [
    {
      title: "Building Healthier Communities",
      description: "Enhancing the wellbeing of people over 55 through exercise and educational programs",
      icon: Heart
    },
    {
      title: "Innovative Programs",
      description: "Offering a range of innovative and accessible exercise programs",
      icon: Brain
    },
    {
      title: "Physical Activity",
      description: "Providing opportunities for more people to be physically active and healthy",
      icon: Users
    },
    {
      title: "Specialized Programs",
      description: "Providing specialized programs in areas such as Falls Prevention",
      icon: Target
    },
    {
      title: "Disease Prevention",
      description: "Providing specialized programs that will avoid preventable chronic diseases",
      icon: CheckCircle
    },
    {
      title: "Cultural Diversity",
      description: "Offering classes to culturally and linguistically diverse communities",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Mission & Vision</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-muted-foreground">
              Empowering older adults to maintain healthy lifestyles through accessible exercise and education programs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Target className="h-6 w-6" />
                <span className="text-lg font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold">Helping Older People Stay Healthy</h2>
              <div className="prose text-muted-foreground">
                <p className="text-lg">
                  "SHARE's aim is to help older people in our community maintain a healthy lifestyle and to assist people in their management of chronic conditions through exercise and education. It offers a range of affordable and varied exercise classes and provides leaders to community and corporate settings."
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground">
                  SHARE provides a range of physical activity opportunities for residents of South Eastern and Sydney South West Area Health Service. The programs conducted by SHARE support the Strategic Directions of both area Health Service and Health Promotion Services and is closely aligned to Government initiatives.
                </p>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src="https://images.pexels.com/photos/7991157/pexels-photo-7991157.jpeg"
                alt="Senior exercise class"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Target className="h-6 w-6" />
              <span className="text-lg font-semibold">Our Vision</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">To Empower Australia-wide Healthy Communities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are committed to achieving our vision through comprehensive programs and initiatives that promote active, healthy living for all.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visionGoals.map((goal, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <goal.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                </div>
                <p className="text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of our mission to create healthier, more active communities across Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 text-lg px-8">
              Find a Class
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 text-lg px-8">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}