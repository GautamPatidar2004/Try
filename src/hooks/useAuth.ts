import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isReady: boolean;
}

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isReady: false,
  });

  useEffect(() => {
    // Set up listener FIRST (per Supabase best practices)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          isReady: true,
        });
      }
    );

    // Then get initial session (reads from localStorage, instant)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isReady: true,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
};
