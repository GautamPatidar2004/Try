import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  FileText,
  Download,
  TrendingUp,
  Wrench,
  DollarSign,
  Copy,
  Search,
  Instagram,
  Youtube,
  Camera,
  BarChart,
  Calendar,
  Hash,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Sparkles,
  Award,
} from "lucide-react";
import { useState } from "react";

const CreatorResources = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${name} copied to clipboard`,
    });
  };

  const emailTemplates = [
    {
      title: "Collaboration Pitch",
      icon: Mail,
      content: `Subject: Collaboration Opportunity - [Your Name] x [Property Name]

Hi [Host Name],

I hope this message finds you well! My name is [Your Name], and I'm a travel content creator specializing in [niche - e.g., luxury stays, adventure travel, boutique properties].

I came across [Property Name] on Hostfluencer and was immediately drawn to [specific feature that caught your attention]. Your property aligns perfectly with my audience of [follower count] engaged followers who are passionate about [relevant interests].

I'd love to discuss a potential collaboration where I could create authentic content showcasing the unique experience your property offers. My recent collaborations have generated an average of [X engagement rate] and [X impressions/views].

Would you be open to a brief call this week to discuss how we could work together?

Looking forward to connecting!

Best regards,
[Your Name]
[Links to your social profiles]`,
    },
    {
      title: "Follow-Up Email",
      icon: MessageSquare,
      content: `Subject: Following Up - Collaboration with [Property Name]

Hi [Host Name],

I wanted to follow up on my previous message about a potential collaboration. I understand you're likely busy, but I'm genuinely excited about the possibility of working together.

Since my last email, I've [mention recent achievement - e.g., "reached 50K followers" or "had a post go viral with 500K views"].

If timing isn't right at the moment, I'd love to stay in touch for future opportunities. Would it be helpful if I sent over my media kit and some examples of my recent work?

Thank you for considering!

Best,
[Your Name]`,
    },
    {
      title: "Thank You Letter",
      icon: Sparkles,
      content: `Subject: Thank You for an Amazing Stay at [Property Name]

Dear [Host Name],

I wanted to take a moment to thank you for the incredible hospitality during my recent stay at [Property Name]. The experience exceeded all my expectations!

[Mention 2-3 specific highlights of your stay]

I'm excited to share that the content is already performing wonderfully:
- [Specific metric - e.g., "Instagram post reached 15K people"]
- [Another achievement]
- [Story/reel performance]

I've already received several DMs from followers asking about booking your property. I'll be sure to share all content links with you once everything is published.

I hope we can collaborate again in the future. Thank you again for making this partnership so special!

Warmly,
[Your Name]`,
    },
    {
      title: "Media Kit Request",
      icon: FileText,
      content: `Subject: Media Kit & Collaboration Information

Hi [Host Name],

Thank you for your interest in collaborating! I'd be happy to share more information about my work and audience.

I've attached my media kit which includes:
• Audience demographics and engagement rates
• Previous collaboration examples
• Content deliverables and timeline
• Rates and availability

