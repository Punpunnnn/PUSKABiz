// menuUtils.js
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase'; // Adjust path as needed

// Shared functions for menu operations
export const uploadMenuImage = async (image) => {
  if (!image?.base64) return null;
  
  try {
    // Generate a unique filename
    const fileExt = 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, decode(image.base64), {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error('Gagal mengunggah gambar');
    }
    
    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);
    
    return urlData?.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export const getRestaurantIdForCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Anda perlu login terlebih dahulu');
    }
    
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    
    if (error || !restaurant) {
      console.error("Error fetching restaurant:", error);
      throw new Error('Gagal memuat data restoran');
    }
    
    return restaurant.id;
  } catch (error) {
    console.error("Error in getRestaurantIdForCurrentUser:", error);
    throw error;
  }
};

export const verifyRestaurantOwnership = async (restaurantId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Anda perlu login terlebih dahulu');
    }
    
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('owner_id')
      .eq('id', restaurantId)
      .single();
    
    if (error || !restaurant) {
      throw new Error('Gagal memverifikasi kepemilikan restoran');
    }
    
    if (restaurant.owner_id !== user.id) {
      throw new Error('Anda tidak memiliki akses untuk mengelola menu di restoran ini');
    }
    
    return true;
  } catch (error) {
    console.error('Error in verifyRestaurantOwnership:', error);
    throw error;
  }
};