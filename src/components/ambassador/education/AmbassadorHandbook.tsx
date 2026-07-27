import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Star, TrendingUp, CreditCard, FileText } from "lucide-react";

interface HandbookSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  badge?: string;
}

const HANDBOOK_SECTIONS: HandbookSection[] = [
  {
    id: "earnings",
    title: "How Earnings Work",
    icon: <DollarSign className="h-4 w-4 text-green-500" />,
    badge: "Important",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>As an ambassador, you earn commissions when your referrals take action:</p>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="font-semibold text-foreground">Creators</div>
            <div className="flex-1">20% recurring commission on subscription fees</div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="font-semibold text-foreground">Property Owners</div>
            <div className="flex-1">15% of first collaboration booking fee</div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="font-semibold text-foreground">Brands</div>
            <div className="flex-1">10% of first campaign spend</div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="font-semibold text-foreground">Restaurants</div>
            <div className="flex-1">12% of first booking value</div>
          </div>
        </div>
        <p className="text-xs">
          Commission rates may increase based on your tier level. Elite ambassadors can earn up to 25% on creator referrals.
        </p>
      </div>
    ),
  },
  {
    id: "requirements",
    title: "Monthly Requirements",
    icon: <Calendar className="h-4 w-4 text-blue-500" />,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>To maintain your active ambassador status, complete these monthly:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span><strong>1 Feed Post</strong> - Mention Hostfluencer in an Instagram/TikTok post</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span><strong>3 Stories</strong> - Share your referral link in stories</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span><strong>Stay Active</strong> - Log into your dashboard at least once</span>
          </li>
        </ul>
        <p className="text-xs bg-amber-500/10 text-amber-600 p-2 rounded">
          ⚠️ Missing requirements for 2 consecutive months will result in account deactivation.
        </p>
      </div>
    ),
  },
  {
    id: "best-practices",
    title: "Best Practices",
    icon: <Star className="h-4 w-4 text-amber-500" />,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h4 className="font-medium text-foreground mb-2">✅ Do's</h4>
          <ul className="space-y-1">
            <li>• Share authentic experiences and testimonials</li>
            <li>• Use your personalized referral link consistently</li>
            <li>• Engage with potential referrals' questions</li>
            <li>• Create content showing the platform's value</li>
            <li>• Target your niche audience (creators, property owners, etc.)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-2">❌ Don'ts</h4>
          <ul className="space-y-1">
            <li>• Don't spam your link in unrelated communities</li>
            <li>• Don't make false claims about earnings</li>
            <li>• Don't use bots or fake accounts</li>
            <li>• Don't share your referral link as "ads" without disclosure</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "tier-benefits",
    title: "Tier Benefits",
    icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Progress through tiers to unlock exclusive benefits:</p>
        <div className="grid gap-2">
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span className="text-muted-foreground">🥉</span> Standard
            </div>
            <p className="text-xs mt-1">Base commission rates, access to all marketing assets</p>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span className="text-muted-foreground">🥈</span> Silver
            </div>
            <p className="text-xs mt-1">+2% commission bonus, priority support, monthly strategy calls</p>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span className="text-yellow-500">🥇</span> Gold
            </div>
            <p className="text-xs mt-1">+5% commission bonus, exclusive campaigns, early access features</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span>💎</span> Elite
            </div>
            <p className="text-xs mt-1">+8% commission bonus, 1:1 coaching, co-marketing opportunities</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payments",
    title: "Payment Information",
    icon: <CreditCard className="h-4 w-4 text-teal-500" />,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Payments are processed on Net-30 terms:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground min-w-[100px]">Minimum:</span>
            <span>$50 USD to request payout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground min-w-[100px]">Methods:</span>
            <span>PayPal, Direct Deposit (US), Wise (International)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground min-w-[100px]">Schedule:</span>
            <span>Earnings from Month 1 are paid by end of Month 2</span>
          </li>
        </ul>
        <p className="text-xs">
          Set up your payment method in the Settings tab to ensure timely payments.
        </p>
      </div>
    ),
  },
  {
    id: "content-guidelines",
    title: "Content Guidelines",
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Follow these guidelines when creating ambassador content:</p>
        <ul className="space-y-2">
          <li>• <strong>Disclosure:</strong> Always use #ad or #sponsored when required by FTC</li>
          <li>• <strong>Branding:</strong> Use official Hostfluencer logos and colors from the asset library</li>
          <li>• <strong>Tone:</strong> Be authentic, enthusiastic, and helpful</li>
          <li>• <strong>Claims:</strong> Only share verified facts and your personal experience</li>
          <li>• <strong>Images:</strong> Use high-quality visuals that represent the platform well</li>
        </ul>
        <p className="text-xs bg-muted/50 p-2 rounded">
          💡 Tip: Check the Content Ideas tab for pre-approved captions and scripts!
        </p>
      </div>
    ),
  },
];

export const AmbassadorHandbook = () => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Your complete guide to succeeding as a Hostfluencer Ambassador. Click any section to expand.
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-2">
        {HANDBOOK_SECTIONS.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border border-border/50 rounded-lg px-4 data-[state=open]:bg-muted/30"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-medium">{section.title}</span>
                {section.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {section.badge}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
