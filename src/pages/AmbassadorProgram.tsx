import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, DollarSign, Users, Home, Utensils, TrendingUp, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAmbassador } from "@/hooks/useAmbassador";
import { SEO } from "@/components/SEO";

export default function AmbassadorProgram() {
  const navigate = useNavigate();
  const { isAmbassador, enroll, enrolling } = useAmbassador();

  const earningMethods = [
    {
      icon: Users,
      title: "20% Recurring Commissions",
      amount: "Passive Income",
      description: "Refer creators and earn 20% of their monthly subscription - every single month they remain subscribed",
      example: "10 referrals = $20-50/month recurring",
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      icon: Home,
      title: "$500 Property Collaborations",
      amount: "Per Match",
      description: "Connect property owners with creators for collaborations. Earn $500 flat fee per successful match",
      example: "2 matches/month = $1,000/month",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      icon: Utensils,
      title: "$100 Restaurant/Experience Collabs",
      amount: "Per Match",
      description: "Bridge local restaurants and experiences with creators. Earn $100 flat fee per successful collaboration",
      example: "5 matches/month = $500/month",
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  const benefits = [
    "48-hour early access to new properties",
    "Special ambassador badge on profile",
    "Priority consideration in application reviews",
    "Exclusive community & networking events",
    "Marketing assets and templates",
    "Dedicated ambassador support",
  ];

  const actionPlan = [
    { day: "Day 1-2", action: "Set up profile & share referral link with your network" },
    { day: "Day 3-4", action: "Post introduction on social media with ambassador badge" },
    { day: "Day 5-6", action: "Reach out to 10 property owners in your area" },
    { day: "Day 7", action: "Follow up with contacts & post your first collaboration story" },
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Ambassador Program" 
        description="Join the Hostfluencer Ambassador Program and earn through referrals, property collaborations, and restaurant matches. Turn your influence into income."
        keywords="ambassador program, referral earnings, influencer income, content creator monetization"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-yellow-600" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hostfluencer Ambassador Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A single-tier program where everyone earns the same competitive rates.
            Turn your influence into income through three powerful earning streams.
          </p>
          {!isAmbassador && (
            <Button size="lg" onClick={() => enroll()} disabled={enrolling}>
              <Trophy className="mr-2 h-5 w-5" />
              Become an Ambassador
            </Button>
          )}
          {isAmbassador && (
            <Button size="lg" onClick={() => navigate("/profile?tab=ambassador")}>
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Earning Methods */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How You Earn</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {earningMethods.map((method, index) => (
            <Card key={index} className={`p-6 border-2 ${method.color}`}>
              <method.icon className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">{method.title}</h3>
              <div className="text-2xl font-bold mb-3">{method.amount}</div>
              <p className="text-sm mb-4">{method.description}</p>
              <div className="bg-background p-3 rounded-lg">
                <div className="text-xs font-semibold text-muted-foreground mb-1">Example:</div>
                <div className="text-sm font-medium">{method.example}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Real Earnings Example */}
        <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border-2">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Real Earnings Example
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Creator Referrals</div>
              <div className="text-xl font-bold">10 active referrals</div>
              <div className="text-green-600">$20-50/month recurring</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Property Collaborations</div>
              <div className="text-xl font-bold">2 matches/month</div>
              <div className="text-green-600">$1,000/month</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Restaurant Collaborations</div>
              <div className="text-xl font-bold">5 matches/month</div>
              <div className="text-green-600">$500/month</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Potential Total:</span>
              <span className="text-3xl font-bold text-green-600">$1,520-1,550/month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Dual Role Advantage */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">The Dual-Role Advantage</h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <p className="text-lg mb-6">
              As an active creator AND ambassador, you have unique advantages:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Star className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Authentic Connections</div>
                  <div className="text-sm text-muted-foreground">
                    Your experience as a creator makes your referrals more genuine and trusted
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Star className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Inside Knowledge</div>
                  <div className="text-sm text-muted-foreground">
                    You understand what creators and properties need, making better matches
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Star className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Network Effect</div>
                  <div className="text-sm text-muted-foreground">
                    Your collaborations become case studies that attract more referrals
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Ambassador Benefits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <p className="font-medium">{benefit}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* First Week Action Plan */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Your First Week Action Plan</h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              {actionPlan.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {step.day}
                    </div>
                    <p className="text-muted-foreground">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Monthly Requirements */}
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 max-w-3xl mx-auto bg-yellow-50 border-yellow-200">
          <h3 className="text-2xl font-bold mb-4">Monthly Requirements</h3>
          <p className="mb-4">To maintain active ambassador status, complete these each month:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs">✓</div>
              <span>Post 4 Instagram stories featuring Hostfluencer</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs">✓</div>
              <span>Share 1 feed post about your ambassador experience</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Requirements reset on the 1st of each month. We'll send reminders!
          </p>
        </Card>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of ambassadors already earning through Hostfluencer
          </p>
          {!isAmbassador && (
            <Button size="lg" variant="secondary" onClick={() => enroll()} disabled={enrolling}>
              <Trophy className="mr-2 h-5 w-5" />
              Become an Ambassador Today
            </Button>
          )}
          {isAmbassador && (
            <Button size="lg" variant="secondary" onClick={() => navigate("/profile?tab=ambassador")}>
              Go to Your Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
