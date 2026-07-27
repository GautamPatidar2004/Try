import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Shield, UserMinus, UserPlus, Clock, AlertTriangle } from 'lucide-react';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { AdminUserSearch } from './AdminUserSearch';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AdminManagementPanel = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const { user } = useAdminAuth();
  const { 
    fetchAdmins, 
    fetchAdminActivity, 
    grantAdminRole, 
    revokeAdminRole,
    isLoading 
  } = useAdminRoles();

  const loadData = async () => {
    const [adminData, activityData] = await Promise.all([
      fetchAdmins(),
      fetchAdminActivity()
    ]);
    setAdmins(adminData);
    setActivity(activityData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGrantAdmin = async () => {
    if (!selectedUser) return;
    try {
      await grantAdminRole(selectedUser.id);
      await loadData();
      setShowGrantDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to grant admin:', error);
    }
  };

  const handleRevokeAdmin = async () => {
    if (!selectedUser || confirmText !== 'REVOKE') return;
    try {
      await revokeAdminRole(selectedUser.id);
      await loadData();
      setShowRevokeDialog(false);
      setSelectedUser(null);
      setConfirmText('');
    } catch (error) {
      console.error('Failed to revoke admin:', error);
    }
  };

  const canRemoveAdmin = admins.length > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>
            Manage administrator access for the platform. Admins have full control over all settings and data.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Administrator
          </CardTitle>
          <CardDescription>
            Search for users to grant admin access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserSearch
            onUserSelected={(userId, userName) => {
              setSelectedUser({ id: userId, name: userName });
              setShowGrantDialog(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Current Administrators ({admins.length})</CardTitle>
          <CardDescription>
            Users with full platform access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {admins.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No administrators found
            </p>
          )}
          {admins.map((admin) => {
            const profile = admin.profiles;
            const grantedBy = admin.granted_by_profile;
            const isCurrentUser = admin.user_id === user?.id;

            return (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {profile?.id.slice(0, 8)}...</p>
                    {grantedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Granted by {grantedBy.first_name} {grantedBy.last_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Since {new Date(admin.granted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCurrentUser || !canRemoveAdmin || isLoading}
                  onClick={() => {
                    setSelectedUser({
                      id: admin.user_id,
                      name: `${profile?.first_name} ${profile?.last_name}`
                    });
                    setShowRevokeDialog(true);
                  }}
                  className="gap-2"
                >
                  <UserMinus className="h-4 w-4" />
                  Remove Admin
                </Button>
              </div>
            );
          })}

          {!canRemoveAdmin && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Last Administrator</p>
                <p className="text-amber-700 dark:text-amber-300">
                  Cannot remove the last admin to prevent platform lockout
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Admin Role Changes
          </CardTitle>
          <CardDescription>
            Audit log of admin role modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          )}
          <div className="space-y-3">
            {activity.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded ${
                  log.action === 'grant_admin_role' 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {log.action === 'grant_admin_role' ? (
                    <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <UserMinus className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {log.action === 'grant_admin_role' ? 'Admin Access Granted' : 'Admin Access Revoked'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {log.details?.target_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {log.admin?.first_name} {log.admin?.last_name} • {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grant Admin Dialog */}
      <AlertDialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Admin Access</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to grant full administrator access to <strong>{selectedUser?.name}</strong>.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1">
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  ⚠️ This will give them access to:
                </p>
                <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>All platform data and settings</li>
                  <li>User management and permissions</li>
                  <li>Financial information</li>
                  <li>System configuration</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGrantAdmin}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Granting...' : 'Grant Admin Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Admin Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Admin Access</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to remove admin access from <strong>{selectedUser?.name}</strong>.
              </p>
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                  ⚠️ This will immediately revoke all admin privileges
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Type <strong>REVOKE</strong> to confirm</Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="REVOKE"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedUser(null);
              setConfirmText('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAdmin}
              disabled={confirmText !== 'REVOKE' || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Revoking...' : 'Revoke Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};