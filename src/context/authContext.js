import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // ganti sesuai struktur proyekmu

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      setUser(user);
      if (user) fetchRestaurantId(user.id);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user || null;
      setUser(user);
      if (user) fetchRestaurantId(user.id);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchRestaurantId = async (ownerId) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', ownerId)
      .single();

    if (!error && data) {
      setRestaurantId(data.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, restaurantId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
