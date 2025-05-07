import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Reset auth saat flow reset password aktif
  useEffect(() => {
    if (resettingPassword) {
      console.log("Password reset flow active - clearing auth state");
      setAuthUser(null);
      setRestaurantId(null);
    }
  }, [resettingPassword]);

  // Ambil session awal + pasang listener perubahan auth
  useEffect(() => {
    const setup = async () => {
      if (resettingPassword) {
        console.log("Skipping session setup - resetting password");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data?.session?.user;
        console.log("Fetched session user:", sessionUser);
        setAuthUser(sessionUser);
      } catch (error) {
        console.error("Error fetching session:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const handleAuthChange = async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (resettingPassword) {
        console.log("Ignoring auth state change during password reset");
        return;
      }

      const sessionUser = session?.user || null;
      setAuthUser(sessionUser);
    };

    setup();
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [resettingPassword]);

  // Fetch restaurantId ketika authUser berubah
  useEffect(() => {
    const fetchRestaurantId = async (ownerId) => {
      console.log("Fetching restaurant ID for owner:", ownerId);
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', ownerId)
        .single();

      if (!error && data) {
        console.log("Restaurant ID fetched:", data.id);
        setRestaurantId(data.id);
      } else {
        console.log("No restaurant found for this owner");
        setRestaurantId(null);
      }
    };

    if (authUser?.id) {
      fetchRestaurantId(authUser.id);
    } else {
      setRestaurantId(null);
    }
  }, [authUser]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        restaurantId,
        loading,
        resettingPassword,
        setResettingPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
