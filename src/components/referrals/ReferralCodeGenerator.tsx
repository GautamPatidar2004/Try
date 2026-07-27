import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Plus, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReferrals } from '@/hooks/useReferrals';

export const ReferralCodeGenerator = () => {
  const { referralCode, loading, generateReferralCode } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareReferralLink = async () => {
    const referralUrl = `${import.meta.env.VITE_APP_DOMAIN || 'https://hostfluencer.com'}/auth?ref=${referralCode?.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on HostFluencer!',
          text: 'Get exclusive access to amazing travel opportunities with my referral code',
          url: referralUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(referralUrl);
    }
  };

  const referralUrl = referralCode ? `${import.meta.env.VITE_APP_DOMAIN || 'https://hostfluencer.com'}/auth?ref=${referralCode.code}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Your Referral Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode ? (
          <div className="space-y-4">
            {/* Referral Code Display */}
            <div className="space-y-2">
              <Label htmlFor="referral-code">Referral Code</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-code"
                  value={referralCode.code}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralCode.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Referral URL Display */}
            <div className="space-y-2">
              <Label htmlFor="referral-url">Referral Link</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-url"
                  value={referralUrl}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={shareReferralLink} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on HostFluencer and unlock amazing travel opportunities! Use my referral code: ${referralCode.code}`)}&url=${encodeURIComponent(referralUrl)}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Share on Twitter
              </Button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(referralCode.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Referral Code Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your personal referral code to start earning commissions
              </p>
            </div>
            
            <Button 
              onClick={generateReferralCode} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Referral Code
            </Button>
          </div>
        )}

        {copied && (
          <div className="text-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Copied to clipboard!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};