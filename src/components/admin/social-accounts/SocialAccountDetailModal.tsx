import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SocialAccount } from '@/hooks/useSocialAccountsManagement';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Users, 
  Calendar,
  Trash2,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SocialAccountDetailModalProps {
  account: SocialAccount | null;
  open: boolean;
  onClose: () => void;
  onVerify: (accountId: string) => void;
  onUnverify: (accountId: string) => void;
  onUpdateFollowers: (accountId: string, count: number) => void;
  onDelete: (accountId: string) => void;
}

export const SocialAccountDetailModal = ({
  account,
  open,
  onClose,
  onVerify,
  onUnverify,
  onUpdateFollowers,
  onDelete,
}: SocialAccountDetailModalProps) => {
  const [isEditingFollowers, setIsEditingFollowers] = useState(false);
  const [followerCount, setFollowerCount] = useState(account?.follower_count || 0);

  if (!account) return null;

  const handleUpdateFollowers = () => {
    onUpdateFollowers(account.id, followerCount);
    setIsEditingFollowers(false);
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Social Account Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="influencer">Influencer</TabsTrigger>
            <TabsTrigger value="actions">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Platform</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-base">
                        {account.platform}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Verification Status</Label>
                    <div className="mt-1">
                      {account.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          <XCircle className="h-4 w-4 mr-1" />
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <div className="mt-1">
                    <a 
                      href={account.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-lg"
                    >
                      @{account.username}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Follower Count</Label>
                  {isEditingFollowers ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={followerCount}
                        onChange={(e) => setFollowerCount(parseInt(e.target.value) || 0)}
                        className="max-w-[200px]"
                      />
                      <Button size="sm" onClick={handleUpdateFollowers}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setIsEditingFollowers(false);
                          setFollowerCount(account.follower_count);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">
                          {formatFollowerCount(account.follower_count)}
                        </span>
                        <span className="text-muted-foreground">
                          ({account.follower_count.toLocaleString()})
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setIsEditingFollowers(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(account.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(account.last_updated), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influencer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Influencer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={account.influencer?.profiles?.profile_photo_url} />
                    <AvatarFallback className="text-lg">
                      {account.influencer?.profiles?.first_name?.[0]}
                      {account.influencer?.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {account.influencer?.profiles?.first_name} {account.influencer?.profiles?.last_name}
                    </h3>
                    <p className="text-muted-foreground">Influencer ID: {account.influencer_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification</Label>
                  <div className="flex gap-2">
                    {account.is_verified ? (
                      <Button
                        variant="outline"
                        onClick={() => onUnverify(account.id)}
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Unverify Account
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onVerify(account.id)}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Account
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Danger Zone</Label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this social account. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDelete(account.id);
                            onClose();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
