
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Mail, ArrowRight, Loader2, Users, TrendingUp } from "lucide-react";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useNavigate } from "react-router-dom";

const PreSignupForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { addToWaitlist, checkEmailExists, isLoading } = useWaitlist();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !userType || !acceptedTerms) return;

    const emailExists = await checkEmailExists(email.toLowerCase().trim());
    if (emailExists) {
      navigate('/success', { 
        state: { 
          name: name.trim(), 
          email: email.toLowerCase().trim(),
          alreadySignedUp: true
        } 
      });
      return;
    }

    const success = await addToWaitlist({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      user_type: userType as 'host' | 'creator',
    });

    if (success) {
      navigate('/success', { 
        state: { 
          name: name.trim(), 
          email: email.toLowerCase().trim() 
        } 
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-brand-green via-emerald-600 to-brand-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start
            <br />
            <span className="text-green-200">Your Journey?</span>
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Join over 50+ hosts and creators who are already collaborating and creating amazing content together.
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex justify-center items-center space-x-8 mb-12 text-green-100">
          <div className="text-center">
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm">Properties</div>
          </div>
          <div className="w-px h-8 bg-green-400"></div>
          <div className="text-center">
            <div className="text-2xl font-bold">100+</div>
            <div className="text-sm">Creators</div>
          </div>
          <div className="w-px h-8 bg-green-400"></div>
          <div className="text-center">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm">Content Pieces</div>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center space-x-4 mb-4">
                  <Button
                    type="button"
                    size="lg"
                    className="bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90"
                    onClick={() => navigate('/marketplace')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                    onClick={() => navigate('/auth')}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Login/Signup
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or stay updated</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg border-brand-green/30 focus:border-brand-green"
                  required
                  disabled={isLoading}
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg border-brand-green/30 focus:border-brand-green"
                  required
                  disabled={isLoading}
                />
                <Select value={userType} onValueChange={setUserType} required disabled={isLoading}>
                  <SelectTrigger className="h-12 text-lg border-brand-green/30 focus:border-brand-green">
                    <SelectValue placeholder="I am a..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="creator">Content Creator</SelectItem>
                    <SelectItem value="host">Property Host</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  I agree to Hostfluencer's{" "}
                  <a 
                    href="/terms-of-service" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-green hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and acknowledge that I have read and understood the platform's policies and guidelines.
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-lg bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90 text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Get Updates & Early Access
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Stay updated on new features and platform updates. Unsubscribe anytime.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PreSignupForm;