Quick Overview:
- Platform: [Instagram/TikTok/YouTube]
- Followers: [Number]
- Average Engagement: [Percentage]
- Niche: [Your specialty]
- Location: [Where you're based/willing to travel]

I'm particularly drawn to [Property Name] because [specific reason]. I believe my audience would really connect with [specific feature].

Let me know if you have any questions or would like to discuss further!

Best,
[Your Name]
[Links to portfolio/social media]`,
    },
  ];

  const captionTemplates = [
    {
      category: "Story-Driven",
      templates: [
        "POV: You found paradise and it's called [Location] 🌴✨ Swipe to see why this place stole my heart →",
        "I wasn't expecting this... [Share surprising element about the property]. Sometimes the best experiences are the unexpected ones. 💫",
        "This is your sign to book that trip. Here's what made [Property Name] unforgettable: [3 key points]",
        "Plot twist: [Property Name] exceeded every expectation. From [feature 1] to [feature 2], every moment was pure magic ✨",
      ],
    },
    {
      category: "Engagement-Focused",
      templates: [
        "Hot take: This is hands down one of the most [adjective] properties I've stayed at. Agree or disagree? 👇",
        "If you could wake up anywhere in the world tomorrow, where would it be? 🌍 For me, it's here at [Location]",
        "Quick question: Beach view or mountain view? Comment below! 👇 (I'm team [your choice] after staying here)",
        "Double tap if you'd stay here! ❤️ Tag someone who needs this vacation ASAP 🏝️",
      ],
    },
    {
      category: "CTA-Driven",
      templates: [
        "Save this for your next [destination] trip! 📍 [Property Name] • [Location] Everything you need to know: [key points]",
        "Link in bio for booking info! Trust me, you don't want to miss [special feature]. Use code [CODE] for [discount] 🎁",
        "Comment 'INFO' and I'll send you all the details! This place is already booking up for [season] 🏃‍♀️",
        "Swipe for the full room tour 👉 and head to stories for exclusive behind-the-scenes content you won't see anywhere else!",
      ],
    },
    {
      category: "Value-Packed",
      templates: [
        "5 reasons why [Property Name] should be on your bucket list: 1. [Reason] 2. [Reason] 3. [Reason] 4. [Reason] 5. [Reason] Which one sold you? 👇",
        "Everything you need to know before booking [Property Name]: ✓ [Important info 1] ✓ [Important info 2] ✓ [Important info 3] Save this for later! 📌",
        "Here's what they don't tell you about [Location]: [Insider tip]. Stayed at [Property Name] and learned this firsthand 💡",
      ],
    },
  ];

  const downloadableResources = [
    {
      title: "Content Creator Media Kit Template",
      description: "Professional Canva template to showcase your stats and portfolio",
      size: "PDF • 2.5 MB",
      icon: FileText,
      color: "text-brand-green",
    },
    {
      title: "Pre-Stay Checklist",
      description: "Complete checklist of what to prepare before your collaboration",
      size: "PDF • 800 KB",
      icon: BookOpen,
      color: "text-voyager-blue",
    },
    {
      title: "Content Shot List Template",
      description: "Never miss an important shot with this comprehensive guide",
      size: "PDF • 1.2 MB",
      icon: Camera,
      color: "text-brand-green",
    },
    {
      title: "Analytics Tracking Sheet",
      description: "Monitor your growth across all platforms with this spreadsheet",
      size: "Excel • 450 KB",
      icon: BarChart,
      color: "text-voyager-blue",
    },
    {
      title: "Rate Negotiation Guide",
      description: "Know your worth: comprehensive guide to pricing your services",
      size: "PDF • 1.8 MB",
      icon: DollarSign,
      color: "text-brand-green",
    },
    {
      title: "Tax & Business Guide for Creators",
      description: "Essential tax information and business setup for content creators",
      size: "PDF • 2.1 MB",
      icon: Award,
      color: "text-voyager-blue",
    },
  ];

  const growthStrategies = [
    {
      title: "Instagram Growth Tactics",
      icon: Instagram,
      tips: [
        "Post Reels 4-5 times per week during peak hours",
        "Use 20-30 relevant hashtags mixing popular and niche tags",
        "Engage with your audience within the first hour of posting",
        "Collaborate with creators in similar niches for cross-promotion",
        "Share behind-the-scenes content in Stories daily",
      ],
    },
    {
      title: "TikTok Algorithm Tips",
      icon: Camera,
      tips: [
        "Hook viewers in the first 3 seconds with compelling visuals",
        "Keep videos between 15-30 seconds for maximum completion rate",
        "Use trending sounds but add your unique spin",
        "Post 1-3 times daily for consistent growth",
        "Respond to comments with video replies to boost engagement",
      ],
    },
    {
      title: "YouTube SEO Basics",
      icon: Youtube,
      tips: [
        "Research keywords using YouTube's search suggestions",
        "Create compelling thumbnails with faces and clear text",
        "Write detailed descriptions with timestamps and keywords",
        "Add cards and end screens to increase watch time",
        "Optimize upload schedule based on your audience's timezone",
      ],
    },
    {
      title: "Content Calendar Planning",
      icon: Calendar,
      tips: [
        "Plan content 2-4 weeks in advance for consistency",
        "Batch create content in dedicated shooting sessions",
        "Mix evergreen and trending content for balance",
        "Schedule posts during your audience's most active hours",
        "Leave room for spontaneous, authentic moments",
      ],
    },
  ];

  const toolsRecommendations = [
    {
      category: "Photo Editing",
      icon: Camera,
      tools: [
        { name: "Lightroom Mobile", level: "Free & Pro", use: "Professional-grade photo editing" },
        { name: "VSCO", level: "Free & Pro", use: "Aesthetic filters and film-like presets" },
        { name: "Snapseed", level: "Free", use: "Powerful mobile editing with selective adjustments" },
      ],
    },
    {
      category: "Video Editing",
      icon: Camera,
      tools: [
        { name: "CapCut", level: "Free", use: "TikTok and Instagram Reels editing" },
        { name: "InShot", level: "Free & Pro", use: "All-in-one video editor with music and effects" },
        { name: "Adobe Premiere Rush", level: "Subscription", use: "Professional cross-device editing" },
      ],
    },
    {
      category: "Design & Graphics",
      icon: Lightbulb,
      tools: [
        { name: "Canva", level: "Free & Pro", use: "Easy graphic design and templates" },
        { name: "Over", level: "Subscription", use: "Quick overlay graphics and text" },
        { name: "Unfold", level: "Free & Pro", use: "Instagram Story templates" },
      ],
    },
    {
      category: "Scheduling & Analytics",
      icon: BarChart,
      tools: [
        { name: "Later", level: "Free & Pro", use: "Visual Instagram planning and scheduling" },
        { name: "Metricool", level: "Free & Pro", use: "Multi-platform analytics and scheduling" },
        { name: "Creator Studio", level: "Free", use: "Facebook & Instagram native scheduling" },
      ],
    },
  ];

  const rateGuide = [
    {
      followers: "1K - 10K (Micro)",
      instagram: "$100 - $500",
      tiktok: "$50 - $300",
      youtube: "$200 - $800",
      deliverables: "2-3 posts, 5-8 stories",
    },
    {
      followers: "10K - 50K",
      instagram: "$500 - $1,500",
      tiktok: "$300 - $1,000",
      youtube: "$800 - $2,500",
      deliverables: "3-4 posts, 8-12 stories, 1 reel",
    },
    {
      followers: "50K - 100K",
      instagram: "$1,500 - $3,500",
      tiktok: "$1,000 - $2,500",
      youtube: "$2,500 - $5,000",
      deliverables: "4-5 posts, 12-15 stories, 2 reels",
    },
    {
      followers: "100K - 500K (Macro)",
      instagram: "$3,500 - $10,000",
      tiktok: "$2,500 - $7,500",
      youtube: "$5,000 - $15,000",
      deliverables: "5-6 posts, 15-20 stories, 3 reels",
    },
    {
      followers: "500K+ (Mega)",
      instagram: "$10,000+",
      tiktok: "$7,500+",
      youtube: "$15,000+",
      deliverables: "Custom deliverables negotiated",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-brand-green/10 via-background to-voyager-blue/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-brand-green/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-brand-green" />
              <span className="text-brand-green font-medium">Everything You Need to Succeed</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-green via-voyager-blue to-brand-green bg-clip-text text-transparent">
              Creator Resources Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional templates, guides, and tools to help you succeed as a travel content creator
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-green mb-2">20+</div>
              <div className="text-muted-foreground">Email Templates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-voyager-blue mb-2">50+</div>
              <div className="text-muted-foreground">Caption Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-green mb-2">15+</div>
              <div className="text-muted-foreground">Downloadable PDFs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-voyager-blue mb-2">100%</div>
              <div className="text-muted-foreground">Free Resources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Templates */}
      <section className="py-16 bg-gradient-to-b from-background to-brand-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-brand-green/10 rounded-xl">
              <Mail className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Email Templates</h2>
              <p className="text-muted-foreground">Professional templates for every stage of collaboration</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {emailTemplates.map((template, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-green/10 rounded-lg group-hover:bg-brand-green/20 transition-colors">
                      <template.icon className="w-5 h-5 text-brand-green" />
                    </div>
                    <h3 className="font-semibold text-lg">{template.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(template.content, template.title)}
                    className="hover:bg-brand-green/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                    {template.content}
                  </pre>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Caption Templates */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-voyager-blue/10 rounded-xl">
              <FileText className="w-6 h-6 text-voyager-blue" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Caption Templates</h2>
              <p className="text-muted-foreground">Ready-to-use captions for every content style</p>
            </div>
          </div>

          <div className="space-y-8">
            {captionTemplates.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-voyager-blue" />
                  <span>{category.category}</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.templates.map((template, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start">
                        <p className="text-sm flex-1 pr-2">{template}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(template, "Caption")}
                          className="hover:bg-voyager-blue/10 shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16 bg-gradient-to-b from-background to-voyager-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-brand-green/10 rounded-xl">
              <Download className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Downloadable Resources</h2>
              <p className="text-muted-foreground">Professional templates and guides in PDF format</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadableResources.map((resource, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-brand-green/10 to-voyager-blue/10 rounded-xl group-hover:scale-110 transition-transform">
                    <resource.icon className={`w-6 h-6 ${resource.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <span className="text-xs text-muted-foreground">{resource.size}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Strategies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-voyager-blue/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-voyager-blue" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Growth Strategies</h2>
              <p className="text-muted-foreground">Platform-specific tactics to grow your audience</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {growthStrategies.map((strategy, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-voyager-blue/10 rounded-lg">
                    <strategy.icon className="w-5 h-5 text-voyager-blue" />
                  </div>
                  <h3 className="font-semibold text-lg">{strategy.title}</h3>
                </div>
                <ul className="space-y-3">
                  {strategy.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-brand-green mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools & Apps */}
      <section className="py-16 bg-gradient-to-b from-background to-brand-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-brand-green/10 rounded-xl">
              <Wrench className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Recommended Tools & Apps</h2>
              <p className="text-muted-foreground">Essential tools for content creation and management</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {toolsRecommendations.map((category, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-brand-green/10 rounded-lg">
                    <category.icon className="w-5 h-5 text-brand-green" />
                  </div>
                  <h3 className="font-semibold text-lg">{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.tools.map((tool, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.use}</div>
                      </div>
                      <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-1 rounded shrink-0 ml-2">
                        {tool.level}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Rates Guide */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-voyager-blue/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-voyager-blue" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Industry Rate Guide</h2>
              <p className="text-muted-foreground">Know your worth: average rates by follower count</p>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> These are general guidelines. Your rates may vary based on engagement rate, niche, content quality, and usage rights. Always negotiate based on your unique value proposition.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Follower Range</th>
                    <th className="text-left py-3 px-4 font-semibold">Instagram</th>
                    <th className="text-left py-3 px-4 font-semibold">TikTok</th>
                    <th className="text-left py-3 px-4 font-semibold">YouTube</th>
                    <th className="text-left py-3 px-4 font-semibold">Typical Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  {rateGuide.map((row, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.followers}</td>
                      <td className="py-4 px-4 text-brand-green font-semibold">{row.instagram}</td>
                      <td className="py-4 px-4 text-voyager-blue font-semibold">{row.tiktok}</td>
                      <td className="py-4 px-4 text-brand-green font-semibold">{row.youtube}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{row.deliverables}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p><strong>Factors that increase your rates:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>High engagement rate (3%+ is excellent)</li>
                <li>Niche audience with specific demographics</li>
                <li>Professional content quality and editing</li>
                <li>Extended usage rights for content</li>
                <li>Exclusivity agreements</li>
                <li>Multiple platform deliverables</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-green to-voyager-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Start Creating?</h2>
          <p className="text-xl mb-8 text-white/90">
            Browse amazing properties and start your collaboration journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-brand-green hover:bg-white/90">
              Browse Properties
            </Button>
            <Button size="lg" variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20">
              Join as Creator
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreatorResources;
