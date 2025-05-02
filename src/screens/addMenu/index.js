import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useMenu } from '../../context/menuContext';
import { getRestaurantIdForCurrentUser } from '../../utils/menuUtils'; // Adjust the path as needed

const AddMenuScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const {saveMenu} = useMenu();

  useEffect(() => {
    const loadRestaurantId = async () => {
      try {
        const id = await getRestaurantIdForCurrentUser();
        setRestaurantId(id);
      } catch (error) {
        Alert.alert('Error', error.message);
        navigation.goBack();
      }
    };
    
    loadRestaurantId();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Mohon izinkan akses ke galeri');
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
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const handleSubmit = async () => {
    if (!restaurantId) {
      Alert.alert('Error', 'ID Restoran tidak ditemukan');
      return;
    }
  
    await saveMenu({
      menuName,
      description,
      price,
      category,
      image,
      restaurantId,
      navigation,
    });
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'<'} Tambah Menu</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Foto Menu</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={32} color="#aaa" />
            <Text style={styles.uploadText}>Unggah Foto Menu</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nama Menu</Text>
      <TextInput
        placeholder="Contoh: Nasi Goreng"
        value={menuName}
        onChangeText={setMenuName}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Deskripsi Menu</Text>
      <TextInput
        placeholder="Deskripsi Menu Anda"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Pilih Kategori" value="" />
          <Picker.Item label="MAKANAN" value="MAKANAN" />
          <Picker.Item label="MINUMAN" value="MINUMAN" />
        </Picker>
      </View>

      <Text style={styles.label}>Harga (15.000 ditulis 15000)</Text>
      <TextInput
        placeholder="Rp."
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Simpan Menu</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Batal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9fb',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    height: 160,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#aaa',
    marginTop: 6,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 6,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3DD598',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#B0B0B0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    marginBottom: 12,
    justifyContent: 'center',
    height: 48,
  },
  picker: {
    height: 60,
    color: '#333',
  },
});

export default AddMenuScreen;