import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { format } from "date-fns";

interface ReferralsTrackingProps {
  referrals: any[];
}

export const ReferralsTracking = ({ referrals }: ReferralsTrackingProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredReferrals = referrals.filter(referral => {
    const ambassadorName = referral.ambassador?.profiles 
      ? `${referral.ambassador.profiles.first_name} ${referral.ambassador.profiles.last_name}` 
      : '';
    const referredName = referral.referred_user 
      ? `${referral.referred_user.first_name} ${referral.referred_user.last_name}` 
      : '';
    
    const matchesSearch = ambassadorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (referral.ambassador?.referral_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === null || referral.conversion_stage === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case 'subscription':
        return <Badge className="bg-green-500">Subscribed</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'listing':
        return <Badge className="bg-blue-500">Listed</Badge>;
      case 'signup':
        return <Badge variant="secondary">Signed Up</Badge>;
      case 'clicked':
        return <Badge variant="outline">Clicked</Badge>;
      default:
        return <Badge variant="secondary">{stage || 'Unknown'}</Badge>;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'creator':
        return <Badge variant="outline" className="text-purple-600 border-purple-300">Creator</Badge>;
      case 'property_owner':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Property Owner</Badge>;
      case 'brand':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Brand</Badge>;
      case 'restaurant':
        return <Badge variant="outline" className="text-red-600 border-red-300">Restaurant</Badge>;
      default:
        return <Badge variant="outline">{type || 'Unknown'}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ambassador, code, or referred user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              onClick={() => setFilterStatus(null)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'signup' ? "default" : "outline"}
              onClick={() => setFilterStatus('signup')}
              size="sm"
            >
              Signed Up
            </Button>
            <Button
              variant={filterStatus === 'subscription' ? "default" : "outline"}
              onClick={() => setFilterStatus('subscription')}
              size="sm"
            >
              Subscribed
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ambassador</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Sign Up Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No referrals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {referral.ambassador?.profiles 
                        ? `${referral.ambassador.profiles.first_name} ${referral.ambassador.profiles.last_name}` 
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {referral.ambassador?.referral_code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {referral.referred_user 
                        ? `${referral.referred_user.first_name} ${referral.referred_user.last_name}` 
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(referral.referral_type)}
                    </TableCell>
                    <TableCell>
                      {getStageBadge(referral.conversion_stage)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${(Number(referral.total_earned) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {referral.signup_date 
                        ? format(new Date(referral.signup_date), 'MMM d, yyyy')
                        : referral.created_at 
                          ? format(new Date(referral.created_at), 'MMM d, yyyy')
                          : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
