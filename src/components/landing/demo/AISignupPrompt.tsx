import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, Users, Building, Zap } from "lucide-react";

type SignupContext = 'search' | 'view_creator' | 'view_property' | 'view_brand' | 'continue_chat';

interface AISignupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  userQuery?: string;
  context?: SignupContext;
}

const getContextMessage = (context?: SignupContext, userQuery?: string): string => {
  switch (context) {
    case 'view_creator':
      return "To view this creator's full profile and connect with them, sign up for free access.";
    case 'view_property':
      return "To see full property details and apply for collaborations, sign up for free access.";
    case 'view_brand':
      return "To view brand partnership details and apply to campaigns, sign up for free access.";
    case 'continue_chat':
      return "To continue chatting with Hosty and get personalized recommendations, sign up for free access.";
    case 'search':
    default:
      return userQuery 
        ? `To answer "${userQuery.slice(0, 50)}${userQuery.length > 50 ? '...' : ''}", sign up for free access.`
        : "Create a free account to access your personal AI discovery assistant.";
  }
};

export const AISignupPrompt = ({ isOpen, onClose, userQuery, context }: AISignupPromptProps) => {
  const navigate = useNavigate();

  const handleSignup = (type: 'influencer' | 'host') => {
    navigate(`/auth?type=${type}`);
  };

  const benefits = [
    { icon: Search, text: "Search thousands of creators, properties & brands" },
    { icon: Users, text: "Get personalized AI-powered match recommendations" },
    { icon: Building, text: "Access detailed profiles and analytics" },
    { icon: Zap, text: "Instant responses to any discovery question" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Unlock Hosty - Your AI Assistant</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getContextMessage(context, userQuery)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <benefit.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleSignup('influencer')}
              className="w-full"
            >
              I'm a Creator
            </Button>
            <Button 
              onClick={() => handleSignup('host')}
              variant="outline"
              className="w-full"
            >
              I'm a Host
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button 
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
