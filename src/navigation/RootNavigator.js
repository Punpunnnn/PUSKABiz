import { useEffect } from 'react';
import { useAuth } from '../context/authContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
// import SplashScreen from '../components/SplashScreen'; // opsional, bisa tambahkan ini jika perlu

const RootNavigator = () => {
  const { authUser, loading, resettingPassword } = useAuth();

  useEffect(() => {
    console.log(`RootNavigator state: loading=${loading}, resetting=${resettingPassword}, authUser=${authUser ? 'exists' : 'none'}`);
  }, [loading, resettingPassword, authUser]);

  if (loading || resettingPassword) {
    console.log('Loading or resetting password, hold navigation...');
    return null; // atau <SplashScreen />
  }

  if (!authUser) {
    console.log('No authenticated user, showing AuthStack');
    return <AuthStack />;
  }

  console.log('Authenticated user found, showing AppStack');
  return <AppStack />;
};

export default RootNavigator;
