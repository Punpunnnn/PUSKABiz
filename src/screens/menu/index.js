import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable} from 'react-native';
import { useMenu } from '../../context/menuContext';
import MenuCard from './card';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MenuScreen = () => {
  const { menus, loading } = useMenu();
  const navigation = useNavigation();
  const [menuRatings, setMenuRatings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');

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

  const filteredMenus = menus.filter(menu => {
    const matchName = menu.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filter === 'Semua' || menu.category === filter;
    return matchName && matchCategory;
  });

  const renderItem = ({ item }) => {
    const avgRating = ratingsLookup[Number(item.id)] || null;
    return <MenuCard item={item} avgRating={avgRating} />;
  };

  return (
    <View style={styles.container}>
    <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
      <Text style={styles.header}>Daftar Menu</Text>

      <View style={styles.inputSection}>
    <TextInput
      placeholder="Cari menu..."
      value={search}
      onChangeText={setSearch}
      style={styles.searchInput}
      placeholderTextColor="#888"
    />

    <View style={styles.categoryContainer}>
      {['Semua', 'MAKANAN', 'MINUMAN'].map((category) => (
        <Text
          key={category}
          onPress={() => setFilter(category)}
          style={[
            styles.categoryText,
            filter === category && styles.activeCategory
          ]}
        >
          {category}
        </Text>
      ))}
    </View>
    </View>
      </SafeAreaView>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#800000" />
          </View>
        ) : (
        <FlatList
          data={filteredMenus}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Pressable
        onPress={() => navigation.navigate('MenuForm')}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Tambah Menu</Text>
      </Pressable>

    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  safeAreaTop: {
  backgroundColor: '#8A1538',
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  paddingHorizontal: 20,
  paddingBottom: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fcfcfc',
    paddingBottom: 10,
  },
  inputSection: {
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    color: '#000',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fcfcfc',
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeCategory: {
    backgroundColor: '#5DA574',
    color: '#fcfcfc',
    borderColor: '#5DA574',
  },
  listContainer: {
    paddingBottom: 100
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#5DA574',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5
  },
  addButtonText: {
    color: '#fcfcfc',
    fontWeight: 'bold',
    fontSize: 14
  }
};

export default MenuScreen;
