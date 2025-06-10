import { Navigation } from '@/components/shared/navigation';
import { Mail, Link as LinkIcon, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardMember {
  name: string;
  position: string;
  image: string;
  description: string[];
}

const boardMembers: BoardMember[] = [
  {
    name: "Barbara Ward",
    position: "Volunteer President",
    image: "https://share.org.au/wp-content/uploads/2019/07/Barbara-Photo-1024x1003.jpg",
    description: [
      "Barbara Ward is the Managing Director of Impact One and has a held a variety of senior commercial, customer, strategic alliance and finance roles across the industry, both onshore and overseas, acareer that spans Government, Corporate, Not for Profit and Charity sector and is known as the change agent.",
      "She is current President of Rotary Club of Sydney, Lupus Australia, SHARE (SMR) Inc, Nutrition Australia NSW and Immediate Past President of Australia India Business Council NSW. Barbara holds non-executive position on several board including World Lupus Federation, Royal Rehabilitation and NSW Government Agency for Clinical Excellence. Barbara is former President of Fundraising Institute of Australia and is a Fellow.",
      "In 2019 she was awarded Paul Harris Fellow, Leadership in International Mental Health, Excellence in Community Service on Australia Day and is Nominee AFR 100Women of Influence and was also 'Ku-ring-gai Local Woman of the Year 2017', amongst many other awards for her leadership in business and community.",
      "Barbara's passion for good public policy stems from her experience that a strong economy is the basis of a just society and she works tirelessly at every level to make life better for those less fortunate. She has a strong commitment to helping others and building stronger communities with a focus on Mental Health and Wellbeing"
    ]
  },
  {
    name: "Roger Xie",
    position: "Treasurer",
    image: "https://share.org.au/wp-content/uploads/2020/03/roger.jpg",
    description: [
      "Roger Xie is an experienced Actuarial & Analytics professional currently working in the realm of Sports Analytics.",
      "Roger is passionate about philanthropy and is currently the Secretary of the Rotary Club of Sydney."
    ]
  },
  {
    name: "Moss Akbarian",
    position: "Secretary",
    image: "https://share.org.au/wp-content/uploads/2020/03/Moss-e1583050334853.jpg",
    description: [
      "Moss Akbarian Studied in London England. Degree in Civil Engineering, postgraduate in General Management. Worked for McAlpine in England.",
      "GM of a publicly listed gold mining company in WA. Headed a number of projects in NSW including the Federal Police Headquarters in Sydney, Cypress Lakes Golf resort hunter valley, Roma Theatre building in George St, and 1st retirement village for Royal Australian Air Force association in Turramurra amongst others.",
      "Member of Aust Writers Guild over 20 years, member of Sydney Rotary over 25 years and is a board member. Moss also hold corporate Real Estate License and works in the family real estate chain Asset Really."
    ]
  },
  {
    name: "David Smith",
    position: "Board Member",
    image: "https://share.org.au/wp-content/uploads/2020/03/david-smith-946x1024.png",
    description: [
      "David Smith is Chartered Accountant. He has 35 experience in management, operational, reviews, restructure, education and training. Extensive experience in building and manageing aged care"
    ]
  },
  {
    name: "Elizabeth Pakchung",
    position: "Board Member",
    image: "https://share.org.au/wp-content/uploads/2023/04/Elizabeth-Pakchung.jpg",
    description: [
      "Elizabeth Pakchung is a company director, lawyer, and supporter of fashion, art and architecture.",
      "She is currently a member of the board of the National Portrait Gallery, and is also a Director of H&M Australia & NZ (part of the global fashion H&M Group), Oranges & Sardines Foundation, Gallery 4A Centre for Contemporary Asian Art, and Contemporary Asian Australian Performance. Elizabeth is also a supporter of Australia at the Venice Art Biennale and the National Gallery of Australia, a Patron of the Sherman Centre for Culture & Ideas, and a Member of the International Women's Forum and the Institute of Company Directors.",
      "Prior to her director career, Elizabeth was a corporate lawyer at global law firm Ashurst (formerly Blake Dawson) for over 25 years and was a partner of the firm for many years."
    ]
  },
  {
    name: "Elizabeth Reberger",
    position: "Board Member",
    image: "https://share.org.au/wp-content/uploads/2023/04/Elizabeth-Reberger.jpg",
    description: [
      "Elizabeth Reberger was born and grown up in Hong Kong. She is a marketing consultant specializing in hotel and event management with CEM and UFID qualifications. She is also business owner of Property Perfect specializing in property investment projects, sales and management. Liz was a former lecturer in universities. She worked for global hospitality groups and event companies before over decades as management role before she relocated to Sydney.",
      "Liz used to be committee member of La Chaine des Rotisseurs NSW, Director of both Macao Fair & Trade Association and Macao Fair & Trade Association while she worked overseas.",
      "Liz loves to spend time travelling, reading and golfing during spare time."
    ]
  }
];

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Board Members</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-muted-foreground">
              Meet our dedicated board members who guide SHARE's mission to promote active and healthy living for adults aged 50+.
            </p>
          </div>
        </div>
      </section>

      {/* Board Members Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {boardMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="grid gap-8 md:grid-cols-3 items-start">
                  <div className="md:sticky md:top-24">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <h2 className="text-2xl font-bold">{member.name}</h2>
                      <p className="text-lg text-primary font-medium">{member.position}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    {member.description.map((paragraph, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                {index < boardMembers.length - 1 && (
                  <div className="mt-16 border-t border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of our mission to create healthier, more active communities across Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 text-lg px-8">
              <Users className="mr-2 h-5 w-5" />
              Get Involved
            </Button>
            <Button variant="outline" size="lg" className="h-14 text-lg px-8">
              <Mail className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}