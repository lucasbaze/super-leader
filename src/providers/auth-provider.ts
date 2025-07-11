'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/utils/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const supabase = createClient();

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      console.log('Auth event:', _event);
      console.log('Session:', session);
    });

    // Get initial session
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);

        return user;
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setUser(null);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return children;
}
