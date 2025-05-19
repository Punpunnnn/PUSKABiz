import { useState } from 'react';
import { View, TextInput, Pressable, Alert, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/authContext';

const ChangePasswordScreen = () => {
  const route = useRoute();
  const {setResettingPassword } = useAuth();
  const navigation = useNavigation();
  const { currentFullName } = route.params || {};
  const [fullName, setFullName] = useState(currentFullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const showError = (message) => {
    Alert.alert('Error', message || 'Terjadi kesalahan.');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      return showError('Password baru dan konfirmasi tidak cocok.');
    }
    if (newPassword.length < 6) {
      return showError('Password baru minimal 6 karakter.');
    }
  
    try {
    
    setResettingPassword(true);

    const { error: updateError } = await supabase.auth.updateUser({password: newPassword,});

    if (updateError) return showError(updateError.message);

    const { error: profileError } = await supabase
      .from('owner')
      .update({ username: fullName })
      .eq('id', (await supabase.auth.getUser()).data.user.id);

    if (profileError) {
      setResettingPassword(false);
      return showError(profileError.message);
    }

     await supabase.auth.signOut({ scope: 'global' }); 

       
      Alert.alert('Berhasil', 'Password berhasil diubah. Silakan login kembali.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            setTimeout(() => setResettingPassword(false), 1000);
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      showError('Terjadi kesalahan saat mengganti password.');
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Password recovery.png')}
        style={styles.image}
      />

      <Text style={styles.title}>Ganti Password</Text>
      <Text style={styles.description}>
        Pastikan password baru mudah diingat dan aman ya!
      </Text>

      <Text style={styles.subbab}>Username</Text>
      <TextInput
        placeholder="Masukkan nama lengkap"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <Text style={styles.subbab}>Password Baru</Text>
      <TextInput
        placeholder="Masukkan password baru"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <Text style={styles.subbab}>Konfirmasi Password Baru</Text>
      <TextInput
        placeholder="Konfirmasi password baru"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleChangePassword}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Simpan Perubahan
        </Text>
      </Pressable>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FCFCFC',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: -120,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#800000',
  },
  description: {
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  subbab: {
    fontSize: 16,
    fontWeight: '500',
    paddingLeft: '10%',
    marginBottom: 8,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
});
