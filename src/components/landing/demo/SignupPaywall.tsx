import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SignupPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'creator' | 'host';
  context?: {
    propertyName?: string;
    creatorName?: string;
    hostName?: string;
  };
}

export const SignupPaywall = ({ isOpen, onClose, userType, context }: SignupPaywallProps) => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate(`/auth?type=${userType === 'creator' ? 'influencer' : 'host'}`);
  };

  const creatorBenefits = [
    'Submit your application',
    'Chat directly with hosts',
    'Access 100+ exclusive properties',
    'Build your creator portfolio',
    'Get verified creator badge'
  ];

  const hostBenefits = [
    '100% FREE platform access',
    'Accept or decline applications',
    'Message creators directly',
    'Manage unlimited properties',
    'Access full analytics dashboard'
  ];

  const benefits = userType === 'creator' ? creatorBenefits : hostBenefits;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">
            {userType === 'creator' ? 'Ready to Apply?' : 'Join Free to Connect'}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {userType === 'creator' ? (
              <>
                You're one step away from connecting with <span className="font-semibold">{context?.hostName}</span> and 
                securing a stay at <span className="font-semibold">{context?.propertyName}</span>.
              </>
            ) : (
              <>
                {context?.creatorName ? (
                  <>This creator is interested in collaborating. Sign up <span className="font-semibold text-primary">free</span> to respond and start the conversation.</>
                ) : (
                  <>Join <span className="font-semibold text-primary">free</span> to start accepting applications from talented creators who want to collaborate with your properties.</>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-semibold text-foreground">Sign up now to:</p>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={handleSignup}
            className="w-full"
            size="lg"
          >
            Sign Up as {userType === 'creator' ? 'Creator' : 'Host'}
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Join 10,000+ creators and hosts already on the platform
        </p>
      </DialogContent>
    </Dialog>
  );
};
