import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/shared/navigation';
import { Heart, Brain, Target, Lightbulb, Users, Lock } from 'lucide-react';

export default function WhoWeArePage() {
  const coreValues = [
    {
      title: "Compassionate",
      icon: Heart,
      description: "We care deeply about our community and provide support with empathy and understanding."
    },
    {
      title: "Evidence-based",
      icon: Brain,
      description: "Our programs are founded on proven research and best practices in senior fitness."
    },
    {
      title: "Focus",
      icon: Target,
      description: "We maintain clear objectives and dedicated attention to achieving positive outcomes."
    },
    {
      title: "Innovation",
      icon: Lightbulb,
      description: "We continuously evolve our programs to meet changing community needs."
    },
    {
      title: "Inclusiveness",
      icon: Users,
      description: "We welcome everyone, creating a supportive environment for all participants."
    },
    {
      title: "Trust",
      icon: Lock,
      description: "We build lasting relationships based on reliability and integrity."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Who We Are</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-muted-foreground">
              SHARE is a Not For Profit but for purpose organization, delivering caring, targeted, and affordable exercise classes to people over 50 since 1985.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">Award-Winning Community Service</h2>
              <p className="text-lg text-muted-foreground">
                SHARE is an award-winning and well-known brand with a proven record of providing exercise classes to people over 50 in the community since 1985. We deliver caring, targeted, affordable, flexible and relevant classes/programs in non-threatening settings.
              </p>
              <p className="text-lg text-muted-foreground">
                We make a real difference in people's life, particularly older people, some of our participants are over 90 years old.
              </p>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src="https://share.org.au/wp-content/uploads/2019/07/SHARE-circle.png"
                alt="SHARE Community"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our values guide everything we do, ensuring we deliver the highest quality service to our community.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                </div>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <img
              src="https://share.org.au/wp-content/uploads/2019/07/SHARE-value-300x269.jpg"
              alt="SHARE Values Illustration"
              className="mx-auto max-w-sm rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">What We Do</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Built on SHARE's existing expertise, experience and reputation we offer affordable exercise and education classes to the adult community through a network of trained community educators and accredited fitness instructors.
              </p>
              <p className="text-lg text-muted-foreground">
                SHARE's well designed, specialised exercise classes include targeting Falls Prevention and chronic diseases. Our strategy is closely aligned to NSW Government Health's "NSW Healthy Eating and Active Living Strategy" which includes tackling overweight and obesity.
              </p>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Our Programs Include:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Tai Chi</li>
                  <li>• Aqua fitness</li>
                  <li>• Aerobics</li>
                  <li>• Resistance training</li>
                  <li>• Stretching and relaxing</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-4">We Support:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <span>People with a disability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <span>Indigenous people</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <span>Mature-aged people</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <span>Groups from non-english speaking backgrounds</span>
                  </li>
                </ul>
              </div>
              <p className="text-lg text-muted-foreground">
                SHARE classes are run by fitness leaders who are registered and accredited by Fitness Australia. All our leaders are experienced in catering for older adults and are able to provide guidance and helpful advice.
              </p>
              <Button size="lg" className="w-full sm:w-auto">
                Find a Class Near You
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}