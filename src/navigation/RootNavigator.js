import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/authContext';
import { supabase } from '../lib/supabase';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootNavigator = () => {
  const { authUser, loading, resettingPassword } = useAuth();
  const [checkingOwner, setCheckingOwner] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      if (!authUser) {
        setCheckingOwner(false);
        return;
      }

      const { data: ownerData, error } = await supabase
        .from('owner')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (error || !ownerData) {
        Alert.alert('Akses Ditolak', 'Akun ini bukan pemilik kantin.');
        await supabase.auth.signOut();
        setIsOwner(false);
      } else {
        setIsOwner(true);
      }

      setCheckingOwner(false);
    };

    checkOwner();
  }, [authUser]);

  if (loading || resettingPassword || checkingOwner) {
    return null;
  }

  if (!authUser || !isOwner) {
    return <AuthStack />;
  }

  return <AppStack />;
};

export default RootNavigator;
