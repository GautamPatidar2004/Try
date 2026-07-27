import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * UI-ONLY admin check. This hook is used solely for rendering admin UI elements.
 * All admin actions MUST be verified server-side in edge functions via user_roles table
 * queries with service role. Never trust this client-side isAdmin state for authorization.
 */
export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminVerified = useRef(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!error && roles) {
        setIsAdmin(true);
        adminVerified.current = true;
      }
    } catch (error) {
      // Keep existing admin status on error if already verified
      console.error('Admin check failed:', error);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Defer admin check to avoid deadlock
        setTimeout(() => {
          checkAdminRole(session.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only reset on explicit sign out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          adminVerified.current = false;
          setLoading(false);
          return;
        }

        // Update user on any auth event
        setUser(session?.user ?? null);

        // Only check admin on fresh sign in, not on token refresh
        if (event === 'SIGNED_IN' && session?.user && !adminVerified.current) {
          setTimeout(() => {
            checkAdminRole(session.user.id).finally(() => setLoading(false));
          }, 0);
        }

        // TOKEN_REFRESHED: Keep existing admin status, just update user
        if (event === 'TOKEN_REFRESHED') {
          // No action needed - admin status persists
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, isAdmin, loading };
};
