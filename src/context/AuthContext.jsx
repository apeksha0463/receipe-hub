import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const notConfigured = {
  data: { user: null, session: null },
  error: { message: 'Sign-in is unavailable because Supabase is not configured.' },
};

/**
 * Provides the Supabase session to the app.
 * Each auth call resolves to Supabase's { data, error } shape so pages can show the error.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      loading,
      signIn: (email, password) =>
        supabase ? supabase.auth.signInWithPassword({ email, password }) : Promise.resolve(notConfigured),
      signUp: (email, password) =>
        supabase ? supabase.auth.signUp({ email, password }) : Promise.resolve(notConfigured),
      signOut: () => (supabase ? supabase.auth.signOut() : Promise.resolve({ error: null })),
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
