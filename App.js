import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from './src/lib/supabase';
import { SalesProvider } from './src/context/salesContext';
import { RestaurantOrderProvider } from './src/context/orderContext';
import { NavigationContainer } from '@react-navigation/native';
import RatingProvider from './src/context/ratingContext';
import { AuthProvider } from './src/context/authContext';
import { MenuProvider } from './src/context/menuContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the restaurant ID from the authenticated user
  useEffect(() => {
    const getRestaurantData = async () => {
      try {
        setLoading(true);
  
        // Pastikan session ada terlebih dahulu
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
  
        const user = sessionData?.session?.user;
        if (!user) throw new Error('User not logged in');
  
        // Get restaurant data for the current user
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .single();
  
        if (restaurantError && restaurantError.code !== 'PGRST116') {
          throw restaurantError;
        }
  
        if (restaurant) {
          setRestaurantId(restaurant.id);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    getRestaurantData();
  }, []);
  

  if (loading) {
    // Show loading screen
    return null;
  }
  return (
    <View style={styles.container}>
      <NavigationContainer>
      <AuthProvider>
      <RestaurantOrderProvider restaurantId={restaurantId}>
      <MenuProvider>
      <SalesProvider>
      <RatingProvider>
        <RootNavigator />
      </RatingProvider>
      </SalesProvider>
      </MenuProvider>
      </RestaurantOrderProvider>
      </AuthProvider>
      </NavigationContainer>
      <StatusBar hidden={true} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});