import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Trophy, Megaphone, Award, Settings } from 'lucide-react';
import { useAmbassadorAdmin } from '@/hooks/useAmbassadorAdmin';
import { AmbassadorList } from './AmbassadorList';
import { BonusAwarder } from './BonusAwarder';
import { TierManager } from './TierManager';
import { AnnouncementComposer } from './AnnouncementComposer';

export function AmbassadorManagement() {
  const { stats, isLoading } = useAmbassadorAdmin();
  const [activeTab, setActiveTab] = useState('list');

  const statCards = [
    {
      title: 'Total Ambassadors',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active',
      value: stats?.active || 0,
      icon: Trophy,
      color: 'text-brand-green',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Pending Applications',
      value: stats?.pending || 0,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Total Paid',
      value: `$${(stats?.totalPaid || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ambassador Program</h2>
          <p className="text-muted-foreground">Manage ambassadors, bonuses, and announcements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="list" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Ambassadors</span>
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Bonuses</span>
          </TabsTrigger>
          <TabsTrigger value="tiers" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Tiers</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <AmbassadorList />
        </TabsContent>

        <TabsContent value="bonuses" className="mt-6">
          <BonusAwarder />
        </TabsContent>

        <TabsContent value="tiers" className="mt-6">
          <TierManager />
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <AnnouncementComposer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
