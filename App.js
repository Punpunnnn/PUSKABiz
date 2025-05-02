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
import AppNavigator from './src/navigation/appNavigator';

export default function App() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the restaurant ID from the authenticated user
  useEffect(() => {
    const getRestaurantData = async () => {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          // Get restaurant data for the current user
          const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single();
          
          if (restaurantError && restaurantError.code !== 'PGRST116') {
            // PGRST116 is the error code for no results
            throw restaurantError;
          }
          
          if (restaurant) {
            setRestaurantId(restaurant.id);
          }
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
        <AppNavigator />
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