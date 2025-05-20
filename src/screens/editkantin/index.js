import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditKantinScreen = () => {
  const { restaurantId} = useAuth();
  const navigation = useNavigation();

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const fetchRestaurantData = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('title, subtitle, image')
      .eq('id', restaurantId)
      .single();

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle);
      setImageUrl(data.image);
    } else {
      console.error('Error fetching data:', error);
    }
  };

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

  const uploadImage = async (restaurantId) => {
    if (!image?.base64) return null;
    
    try {
      const fileName = `${restaurantId}-${Date.now()}.jpg`;
      
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

  const validateInput = ({title, subtitle, image}) => {

    if (!title.trim()) {
      return 'Nama kantin tidak boleh kosong';
    }
    if (!subtitle.trim()) {
      return 'Deskripsi kantin tidak boleh kosong';
    }
    if (!image) {
    return 'Mohon pilih gambar kantin';
  }
  return null;
};

  const handleUpdate = useCallback(async () => {
    console.log('handleUpdate called');
    const errorMessage = validateInput({ title, subtitle, image });
    console.log('Validation error:', errorMessage);
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
      return;
    }
    try {
      const newImageUrl = await uploadImage(restaurantId);
      
      const { error } = await supabase
        .from('restaurants')
        .update({
          title,
          subtitle,
          image: newImageUrl || imageUrl,
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Update error:', error);
        Alert.alert('Error', 'Gagal memperbarui kantin');
        return;
      }

      await supabase.auth.signOut();
      
      Alert.alert(
        'Sukses',
        'Kantin berhasil diperbarui! Anda akan keluar dari aplikasi.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Update process error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memperbarui kantin');
    }
  });
  
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Text style={styles.title}>Edit Informasi Kantin</Text>
      
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {(image?.uri || imageUrl) ? (
          <Image 
            source={{ uri: image?.uri || imageUrl }} 
            style={styles.image} 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Tap untuk pilih gambar</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Text style={styles.label}>Nama Kantin</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Masukkan nama kantin"
      />
      
      <Text style={styles.label}>Deskripsi</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={subtitle}
        onChangeText={setSubtitle}
        placeholder="Masukkan deskripsi kantin"
        multiline
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>
          Simpan Perubahan
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#757575',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ffb980',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditKantinScreen;