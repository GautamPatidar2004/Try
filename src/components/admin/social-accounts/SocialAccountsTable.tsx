import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react';
import { SocialAccount } from '@/hooks/useSocialAccountsManagement';
import { formatDistanceToNow } from 'date-fns';

interface SocialAccountsTableProps {
  accounts: SocialAccount[];
  onViewDetails: (account: SocialAccount) => void;
  onVerify: (accountId: string) => void;
  onUnverify: (accountId: string) => void;
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-gray-100 text-gray-800',
  youtube: 'bg-red-100 text-red-800',
  twitter: 'bg-blue-100 text-blue-800',
};

export const SocialAccountsTable = ({ 
  accounts, 
  onViewDetails,
  onVerify,
  onUnverify,
}: SocialAccountsTableProps) => {
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influencer</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No social accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={account.influencer?.profiles?.profile_photo_url} />
                      <AvatarFallback>
                        {account.influencer?.profiles?.first_name?.[0]}
                        {account.influencer?.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {account.influencer?.profiles?.first_name} {account.influencer?.profiles?.last_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={platformColors[account.platform as keyof typeof platformColors]}
                  >
                    {account.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a 
                    href={account.profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    @{account.username}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="font-medium">
                  {formatFollowerCount(account.follower_count)}
                </TableCell>
                <TableCell>
                  {account.is_verified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(account.last_updated), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(account)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {account.is_verified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUnverify(account.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onVerify(account.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
