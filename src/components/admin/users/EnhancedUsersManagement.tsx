import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Crown,
  Shield,
  Ban,
  CheckCircle,
  Users,
  RefreshCw,
  Key,
  Filter,
  BadgeCheck,
} from "lucide-react";
import { UserStatsCards } from "./UserStatsCards";
import { AdvancedFiltersPanel, AdvancedFilters } from "./AdvancedFiltersPanel";
import { BulkOperationsBar } from "./BulkOperationsBar";
import { UserDetailModal } from "./UserDetailModal";
import { DuplicateAccountsManager } from "./DuplicateAccountsManager";


interface ExtendedUser {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  user_type: string;
  location: string;
  bio: string;
  created_at: string;
  profile_photo_url: string;
  is_active: boolean;
  premium_override: boolean;
  premium_override_expires_at: string;
  admin_notes: string;
  engagement_score?: number;
  login_count?: number;
  account_tier?: string;
  is_banned?: boolean;
  verified?: boolean;
  last_login_at?: string;
}

export const EnhancedUsersManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const { toast } = useToast();
  const { bulkActivateUsers, bulkDeactivateUsers, bulkBanUsers, exportUsers } = useUserManagement();

  useEffect(() => {
    fetchUsers();
  }, [advancedFilters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use edge function to fetch users with emails from auth.users
      const { data, error } = await supabase.functions.invoke("admin-list-users", {
        body: { filters: advancedFilters },
      });

      if (error) throw error;
      
      let users = data?.users || [];
      
      // Apply client-side filters (edge function returns all users)
      if (advancedFilters.userType) {
        users = users.filter((u: ExtendedUser) => u.user_type === advancedFilters.userType);
      }
      if (advancedFilters.accountTier) {
        users = users.filter((u: ExtendedUser) => u.account_tier === advancedFilters.accountTier);
      }
      if (advancedFilters.isActive !== undefined) {
        users = users.filter((u: ExtendedUser) => u.is_active === advancedFilters.isActive);
      }
      if (advancedFilters.isBanned !== undefined) {
        users = users.filter((u: ExtendedUser) => u.is_banned === advancedFilters.isBanned);
      }
      if (advancedFilters.engagementMin !== undefined) {
        users = users.filter((u: ExtendedUser) => (u.engagement_score || 0) >= advancedFilters.engagementMin!);
      }
      if (advancedFilters.engagementMax !== undefined) {
        users = users.filter((u: ExtendedUser) => (u.engagement_score || 0) <= advancedFilters.engagementMax!);
      }
      if (advancedFilters.loginCountMin !== undefined) {
        users = users.filter((u: ExtendedUser) => (u.login_count || 0) >= advancedFilters.loginCountMin!);
      }
      if (advancedFilters.registeredAfter) {
        users = users.filter((u: ExtendedUser) => new Date(u.created_at) >= new Date(advancedFilters.registeredAfter!));
      }
      if (advancedFilters.registeredBefore) {
        users = users.filter((u: ExtendedUser) => new Date(u.created_at) <= new Date(advancedFilters.registeredBefore!));
      }
      
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const togglePremiumOverride = async (userId: string, currentOverride: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ premium_override: !currentOverride })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Premium override ${!currentOverride ? 'enabled' : 'disabled'} successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating premium override:', error);
      toast({
        title: "Error",
        description: "Failed to update premium override",
        variant: "destructive",
      });
    }
  };

  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkActivate = async () => {
    await bulkActivateUsers(Array.from(selectedUserIds));
    setSelectedUserIds(new Set());
    await fetchUsers();
  };

  const handleBulkDeactivate = async () => {
    await bulkDeactivateUsers(Array.from(selectedUserIds));
    setSelectedUserIds(new Set());
    await fetchUsers();
  };

  const handleBulkBan = async (reason: string) => {
    await bulkBanUsers(Array.from(selectedUserIds), reason);
    setSelectedUserIds(new Set());
    await fetchUsers();
  };

  const handleBulkExport = () => {
    exportUsers(Array.from(selectedUserIds), advancedFilters);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    inactiveUsers: users.filter(u => !u.is_active).length,
    avgEngagement: users.reduce((sum, u) => sum + (u.engagement_score || 0), 0) / users.length || 0,
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || user.user_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Users Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
      </div>

      <UserStatsCards {...stats} />

      {showAdvancedFilters && (
        <AdvancedFiltersPanel
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onClearFilters={() => setAdvancedFilters({})}
        />
      )}

      <DuplicateAccountsManager />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="host">Hosts</option>
                <option value="influencer">Influencers</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleAllUsers}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.profile_photo_url ? (
                            <img 
                              src={user.profile_photo_url} 
                              alt="Profile" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.bio && (
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.email ? (
                        <a 
                          href={`mailto:${user.email}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {user.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">No email</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getUserTypeColor(user.user_type || 'unknown')}>
                        {user.user_type || 'Not Set'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                        />
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from("profiles")
                              .update({ verified: !user.verified })
                              .eq("id", user.id);
                            
                            if (error) throw error;
                            fetchUsers();
                            
                            toast({
                              title: "Success",
                              description: `User ${!user.verified ? 'verified' : 'unverified'} successfully`,
                            });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {user.verified ? (
                          <BadgeCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {user.location || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.premium_override}
                          onCheckedChange={() => togglePremiumOverride(user.id, user.premium_override)}
                        />
                        {user.premium_override && (
                          <Badge variant="secondary">
                            <Crown className="w-3 h-3 mr-1" />
                            Override
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => togglePremiumOverride(user.id, user.premium_override)}
                          >
                            {user.premium_override ? (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Remove Premium
                              </>
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Grant Premium
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      <BulkOperationsBar
        selectedCount={selectedUserIds.size}
        onClearSelection={() => setSelectedUserIds(new Set())}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkBan={handleBulkBan}
        onBulkExport={handleBulkExport}
      />
    </div>
  );
};