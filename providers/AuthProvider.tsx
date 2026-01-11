import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function upsertProfileRow(userId: string, firstName?: string | null, lastName?: string | null) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
  });
  if (error) throw error;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const userId = session?.user?.id ?? null;
  const userFirstName = session?.user?.user_metadata?.first_name ?? null;
  const userLastName = session?.user?.user_metadata?.last_name ?? null;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const ensureProfileRow = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Failed to check profile row', error.message);
        return;
      }

      if (!data) {
        try {
          await upsertProfileRow(userId, userFirstName, userLastName);
        } catch (profileError) {
          console.warn('Error', profileError);
        }
      }
    };

    ensureProfileRow();
  }, [userId, userFirstName, userLastName]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    initializing,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email, password, firstName, lastName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;

      const sessionUser = data.session?.user;
      if (sessionUser) {
        await upsertProfileRow(sessionUser.id, firstName, lastName);
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [session, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
