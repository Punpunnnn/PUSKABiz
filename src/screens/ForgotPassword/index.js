import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      
      options: { shouldCreateUser: false },
    });

    if (error) {
      Alert.alert('Email yang digunakan tidak terdaftar', error.message); } 
    else {
      Alert.alert('OTP Terkirim', 'Cek email kamu dan masukkan OTP.');
      navigation.navigate('ResetPassword', { email });
    }
  };

  return (
    <View style={styles.container}>
        <Image
          source={require('../../../assets/Password recovery.png')} // ubah path jika berbeda
          style={styles.image}
        />

      <Text style={styles.title}>Lupa Password?</Text>
      <Text style={styles.description}>
        Tenang, kami bantu untuk reset password anda. Masukkan email anda dan kami akan mengirimkan OTP!
      </Text>
      <Text style={styles.subbab}>Email</Text>
      <TextInput
        placeholder="Masukkan email anda"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Tombol Kirim OTP */}
      <Pressable style={styles.button} onPress={handleSendOtp}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Masuk
          </Text>
      </Pressable>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backToLogin}>Kembali ke login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

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
    color: '#800000', // warna maroon UnsiKantin
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
    paddingHorizontal: 8,
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  backToLogin: {
    color: '#800000',
    textAlign: 'center',
    marginTop: 10,
  },
});
