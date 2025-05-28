// MenuFormScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../lib/supabase'; // Sesuaikan path
import { useMenu } from '../../context/menuContext';
import {
  verifyRestaurantOwnership,
  getRestaurantIdForCurrentUser,
} from '../../utils/menuUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const MenuFormScreen = ({ route, navigation }) => {
  const menuId = route?.params?.menuId || null;
  const isEditMode = !!menuId;

  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [restaurantId, setRestaurantId] = useState(null);
  const { saveMenu } = useMenu();


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

  useEffect(() => {
    if (!isEditMode) return;

    const fetchMenuDetails = async () => {
      try {
        const { data: menu, error } = await supabase
          .from('menus')
          .select('*, restaurants:restaurants_id(id, owner_id)')
          .eq('id', menuId)
          .single();

        if (error) throw error;

        if (!menu) {
          Alert.alert('Error', 'Menu tidak ditemukan');
          navigation.goBack();
          return;
        }
        await verifyRestaurantOwnership(menu.restaurants_id);

        setMenuName(menu.name || '');
        setDescription(menu.description || '');
        setPrice(menu.price ? String(menu.price) : '');
        setCategory(menu.category || '');
        setCurrentImageUrl(menu.image);
        setRestaurantId(menu.restaurants_id);
      } catch (error) {
        console.error('Error fetching menu details:', error);
        Alert.alert('Error', error.message || 'Gagal memuat data menu');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

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

  const OnSaveMenu = async () => {
    setLoading(true);
    try {
      await saveMenu({
        menuName,
        description,
        price,
        category,
        image,
        restaurantId,
        navigation,
        menuId,
        currentImageUrl,
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal menyimpan menu');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3DD598" />
        <Text style={styles.loadingText}>
          Memuat data menu...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.content}>
      <Ionicons
        name="arrow-back-outline"
        size={24}
        color="black"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.backText}>
        {isEditMode ? 'Edit Menu' : 'Tambah Menu'}
      </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FORM MULAI */}
        <Text style={styles.label}>Foto Menu</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
          ) : currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} style={styles.uploadedImage} />
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
            <Picker.Item label="Pilih Kategori" value="DEFAULT" />
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
      </ScrollView>

      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={OnSaveMenu}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fcfcfc" />
          ) : (
            <Text style={styles.submitText}>
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Menu'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  content: {
    padding: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    color: '#000',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadText: {
    color: '#aaa',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3DD598',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  footerButtons: {
  padding: 16,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: '#ddd',
},
submitButton: {
  backgroundColor: '#3DD598',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 10,
},
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
  backgroundColor: '#eee',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
},
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});



export default MenuFormScreen;