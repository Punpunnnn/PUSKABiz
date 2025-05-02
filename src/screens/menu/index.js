import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable, SafeAreaView, } from 'react-native';
import { useMenu } from '../../context/menuContext';
import MenuCard from './card';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const MenuScreen = () => {
    const { menus, loading } = useMenu();
    const navigation = useNavigation();
    const [menuRatings, setMenuRatings] = useState([]);
    
    useEffect(() => {
      const fetchMenuRatings = async () => {
        const { data, error } = await supabase
          .from('avg_menu_ratings')
          .select('*');
      
        if (error) {
          console.error('Gagal fetch avg menu ratings:', error.message);
        } else {
          setMenuRatings(data);
        }
      };
      
      fetchMenuRatings();
    }, []);
    
    const ratingsLookup = useMemo(() => {
      const lookup = {};
      menuRatings.forEach((rating) => {
        lookup[rating.menus_id] = rating.avg_rating;
      });
      return lookup;
    }, [menuRatings]);
  
    const renderItem = ({ item }) => {
      const avgRating = ratingsLookup[Number(item.id)] || null; // Ambil rating berdasarkan id menu
  
      return (
        <MenuCard item={item} avgRating={avgRating} />
      );
    };
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const filteredMenus = menus.filter(menu => {
    const matchName = menu.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filter === 'Semua' || menu.category === filter;
    return matchName && matchCategory;
  });

return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.header}>Daftar Menu</Text>

    <TextInput
      placeholder="Cari menu..."
      value={search}
      onChangeText={setSearch}
      style={styles.searchInput}
    />

    {/* Filter kategori */}
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      {['Semua', 'MAKANAN', 'MINUMAN'].map((category) => (
        <Text
          key={category}
          onPress={() => setFilter(category)}
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: filter === category ? '#00AA55' : '#fff',
            color: filter === category ? '#fff' : '#000',
            marginRight: 5,
            borderWidth: 1,
            borderColor: '#ddd',
          }}
        >
          {category}
        </Text>
      ))}
    </View>

    {loading ? (
      <ActivityIndicator size="large" color="#00AA55" />
    ) : (
      <FlatList
        data={filteredMenus}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    )}

    {/* Tombol Tambah Menu */}
    <Pressable
      onPress={() => navigation.navigate('AddMenu')}
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#00AA55',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Tambah Menu</Text>
    </Pressable>
  </SafeAreaView>
);
};

const styles = {
  container: { flex: 1, backgroundColor: "#FAF9F6", padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold',paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 16,},
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  listContainer: { paddingBottom: 100 }
};

export default MenuScreen;
