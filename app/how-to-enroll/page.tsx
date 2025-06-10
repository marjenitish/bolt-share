// app/how-to-enroll/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/shared/navigation';

export default function HowToEnrollPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-secondary/10 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">How to Enroll</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Learn how to join our classes and start your journey to a healthier lifestyle.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-8 bg-tertiary/5">
        <div className="container mx-auto px-4 space-y-6">
          {/* Step 1 */}
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-xl font-bold mb-2"><span className="text-primary">1.</span> Choose your class</h2>
              <p className="text-sm text-muted-foreground">
                Check out our current course timetable and decide which class you may be best suited to. (You may choose to do more than one class if you wish).
              </p>
              <p className="text-sm text-muted-foreground">
                It’s also a good idea to check with your doctor what type and level of activity is best for you – especially if you have a medical condition, are recovering from a recent illness or operation, or haven’t been active for some time.
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden max-w-md border border-primary/20">
              <img
                src="https://www.myagedcare.gov.au/sites/default/files/2020-03/spotlight-man-cleaning-for-older-woman-illustration.png"
                alt="Choosing a class"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-xl font-bold mb-2"><span className="text-primary">2.</span> Fill in and send in your forms and payment</h2>
              <p className="text-sm text-muted-foreground">
                SHARE offers you the opportunity to see how good our classes are so if you would like the opportunity One (1) Free Trial Class is available per class. If you wish to continue with this or any other class/s please fill in the Enrolment Form.
              </p>
              <p className="text-sm text-muted-foreground">
                For new or on-going participants please complete the relevant Enrolment form for Term classes with full details and payment information then fill in the Pre-activity questionnaire (PAQ).
              </p>
              <p className="text-sm text-muted-foreground">
                The Pre-Activity Questionnaire MUST be signed by your doctor, physiotherapist or other health professional.
              </p>
              <p className="text-sm text-muted-foreground">
                Both forms can then be mailed, emailed or handed back to head office (visit the contact us page for details).
              </p>
              <h3 className="text-lg font-bold mt-4">Live Longer Live Stronger</h3>
              <p className="text-sm text-muted-foreground">
                To undertake one of our Living Longer Living Stronger programs complete the following forms:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>The Pre-Activity Questionnaire which MUST be signed by your doctor, physiotherapist or other health professional.</li>
                <li>Health Assessment Questionnaire</li>
                <li>Enrolment form</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                All forms can then be mailed, emailed or handed back to head office (visit the contact us page for details).
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden max-w-md border border-primary/20">
              <img
                src="https://www.myagedcare.gov.au/sites/default/files/2019-05/female-assessor-with-clipboard-illustration_2x.png"
                alt="Filling forms"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-xl font-bold mb-2"><span className="text-primary">3.</span> Start your class</h2>
              <p className="text-sm text-muted-foreground">
                Once you have received confirmation receipt from SHARE you are now ready to get active, fit and healthy at your chosen SHARE class!
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden max-w-md border border-primary/20">
              <img
                src="https://www.myagedcare.gov.au/sites/default/files/2019-04/man-and-boy-sitting-on-bench-illustration_2x.png"
                alt="Starting class"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
