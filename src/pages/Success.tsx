import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Users, Calendar, Share2, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confettiVisible, setConfettiVisible] = useState(true);
  const [memberNumber] = useState(Math.floor(Math.random() * 1000) + 1500); // Simulated member number
  const [animateCounter, setAnimateCounter] = useState(false);

  // Get user data from navigation state
  const userData = location.state as { name?: string; email?: string } || {};

  useEffect(() => {
    // If no user data, redirect to home
    if (!userData.name && !userData.email) {
      navigate('/');
      return;
    }

    // Trigger animations
    setAnimateCounter(true);
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setConfettiVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [userData, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Hostfluencer Waitlist!',
        text: 'I just joined the exclusive Hostfluencer waitlist! Join me and be among the first to connect hosts with creators.',
        url: window.location.origin,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`Check out Hostfluencer! I just joined their exclusive waitlist: ${window.location.origin}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green via-emerald-600 to-brand-dark relative overflow-hidden">
      <SEO 
        title="Welcome to Hostfluencer" 
        description="You've successfully joined the Hostfluencer waitlist!"
        noIndex={true}
      />
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-emerald-300/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200/30 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Confetti Effect */}
      {confettiVisible && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Main Success Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-8 animate-scale-in">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome to the Club, {userData.name}! 🎉
              </h1>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-semibold text-brand-green">
                  VIP Member #{memberNumber}
                </span>
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                You're now part of an exclusive community of innovators who will shape the future of host-creator collaborations.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-brand-green/10 to-emerald-100 p-6 rounded-lg">
                <Users className="w-8 h-8 text-brand-green mx-auto mb-2" />
                <div className={`text-3xl font-bold text-brand-green mb-1 transition-all duration-1000 ${animateCounter ? 'opacity-100' : 'opacity-0'}`}>
                  {animateCounter ? memberNumber : 0}
                </div>
                <div className="text-gray-600">Your Position</div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-6 rounded-lg">
                <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-emerald-600 mb-1">Q2</div>
                <div className="text-gray-600">Expected Launch</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-brand-light p-6 rounded-lg">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">VIP</div>
                <div className="text-gray-600">Access Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mb-8 animate-fade-in">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-brand-light rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Exclusive Updates</h3>
                  <p className="text-gray-600">Get insider updates on our development progress and be the first to see new features.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Early Access</h3>
                  <p className="text-gray-600">Be among the first to use the platform when we launch in beta.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">VIP Community</h3>
                  <p className="text-gray-600">Join our exclusive Discord community for VIP members only.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Spread the Word & Earn Rewards</h2>
            <p className="text-gray-600 mb-6">
              Help us grow the community! For every friend you refer, you'll move up in the waitlist and unlock exclusive perks.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleShare}
                size="lg" 
                className="w-full md:w-auto bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90 text-white font-semibold"
              >
                <Share2 className="mr-2 w-5 h-5" />
                Share with Friends
              </Button>
              
              <div className="text-sm text-gray-500">
                Referral link will be sent to your email: {userData.email}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
              >
                Back to Home
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;
