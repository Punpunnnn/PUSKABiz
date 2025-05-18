import { createContext, useContext, useEffect, useState} from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './authContext';
import { uploadMenuImage, verifyRestaurantOwnership } from '../utils/menuUtils'; // Adjust the path as needed

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);
export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const { restaurantId } = useAuth(); // Get restaurantId from AuthContext
  

  const fetchMenus = async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('menus')
      .select('id, name, price, category, is_available, image, created_at')
      .eq('restaurants_id', restaurantId) // Use restaurantId from AuthContext
      .order('created_at', { ascending: false });
  
    if (error) {
      console.log('Error fetching menus:', error.message);
    } else {
    setMenus(data);
    }
    setLoading(false);
  };
  
  const toggleAvailability = async (id, is_available) => {
    await supabase
      .from('menus')
      .update({ is_available })
      .eq('id', id);
    fetchMenus();
  };

  const validateform = ({ menuName, category, price, description }) => {
    if (!menuName?.trim()) return 'Nama menu tidak boleh kosong';
    if (menuName.length > 100) return 'Nama menu maksimal 100 karakter';
    if (/[\u{1F600}-\u{1F6FF}]/u.test(menuName)) return 'Nama tidak boleh mengandung emoji';

    if (!category || category === 'DEFAULT') return 'Pilih kategori menu';

    const cleanPrice = price?.trim();
    if (!cleanPrice) return 'Harga tidak boleh kosong';
    if (!/^\d+$/.test(cleanPrice)) return 'Harga harus berupa angka tanpa titik atau koma';

    const numericPrice = parseInt(cleanPrice);
    if (numericPrice < 1000) return 'Harga minimal 1000';
    if (numericPrice > 1000000) return 'Harga terlalu besar';

    if (description) {
    if (description.length > 150) return 'Deskripsi maksimal 150 karakter';
    if (/[<>]/.test(description)) return 'Deskripsi tidak boleh mengandung karakter ilegal';
    if (/[\u{1F600}-\u{1F6FF}]/u.test(description)) return 'deskripsi tidak boleh mengandung emoji';

  }
    return null;
  };

  const saveMenu = async (params) => {
    const { menuName, description, price, category, image, restaurantId, navigation, menuId = null, currentImageUrl = '' } = params;
    const errorMsg = validateform({ menuName, category, price, description });
    if (errorMsg) return Alert.alert('Error', errorMsg);
  
    try {setMenus
      setLoading(true);
      await verifyRestaurantOwnership(restaurantId);
  
      const imageUrl = image ? await uploadMenuImage(image) : currentImageUrl;
      if (image && !imageUrl) throw new Error('Gagal mendapatkan URL gambar');
  
      const menuData = {
        name: menuName,
        description: description || null,
        price: parseInt(price),
        category,
        image: imageUrl,
        restaurants_id: restaurantId,
        is_available: true,
      };
  
      const response = menuId
        ? await supabase.from('menus').update(menuData).eq('id', menuId)
        : await supabase.from('menus').insert([menuData]).select();
  
      const { error, data } = response;
      if (error) throw new Error(`${menuId ? 'Update' : 'Tambah'} menu gagal: ${error.message}`);
  
      setMenus((prev) => (menuId ? prev : [data[0], ...prev]));
      if (menuId) fetchMenus();
  
      Alert.alert('Sukses', `Menu berhasil ${menuId ? 'diperbarui' : 'ditambahkan'}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error in saveMenu:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat menyimpan menu');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteMenu = async (id) => {
    setLoading(true);
    await supabase.from('menus').delete().eq('id', id);
    fetchMenus();
    setLoading(false);
  };  

  useEffect(() => {
    fetchMenus();
  }, [restaurantId]);

  return (
    <MenuContext.Provider value={{ menus, loading, fetchMenus, toggleAvailability,saveMenu, deleteMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
