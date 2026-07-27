import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Award, Users, Star } from "lucide-react";
import { BadgeCard } from "./BadgeCard";
import { SyncBadgesButton } from "./SyncBadgesButton";
import { useBadges } from "@/hooks/useBadges";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgesGridProps {
  userId: string;
}

export const BadgesGrid = ({ userId }: BadgesGridProps) => {
  const { badges, earnedBadges, unEarnedBadges, completionPercentage, loading, error, refetch } = useBadges(userId);
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-4`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load badges. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = (badge as any).category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Target className="w-5 h-5" />;
      case 'collaboration': return <Users className="w-5 h-5" />;
      case 'content': return <Award className="w-5 h-5" />;
      case 'community': return <Users className="w-5 h-5" />;
      case 'quality': return <Star className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Sync Button */}
      <div className="flex justify-end">
        <SyncBadgesButton userId={userId} onSyncComplete={refetch} />
      </div>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">Badges Earned</h3>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {earnedBadges.length} of {badges.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{completionPercentage}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Next Goal</h3>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {unEarnedBadges.length > 0 
                  ? unEarnedBadges[0].name 
                  : "All badges earned!"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {unEarnedBadges.length > 0 
                  ? unEarnedBadges[0].description
                  : "Congratulations on completing all badges!"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="all">All ({badges.length})</TabsTrigger>
          <TabsTrigger value="earned">Earned ({earnedBadges.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({unEarnedBadges.length})</TabsTrigger>
          {Object.keys(badgesByCategory).map((category) => (
            <TabsTrigger key={category} value={category} className="gap-2">
              {getCategoryIcon(category)}
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-4`}>
            {badges.map((badge) => (
              <BadgeCard key={badge.id} {...badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-4`}>
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} {...badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-4`}>
            {unEarnedBadges.map((badge) => (
              <BadgeCard key={badge.id} {...badge} />
            ))}
          </div>
        </TabsContent>

        {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-4`}>
              {categoryBadges.map((badge) => (
                <BadgeCard key={badge.id} {...badge} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Empty State */}
      {badges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No badges available yet</h3>
            <p className="text-muted-foreground">
              Badges will appear here as you complete activities and milestones.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};