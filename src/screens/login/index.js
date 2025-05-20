import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../../lib/supabase';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      Alert.alert('Login Berhasil', 'Selamat datang kembali!');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/PuskaBiz.png')} style={styles.image} />
      <Text style={styles.subtitle}>Masuk ke akun anda</Text>
      <Text style={styles.subbab}>Email</Text>
      <TextInput
        placeholder="Masukkan email anda"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <Text style={styles.subbab}>Password</Text>
      <TextInput
        placeholder="Masukkan kata sandi anda"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Text
        style={styles.passwordHint}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        Lupa Password?
      </Text>
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Masuk
        </Text>
      </Pressable>
      <Text style={styles.link}>
        Belum punya akun?{' '}
        <Text
          style={{ color: '#8A1538' }}
          onPress={() => navigation.navigate('Register')}
        >
          Buat akun
        </Text>
      </Text>
    </View>
  );
};

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
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#8A1538',
    marginBottom: 20,
  },
  subbab: {
    fontSize: 16,
    fontWeight: '500',
    paddingLeft: '10%', // Align with TextInput
    marginBottom: 8,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  link: {
    fontSize: 13,
    marginTop: 12,
    color: '#333333',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
  },
  passwordHint: {
    alignSelf: 'flex-end',
    marginRight: '10%',
    marginTop: -10,
    marginBottom: 20,
    color: '#333333',
    fontSize: 12,
  },
});

export default LoginScreen;