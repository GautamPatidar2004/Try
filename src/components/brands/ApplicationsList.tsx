import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationCard } from './ApplicationCard';
import { Loader2, Inbox } from 'lucide-react';

interface ApplicationsListProps {
  applications: any[];
  isLoading: boolean;
}

export const ApplicationsList = ({ applications, isLoading }: ApplicationsListProps) => {
  const [activeTab, setActiveTab] = useState('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Applications</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const getCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          All ({getCount('all')})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({getCount('pending')})
        </TabsTrigger>
        <TabsTrigger value="accepted">
          Accepted ({getCount('accepted')})
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected ({getCount('rejected')})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4 mt-6">
        {filteredApplications.length === 0 ? (
          <EmptyState message="No applications yet. Share your campaign to attract influencers!" />
        ) : (
          filteredApplications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4 mt-6">
        {filteredApplications.length === 0 ? (
          <EmptyState message="No pending applications at the moment." />
        ) : (
          filteredApplications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </TabsContent>

      <TabsContent value="accepted" className="space-y-4 mt-6">
        {filteredApplications.length === 0 ? (
          <EmptyState message="No accepted applications yet." />
        ) : (
          filteredApplications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </TabsContent>

      <TabsContent value="rejected" className="space-y-4 mt-6">
        {filteredApplications.length === 0 ? (
          <EmptyState message="No rejected applications." />
        ) : (
          filteredApplications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
