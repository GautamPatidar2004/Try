
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogIn, LogOut, UserCircle, HelpCircle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import HelpSupportModal from "@/components/support/HelpSupportModal";
import { LevelBadge } from "./gamification/LevelBadge";
import { VerificationBadge } from "./badges/VerificationBadge";

const UserMenuDropdown = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile data including photo and user type
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, profile_photo_url, user_type, verified')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_photo_url, user_type, verified')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    const first = profile?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center border border-gray-300 rounded-full p-1 hover:shadow-md transition-shadow cursor-pointer">
        <Menu className="w-4 h-4 mx-2" />
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center border border-gray-300 rounded-full p-1 hover:shadow-md transition-shadow cursor-pointer">
            <Menu className="w-4 h-4 mx-2" />
            {user && profile ? (
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="bg-brand-green text-white text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white">
          {user ? (
            <>
              <div className="px-2 py-3 space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  {profile?.verified && <VerificationBadge size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <LevelBadge userId={user.id} size="sm" />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              {profile?.user_type === 'influencer' && (
                <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscription
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsHelpModalOpen(true)} className="cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={handleSignIn} className="cursor-pointer">
                <LogIn className="w-4 h-4 mr-2" />
                Log in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignIn} className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Sign up
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsHelpModalOpen(true)} className="cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

export default UserMenuDropdown;
