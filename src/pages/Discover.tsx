import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import DiscoveryChat from '@/components/discovery/DiscoveryChat';
import DiscoverySidebar from '@/components/discovery/DiscoverySidebar';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useDiscoveryChat } from '@/hooks/useDiscoveryChat';
import { SEO } from '@/components/SEO';

const Discover = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'influencer' | 'host' | null>(null);
  const {
    messages,
    streamingMessage,
    isLoading,
    isLoadingHistory,
    conversationId,
    sendMessage,
    clearChat,
    createNewConversation,
    loadConversation,
  } = useDiscoveryChat(userId, userType);

  useEffect(() => {
    checkUser();
  }, []);

  // Session validator to prevent cross-user data leakage
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          // Re-validate that the current userId matches the session
          if (session?.user?.id !== userId) {
            await checkUser();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [userId, navigate]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!profile?.user_type) {
        navigate('/profile');
        return;
      }

      setUserId(user.id);
      setUserType(profile.user_type as 'influencer' | 'host');
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile First</h2>
          <p className="text-muted-foreground mb-6">
            You need to complete your profile before discovering matches
          </p>
          <Button onClick={() => navigate('/profile')}>
            Go to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SEO 
        title="AI Discovery" 
        description="Discover personalized matches with AI-powered recommendations."
        noIndex={true}
      />
      <Navigation />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-[calc(100vh-64px)] w-full mt-16">
          {userId && (
            <DiscoverySidebar 
              userId={userId}
              currentConversationId={conversationId}
              onNewChat={createNewConversation}
              onSelectConversation={loadConversation}
            />
          )}
          
          <main className="flex-1 flex flex-col">
            {/* Discovery Sub-Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-4 px-4 py-4">
                <SidebarTrigger />
                <Sparkles className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">AI Discovery</h1>
                  <p className="text-sm text-muted-foreground">Chat with Hosty • Get Personalized Matches</p>
                </div>
                <Button 
                  onClick={createNewConversation}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              </div>
            </header>

            {/* Main Content - Chat Interface */}
            <div className="flex-1">
              <DiscoveryChat
                messages={messages}
                streamingMessage={streamingMessage}
                isLoading={isLoading}
                isLoadingHistory={isLoadingHistory}
                sendMessage={sendMessage}
                clearChat={clearChat}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Discover;
