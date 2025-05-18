import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SalesProvider } from './src/context/salesContext';
import { RestaurantOrderProvider } from './src/context/orderContext';
import { NavigationContainer } from '@react-navigation/native';
import RatingProvider from './src/context/ratingContext';
import { AuthProvider } from './src/context/authContext';
import { MenuProvider } from './src/context/menuContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {

  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <AuthProvider>
      <RestaurantOrderProvider>
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
    </SafeAreaProvider>
  );
}