import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, User, Settings, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: () => void;
}

export const UserDetailModal = ({ isOpen, onClose, user, onUserUpdated }: UserDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    location: "",
    is_active: true,
    verified: false,
    premium_override: false,
    premium_override_expires_at: "",
    admin_notes: "",
    user_type: ""
  });
  
  const { toast } = useToast();

  // Reset form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        location: user.location || "",
        is_active: user.is_active ?? true,
        verified: user.verified ?? false,
        premium_override: user.premium_override || false,
        premium_override_expires_at: user.premium_override_expires_at || "",
        admin_notes: user.admin_notes || "",
        user_type: user.user_type || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          location: formData.location,
          is_active: formData.is_active,
          verified: formData.verified,
          premium_override: formData.premium_override,
          premium_override_expires_at: formData.premium_override_expires_at || null,
          admin_notes: formData.admin_notes,
          user_type: formData.user_type || null
        })
        .eq('id', user.id);

      if (error) throw error;

      // Log verification status change
      if (formData.verified !== user.verified) {
        await supabase.from("admin_activity_log").insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: formData.verified ? "verify_user" : "unverify_user",
          target_type: "user",
          target_id: user.id,
          details: {
            user_email: user.email,
            user_name: `${user.first_name} ${user.last_name}`,
          },
        });
      }

      const overrideMessage = formData.premium_override ? 
        "User updated successfully. Premium override granted - user now has full platform access." : 
        formData.verified !== user.verified ?
        `User ${formData.verified ? 'verified' : 'unverified'} successfully` :
        "User updated successfully.";
      
      toast({
        title: "Success",
        description: overrideMessage,
      });
      
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'host':
        return 'bg-green-100 text-green-800';
      case 'influencer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Manage User: {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>User Type</Label>
              <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                placeholder="Internal notes about this user..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active ? "User account is active" : "User account is deactivated"}
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Premium Override</h4>
                <p className="text-sm text-muted-foreground">
                  Grant premium features without subscription
                </p>
              </div>
              <Switch
                checked={formData.premium_override}
                onCheckedChange={(checked) => setFormData({ ...formData, premium_override: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Verified Account</h4>
                <p className="text-sm text-muted-foreground">
                  Show verification badge on user's profile
                </p>
              </div>
              <Switch
                checked={formData.verified}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, verified: checked })
                }
              />
            </div>

            {formData.premium_override && (
              <div className="space-y-2">
                <Label>Premium Override Expires At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.premium_override_expires_at}
                  onChange={(e) => setFormData({ ...formData, premium_override_expires_at: e.target.value })}
                />
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getUserTypeColor(user.user_type || 'unknown')}>
                  {user.user_type || 'Not Set'}
                </Badge>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
                {user.premium_override && (
                  <Badge variant="secondary">Premium Override</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <h4 className="font-medium">Subscription Status</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Subscription management features will be displayed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4" />
                <h4 className="font-medium">Recent Activity</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                User activity logs will be displayed here
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};