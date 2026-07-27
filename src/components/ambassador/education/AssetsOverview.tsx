import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Image, FileText, QrCode, Palette, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface AssetItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  downloadUrl?: string;
}

const ASSET_CATEGORIES = [
  {
    title: "Brand Kit",
    description: "Official logos, colors, and brand guidelines",
    icon: <Palette className="h-5 w-5" />,
    items: [
      { title: "Logo Pack (PNG, SVG)", description: "All logo variations" },
      { title: "Color Palette", description: "Brand colors with hex codes" },
      { title: "Typography Guide", description: "Approved fonts and usage" },
    ],
  },
  {
    title: "Social Graphics",
    description: "Ready-to-use graphics for your posts",
    icon: <Image className="h-5 w-5" />,
    items: [
      { title: "Instagram Stories", description: "1080x1920 templates" },
      { title: "Feed Posts", description: "1080x1080 square graphics" },
      { title: "TikTok Overlays", description: "Video overlay templates" },
    ],
  },
  {
    title: "Documents",
    description: "Guides, fact sheets, and resources",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { title: "Ambassador Guide PDF", description: "Complete program overview" },
      { title: "FAQ Document", description: "Common questions answered" },
      { title: "Platform Statistics", description: "Key metrics for sharing" },
    ],
  },
];

export const AssetsOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Download official assets for your ambassador content
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/marketing-assets" className="gap-2">
            <ExternalLink className="h-3 w-3" />
            Full Library
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ASSET_CATEGORIES.map((category) => (
          <Card key={category.title} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Quick Access */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">QR Code Generator</h3>
              <p className="text-xs text-muted-foreground">
                Create custom QR codes with your referral link
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/marketing-assets">Generate</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
