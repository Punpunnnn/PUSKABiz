import React from 'react';
import { View, Text, Image, TouchableOpacity, Switch, Alert } from 'react-native';
import { useMenu } from '../../context/menuContext';
import { useNavigation } from '@react-navigation/native';

const MenuCard = ({ item, avgRating }) => {
  const navigation = useNavigation();
  const { toggleAvailability, deleteMenu } = useMenu();

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.rating}>
        ⭐ {avgRating !== null ? avgRating.toFixed(1) : 'Belum ada rating'}
      </Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>Tersedia</Text>
        <Switch
          value={item.is_available}
          onValueChange={(val) => toggleAvailability(item.id, val)}
        />
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => {
            // Show styled alert before deleting
            Alert.alert(
              'Konfirmasi',
              'Apakah Anda yakin ingin menghapus menu ini?',
              [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus', onPress: () => deleteMenu(item.id), style: 'destructive' }
              ]
            );
          }}
          style={styles.deleteBtn}
        >
          <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // Navigate to the edit menu screen with the menu ID
            navigation.navigate('EditMenu', { menuId: item.id });
          }}
          style={styles.editBtn}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 6,
    padding: 10,
    width: '47%',
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  image: { width: '100%', height: 100, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  rating: { fontSize: 14, color: '#666' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  statusText: { fontSize: 14 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    padding: 6,
    borderRadius: 6,
    width: '45%'
  },
  editBtn: {
    backgroundColor: '#4caf50',
    padding: 6,
    borderRadius: 6,
    width: '45%'
  },
  btnText: { color: 'white', textAlign: 'center' }
};

export default MenuCard;
