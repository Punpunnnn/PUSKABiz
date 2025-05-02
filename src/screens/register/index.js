import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  ActivityIndicator, TouchableOpacity, Alert,
  StyleSheet, ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Izinkan akses galeri');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleNext = () => {
    if (!username || !email || !password || password !== confirmPassword) {
      Alert.alert('Error', 'Pastikan semua data terisi dan password cocok');
      return;
    }
    setStep(2);
  };

  // Upload image to Supabase
  const uploadImage = async (userId) => {
    if (!image?.base64) return null;
    
    try {
      const fileName = `${userId}-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('restaurant-images')
        .upload(fileName, decode(image.base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(fileName);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const validateRegisterInput = ({ username, email, password, confirmPassword, restaurantName, image }) => {
    if (!username.trim() || !email.trim() || !password.trim() || !restaurantName.trim()) {
      return 'Mohon isi semua kolom yang wajib';
    }
    if (!email.includes('@')) {
      return 'Format email tidak valid';
    }
    if (password.length < 6) {
      return 'Password minimal 6 karakter';
    }
    if (password !== confirmPassword) {
      return 'Password tidak cocok';
    }
    if (!image) {
      return 'Mohon pilih gambar kantin';
    }
    return null;
  };
  
  // Handle registration
  const handleRegister = useCallback(async () => {
    const errorMsg = validateRegisterInput({ username, email, password, confirmPassword, restaurantName, image });
  if (errorMsg) {
    Alert.alert('Error', errorMsg);
    return;
  }

    try {
      setIsLoading(true);
      
      // 1. Buat akun pengguna
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
  
      if (authError) throw new Error(authError.message);
      
      const userId = authData.user.id;
      const { error: ownerError } = await supabase
        .from('owner')
        .insert([{ id: userId, username }]);
  
      if (ownerError) throw new Error(ownerError.message);
  
      // 3. Upload gambar
      const imageUrl = await uploadImage(userId);
      if (!imageUrl) throw new Error('Gagal mengunggah gambar');
  
      // 4. Tambah data restoran
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          owner_id: userId,
          title: restaurantName,
          subtitle: description,
          image: imageUrl,
        }]);
  
      if (restaurantError) throw new Error(restaurantError.message);
  
      // 5. Notifikasi sukses
      Alert.alert(
        'Berhasil!',
        'Akun berhasil dibuat. Silakan cek email untuk verifikasi.',
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (err) {
      console.error('Unhandled Error:', err);
      showError(err.message || "Terjadi Kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [username, email, password, confirmPassword, restaurantName, image, description, navigation]);
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../../assets/PuskaBiz.png')} style={styles.image} />
      <Text style={styles.subtitle}>Buat akun baru</Text>

      {step === 1 ? (
        <>
          <Text style={styles.subbab}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="masukkan username anda" autoCapitalize="none" />
          
          <Text style={styles.subbab}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="masukkan email anda" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.subbab}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="masukkan password" secureTextEntry />

          <Text style={styles.subbab}>Konfirmasi Password</Text>
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="ulangi password" secureTextEntry />

          <Pressable style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Lanjut</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.subbab}>Nama Kantin</Text>
          <TextInput style={styles.input} value={restaurantName} onChangeText={setRestaurantName} placeholder="masukkan nama kantin" />

          <Text style={styles.subbab}>Deskripsi</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="deskripsikan kantin anda"
            multiline
          />

          <Text style={styles.subbab}>Gambar Kantin</Text>
          <TouchableOpacity style={[styles.input, { justifyContent: 'center', alignItems: 'center', height: 150, }]} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            ) : (
              <Text style={{ color: '#888' }}>Ketuk untuk pilih gambar</Text>
            )}
          </TouchableOpacity>

          <Pressable style={styles.button} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Daftar Akun</Text>}
          </Pressable>

          <Text style={styles.link}>
            Sudah punya akun?{' '}
            <Text style={{ color: '#8A1538' }} onPress={() => navigation.navigate('Login')}>
              Masuk
            </Text>
          </Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FCFCFC',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: -100,
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
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    fontSize: 13,
    marginTop: 12,
    color: '#333333',
    textAlign: 'center',
  },
});

export default RegisterScreen;