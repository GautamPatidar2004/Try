
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Activity, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
  admin_id: string;
  profiles?: { first_name: string | null; last_name: string | null } | null;
}

const AdminActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*, profiles!admin_activity_log_admin_id_profiles_fkey(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Admin Activity Log</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Admin Actions ({activities.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {activities.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge className={getActionColor(activity.action)}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {activity.profiles?.first_name || activity.profiles?.last_name
                              ? `${activity.profiles.first_name || ''} ${activity.profiles.last_name || ''}`.trim()
                              : activity.admin_id.substring(0, 8) + '...'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium capitalize">
                            {activity.target_type?.replace('_', ' ')}
                          </p>
                          {activity.target_id && (
                            <p className="text-sm text-muted-foreground font-mono">
                              {activity.target_id.substring(0, 8)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.details ? (
                          <div className="text-sm text-gray-600">
                            {JSON.stringify(activity.details, null, 2).substring(0, 100)}
                            {JSON.stringify(activity.details).length > 100 && '...'}
                          </div>
                        ) : (
                          <span className="text-gray-400">No details</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No admin activity recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLog;
