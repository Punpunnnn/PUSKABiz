import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    if (resettingPassword) {
      setAuthUser(null);
      setRestaurantId(null);
    }
  }, [resettingPassword]);

  useEffect(() => {
    const setup = async () => {
      if (resettingPassword) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data?.session?.user;
        setAuthUser(sessionUser);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    const handleAuthChange = async (event, session) => {
      if (resettingPassword) {
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
  useEffect(() => {
    const fetchRestaurantId = async (ownerId) => {
      console.log("Fetching restaurant ID for owner:", ownerId);
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', ownerId)
        .single();

      if (!error && data) {

        setRestaurantId(data.id);
      } else {
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
