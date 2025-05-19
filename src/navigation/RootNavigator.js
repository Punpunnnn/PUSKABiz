import { useEffect } from 'react';
import { useAuth } from '../context/authContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootNavigator = () => {
  const { authUser, loading, resettingPassword } = useAuth();

  useEffect(() => {
  
  }, [loading, resettingPassword, authUser]);

  if (loading || resettingPassword) {
    return null;
  }

  if (!authUser) {
    return <AuthStack />;
  }
  return <AppStack />;
};

export default RootNavigator;
