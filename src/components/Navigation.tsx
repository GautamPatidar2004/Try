
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    checkAuth();
    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems = user ? [
    { name: "Discovery", href: "/discover", badge: true },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Profile", href: "/profile" },
    { name: "Help", href: "/help" },
  ] : [
    { name: "For Hosts", href: "/for-hosts" },
    { name: "For Brands", href: "/for-brands" },
    { name: "For Creators", href: "/for-creators" },
    { name: "Pricing", href: "/pricing" },
    
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[70] glass-effect border-b border-border/50 shadow-sm pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png" 
              alt="Hostfluencer" 
              className="h-8"
            />
            <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
              <span>by</span>
              <a 
                href="https://myvoyager.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-voyager-blue text-white rounded-md font-medium hover:bg-voyager-blue/90 transition-colors"
              >
                Voyager
              </a>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative text-foreground/80 hover:text-brand-green transition-all duration-300 text-sm font-medium group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative text-foreground/80 hover:text-brand-green transition-all duration-300 text-sm font-medium group flex items-center gap-1.5"
                >
                  {item.name === 'Discovery' && <Sparkles className="h-4 w-4 text-brand-green" />}
                  {item.name}
                  {(item as any).badge && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">AI</Badge>}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-green transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                <Button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}
                  variant="outline"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white text-sm px-4 py-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-brand-green hover:bg-brand-green/90 text-white text-sm px-4 py-2"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            <Button
              variant="ghost"
              size="icon"
              className="min-w-[44px] min-h-[44px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 top-16 bg-foreground/20 z-[79]" 
              onClick={() => setIsMenuOpen(false)} 
            />
            <div className="lg:hidden border-t border-border pb-safe fixed left-0 right-0 top-16 bg-background z-[80] shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  item.href.startsWith('#') ? (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-3 min-h-[44px] text-foreground/80 hover:text-brand-green transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="px-3 py-3 min-h-[44px] text-foreground/80 hover:text-brand-green transition-colors duration-200 flex items-center gap-1.5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name === 'Discovery' && <Sparkles className="h-4 w-4 text-brand-green" />}
                      {item.name}
                      {(item as any).badge && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">AI</Badge>}
                    </Link>
                  )
                ))}
                <div className="pt-4 space-y-2">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full min-h-[44px] border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/');
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button 
                      className="w-full min-h-[44px] bg-brand-green hover:bg-brand-green/90"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
