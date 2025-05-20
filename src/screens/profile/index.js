import { useEffect, useState } from 'react';
import { View, Text, Image, Switch, Alert, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/authContext';
import { useRatingContext } from '../../context/ratingContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const {restaurantId } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const { getRestaurantRatings } = useRatingContext();
  const [serviceRating, setServiceRating] = useState(null);
  const [totalUser, setTotalUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRatings = async () => {
      if (!restaurantId) return;
      const { summary } = await getRestaurantRatings(restaurantId);
      setServiceRating(summary.avgServiceRating);
      setTotalUser(summary.totalReviews);
    };

    fetchRatings();
  }, [restaurantId]);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurantId) return;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      setRestaurant(data);
      setIsOpen(data?.is_open);
    };

    fetchRestaurantData();
  }, [restaurantId]);

  const handleToggle = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);

    const { error } = await supabase
      .from('restaurants')
      .update({ is_open: newStatus })
      .eq('id', restaurantId);

    if (error) {
      Alert.alert('Gagal mengubah status');
      setIsOpen(!newStatus);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
      </SafeAreaView>

      {restaurant?.image && (
        <Image
          source={{ uri: restaurant.image}}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.profileSection}>
         <View style={styles.row}>
            <Text style={styles.restaurantName}>{restaurant?.title || 'Nama Kantin'}</Text>

            {serviceRating !== null && totalUser !== null && (
                <Pressable style={styles.ratingBox}>
                <View style={styles.ratingTop}>
                    <Ionicons name="star" size={16} color="white" />
                    <Text style={styles.ratingText}>
                    {serviceRating.toFixed(1)}
                    </Text>
                </View>
                <Text style={styles.reviewText}>
                    {totalUser > 10
                    ? "+10 Ulasan"
                    : `${totalUser} Ulasan${totalUser > 1 ? "s" : ""}`}
                </Text>
                </Pressable>
            )}
            </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Tutup</Text>
          <Switch 
          value={isOpen}
          onValueChange={handleToggle}
          trackColor={{ false: '#ccc', true: '#5DA574' }}
          thumbColor={isOpen ? '#fff' : '#f4f3f4'}
           />
          <Text style={styles.toggleLabel}>Buka</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')} style={styles.greenButton}>
          <Text style={styles.buttonText}>Edit Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EditKantin')} style={styles.greenButton}>
          <Text style={styles.buttonText}>Edit Kantin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // === Global Layout ===
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  safeAreaTop: {
    backgroundColor: '#8A1538',
  },

  // === Header ===
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fcfcfc',
  },

  // === Image ===
  image: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: 8,
    marginBottom: 10,
  },

  // === Profile Section ===
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },

  // === Row and Text ===
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // === Buttons ===
  greenButton: {
    backgroundColor: '#5DA574',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  grayButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // === Rating Box ===
  ratingBox: {
    backgroundColor: '#8A1538',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 10,
    color: 'white',
  },
});

