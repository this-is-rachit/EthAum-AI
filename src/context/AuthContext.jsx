import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Get role from DB (Source of Truth)
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      return data?.role;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Check Local Storage Session
        const { data: { session } } = await supabase.auth.getSession();

        if (session && mounted) {
          setUser(session.user);
          
          // OPTIMISTIC LOAD: Use metadata immediately (Fastest)
          const metaRole = session.user.user_metadata?.role;
          if (metaRole) setRole(metaRole);

          // BACKGROUND VERIFICATION: Check DB to be sure
          const dbRole = await fetchUserRole(session.user.id);
          if (dbRole && mounted) setRole(dbRole);
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session) {
          setUser(session.user);
          // Set role from metadata immediately to prevent UI flicker
          const metaRole = session.user.user_metadata?.role;
          setRole(metaRole || null); 
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = "/"; // Force hard redirect to clear state
  };

  return (
    <AuthContext.Provider value={{ user, role, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);