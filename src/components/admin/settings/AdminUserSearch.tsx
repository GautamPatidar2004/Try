import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, UserPlus } from 'lucide-react';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { Card } from '@/components/ui/card';

interface AdminUserSearchProps {
  onUserSelected: (userId: string, userName: string) => void;
}

export const AdminUserSearch = ({ onUserSelected }: AdminUserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers } = useAdminRoles();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isSearching && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Searching...
        </p>
      )}

      {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No users found
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                    {user.user_type && (
                      <Badge variant="outline" className="mt-1">
                        {user.user_type}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => onUserSelected(user.id, `${user.first_name} ${user.last_name}`)}
                  disabled={user.isAdmin}
                  size="sm"
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Make Admin
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};