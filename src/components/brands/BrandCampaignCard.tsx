import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, Calendar, DollarSign } from 'lucide-react';
import type { BrandCampaign } from '@/hooks/useBrandCampaigns';
import { useState } from 'react';
import { BrandCampaignManagementModal } from './BrandCampaignManagementModal';

interface BrandCampaignCardProps {
  campaign: BrandCampaign;
}

export const BrandCampaignCard = ({ campaign }: BrandCampaignCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'overview' | 'applications'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'paused': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'closed': return 'bg-gray-500/10 text-foreground/80 dark:text-muted-foreground';
      default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  const handleViewDetails = () => {
    setDefaultTab('overview');
    setModalOpen(true);
  };

  const handleManage = () => {
    setDefaultTab('applications');
    setModalOpen(true);
  };

  return (
    <>
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold line-clamp-1">{campaign.campaign_title}</h3>
              <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.campaign_description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.views_count} views</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.applications_count} applications</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.spots_filled}/{campaign.spots_available} spots</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="capitalize">{campaign.compensation_type}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {campaign.required_platforms.slice(0, 3).map((platform) => (
            <Badge key={platform} variant="outline" className="text-xs">
              {platform}
            </Badge>
          ))}
          {campaign.required_platforms.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{campaign.required_platforms.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleViewDetails}>View Details</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={handleManage}>Manage</Button>
        </div>
      </CardContent>
    </Card>

    <BrandCampaignManagementModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      campaign={campaign}
      defaultTab={defaultTab}
    />
    </>
  );
};
