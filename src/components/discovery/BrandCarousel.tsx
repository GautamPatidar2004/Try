import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BrandCarouselCard } from './BrandCarouselCard';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandCarouselProps {
  brands: any[];
}

export const BrandCarousel = ({ brands }: BrandCarouselProps) => {
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContactBrand = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please log in to contact this brand",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedBrand?.contact?.user_id) return;
    
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: session!.user.id,
          receiver_id: selectedBrand.contact.user_id,
          content: messageText.trim()
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: `Your message to ${selectedBrand.brand_name} has been sent.`
      });
      
      setMessageText('');
      setIsMessageDialogOpen(false);
      setSelectedBrand(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {brands.map((brand) => (
          <BrandCarouselCard
            key={brand.id}
            brand={brand}
            onClick={() => setSelectedBrand(brand)}
          />
        ))}
      </div>

      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-2xl">
          {selectedBrand && (
            <div>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    {selectedBrand.logo_url ? (
                      <img 
                        src={selectedBrand.logo_url} 
                        alt={selectedBrand.brand_name}
                        className="max-w-[80%] max-h-[80%] object-contain"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-2xl">{selectedBrand.brand_name}</DialogTitle>
                      {selectedBrand.verified && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{selectedBrand.company_name}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{selectedBrand.industry}</Badge>
                  <Badge variant="outline">Budget: {selectedBrand.budget_range}</Badge>
                </div>

                {selectedBrand.description && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedBrand.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedBrand.contact?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBrand.contact.location}</span>
                    </div>
                  )}
                  {selectedBrand.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={selectedBrand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedBrand.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleContactBrand} className="flex-1">Contact Brand</Button>
                  <Button variant="outline">Save</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedBrand?.brand_name}</DialogTitle>
            <DialogDescription>
              Introduce yourself and explain why you'd like to collaborate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Hi! I'm interested in collaborating with your brand..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsMessageDialogOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
