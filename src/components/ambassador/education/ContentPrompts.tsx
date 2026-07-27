import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Instagram, Video, Youtube, Globe, Sparkles, Users } from "lucide-react";
import { useContentTemplates, ContentTemplate, ContentType } from "@/hooks/useContentTemplates";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORM_CONFIG: Record<ContentType, { icon: React.ReactNode; label: string; color: string }> = {
  instagram: { icon: <Instagram className="h-4 w-4" />, label: "Instagram", color: "text-pink-500" },
  tiktok: { icon: <Video className="h-4 w-4" />, label: "TikTok", color: "text-foreground" },
  youtube: { icon: <Youtube className="h-4 w-4" />, label: "YouTube", color: "text-red-500" },
  general: { icon: <Globe className="h-4 w-4" />, label: "All Platforms", color: "text-muted-foreground" },
};

const CATEGORY_LABELS: Record<string, string> = {
  caption: "Captions",
  script: "Scripts",
  prompt: "Prompts",
  hook: "Hooks",
};

interface ContentTemplateCardProps {
  template: ContentTemplate;
}

const ContentTemplateCard = ({ template }: ContentTemplateCardProps) => {
  const [copied, setCopied] = useState(false);
  const platformConfig = PLATFORM_CONFIG[template.content_type];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Template copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={platformConfig.color}>{platformConfig.icon}</span>
            <span className="text-sm font-medium">{template.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {template.is_featured && (
              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[template.category]}
            </Badge>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {template.content}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Used {template.usage_count} times</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>

        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/50">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ContentPrompts = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { templates, isLoading } = useContentTemplates();

  const filteredTemplates = activeTab === "all" 
    ? templates 
    : templates.filter(t => t.content_type === activeTab);

  const featuredTemplates = templates.filter(t => t.is_featured);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Section */}
      {featuredTemplates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium">Featured This Week</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredTemplates.slice(0, 2).map((template) => (
              <ContentTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        <h3 className="font-medium">All Templates</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="instagram" className="gap-1">
              <Instagram className="h-3 w-3" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="gap-1">
              <Video className="h-3 w-3" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="youtube" className="gap-1">
              <Youtube className="h-3 w-3" />
              YouTube
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No templates available for this platform yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <ContentTemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
