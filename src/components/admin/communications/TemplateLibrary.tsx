import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Mail,
  Megaphone,
  Gift,
  UserPlus,
  RefreshCw,
  Calendar,
  Check,
} from "lucide-react";

interface TemplateLibraryProps {
  onSelectTemplate: (template: { subject: string; content: string; name: string }) => void;
}

const builtInTemplates = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Onboard new users with a warm welcome",
    category: "Onboarding",
    icon: UserPlus,
    subject: "Welcome to HostFluencer, {firstName}! 🎉",
    content: `<h1>Welcome aboard, {firstName}!</h1>

<p>We're thrilled to have you join the HostFluencer community! You've just taken the first step toward amazing collaboration opportunities.</p>

<h2>What's Next?</h2>

<p>Here's how to get started:</p>

<ol>
  <li><strong>Complete your profile</strong> - Add your photo and bio to stand out</li>
  <li><strong>Connect your socials</strong> - Link your Instagram, TikTok, or YouTube</li>
  <li><strong>Browse opportunities</strong> - Discover properties and brands looking for creators</li>
</ol>

<p style="text-align: center; margin: 30px 0;">
  <a href="https://hostfluencer.com/profile" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Complete Your Profile</a>
</p>

<p>Need help? Our team is here for you at any time.</p>

<p>Cheers,<br>The HostFluencer Team</p>`,
  },
  {
    id: "feature-announcement",
    name: "Feature Announcement",
    description: "Announce new features or updates",
    category: "Updates",
    icon: Megaphone,
    subject: "Exciting New Feature: Check This Out! 🚀",
    content: `<h1>Big News, {firstName}!</h1>

<p>We've been working hard on something special, and we're excited to share it with you today.</p>

<h2>Introducing [Feature Name]</h2>

<p>[Brief description of the feature and its main benefit]</p>

<h3>What you can do now:</h3>

<ul>
  <li><strong>[Benefit 1]</strong> - Description of what this enables</li>
  <li><strong>[Benefit 2]</strong> - Description of what this enables</li>
  <li><strong>[Benefit 3]</strong> - Description of what this enables</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="https://hostfluencer.com" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Try It Now</a>
</p>

<p>We'd love to hear your feedback!</p>

<p>Best,<br>The HostFluencer Team</p>`,
  },
  {
    id: "special-offer",
    name: "Special Offer",
    description: "Promotional emails with discounts",
    category: "Promotions",
    icon: Gift,
    subject: "🎁 Exclusive Offer Just For You, {firstName}!",
    content: `<h1 style="text-align: center;">Special Offer Inside! 🎁</h1>

<p>Hi {firstName},</p>

<p>As one of our valued members, we're offering you an exclusive deal that you won't want to miss.</p>

<div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
  <h2 style="margin: 0 0 8px 0; color: #10b981;">[XX]% OFF</h2>
  <p style="margin: 0; font-size: 14px; color: #6b7280;">Use code: <strong>[CODE]</strong></p>
  <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Valid until [Date]</p>
</div>

<p>Don't miss out on this limited-time opportunity to [benefit of the offer].</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="https://hostfluencer.com/pricing" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Claim Your Offer</a>
</p>

<p>Happy creating!<br>The HostFluencer Team</p>`,
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Win back inactive users",
    category: "Retention",
    icon: RefreshCw,
    subject: "We miss you, {firstName}! Here's what's new 👋",
    content: `<h1>Hey {firstName}, we miss you!</h1>

<p>It's been a while since we last saw you on HostFluencer, and we wanted to check in.</p>

<h2>Here's what you've been missing:</h2>

<ul>
  <li><strong>New collaboration opportunities</strong> - Fresh listings added daily</li>
  <li><strong>Platform improvements</strong> - We've made things faster and easier</li>
  <li><strong>Growing community</strong> - Connect with more creators and hosts</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="https://hostfluencer.com" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Explore Now</a>
</p>

<p>Your next great collaboration is waiting. Come back and see what's new!</p>

<p>See you soon,<br>The HostFluencer Team</p>`,
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    description: "Invite users to events or webinars",
    category: "Events",
    icon: Calendar,
    subject: "You're Invited: [Event Name] 📅",
    content: `<h1 style="text-align: center;">You're Invited! 🎉</h1>

<p>Hi {firstName},</p>

<p>We're excited to invite you to an exclusive event:</p>

<div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; margin: 24px 0;">
  <h2 style="margin: 0 0 16px 0;">[Event Name]</h2>
  <p style="margin: 4px 0;"><strong>📅 Date:</strong> [Date]</p>
  <p style="margin: 4px 0;"><strong>🕐 Time:</strong> [Time] [Timezone]</p>
  <p style="margin: 4px 0;"><strong>📍 Location:</strong> [Venue/Online]</p>
</div>

<h3>What to expect:</h3>

<ul>
  <li>[Highlight 1]</li>
  <li>[Highlight 2]</li>
  <li>[Highlight 3]</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">RSVP Now</a>
</p>

<p>Spots are limited, so don't wait!</p>

<p>See you there,<br>The HostFluencer Team</p>`,
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest",
    description: "Summary newsletter template",
    category: "Newsletter",
    icon: Mail,
    subject: "Your Weekly HostFluencer Update 📬",
    content: `<h1>Your Weekly Digest</h1>

<p>Hi {firstName}, here's what happened this week on HostFluencer:</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<h2>📊 Your Stats</h2>
<ul>
  <li>Profile views: [X]</li>
  <li>New matches: [X]</li>
  <li>Messages received: [X]</li>
</ul>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<h2>🏠 New Opportunities</h2>
<p>[X] new properties are looking for creators in your niche this week.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="https://hostfluencer.com/marketplace" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Browse Opportunities</a>
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<h2>💡 Tip of the Week</h2>
<blockquote>
  "[Insert helpful tip or best practice]"
</blockquote>

<p>Have a great week ahead!</p>

<p>The HostFluencer Team</p>`,
  },
];

export const TemplateLibrary = ({ onSelectTemplate }: TemplateLibraryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Template Library
        </CardTitle>
        <CardDescription>
          Start with a pre-designed template and customize it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-3">
            {builtInTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectTemplate({
                    name: template.name,
                    subject: template.subject,
                    content: template.content,
                  })}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
