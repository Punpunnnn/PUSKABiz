import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderList from '../../components/orderlist';
import { useRestaurantOrders } from '../../context/orderContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Transactions = () => {
  const { orders } = useRestaurantOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('Semua');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const filterButtonRef = useRef(null);
  const [buttonLayout, setButtonLayout] = useState(null);
  const filterOptions = ['Semua', 'Selesai', 'Siap Diambil', 'Dibatalkan', 'Diproses', 'Tertunda'];

  const handleFilterSelect = (option) => {
    setFilterOption(option);
    setShowFilterOptions(false);
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const orderId = order.id ? order.id.toString().toLowerCase() : '';
    const username = order.username ? order.username.toLowerCase() : '';
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = orderId.includes(searchLower) || username.includes(searchLower);

    let matchesStatus = true;
    const status = order.status || '';
    if (filterOption === 'Selesai') matchesStatus = status === 'COMPLETED';
    else if (filterOption === 'Dibatalkan') matchesStatus = status === 'CANCELLED';
    else if (filterOption === 'Diproses') matchesStatus = status === 'COOKING';
    else if (filterOption === 'Siap Diambil') matchesStatus = status === 'READY_TO_PICKUP';
    else if (filterOption === 'Tertunda') matchesStatus = status === 'NEW';

    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Pesanan</Text>
        </View>

        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pesanan..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            ref={filterButtonRef}
            style={styles.filterButton}
            onPress={() => {
              filterButtonRef.current?.measure((fx, fy, width, height, px, py) => {
                setButtonLayout({ x: px, y: py + height, width });
                setShowFilterOptions(!showFilterOptions);
              });
            }}
          >
            <Feather name="filter" size={18} color="#333" />
            <Text style={styles.filterText}>{filterOption}</Text>
            <Feather name="chevron-down" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {showFilterOptions && buttonLayout && (
        <View
          style={[
            styles.dropdown,
            {
              top: buttonLayout.y,
              left: buttonLayout.x,
              width: buttonLayout.width,
            },
          ]}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                filterOption === option && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterSelect(option)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterOption === option && styles.selectedFilterOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Area bawah putih */}
      <View style={styles.contentContainer}>
        {orders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item, index) => item?.id?.toString() || `order-${index}`}
            renderItem={({ item }) => <OrderList order={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.orderList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada pesanan</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  safeAreaTop: {
    backgroundColor: '#8A1538',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fcfcfc',
    fontWeight: 'bold',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterText: {
    marginHorizontal: 6,
    fontSize: 15,
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 99,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedFilterOption: {
    backgroundColor: '#eee',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#333',
  },
  selectedFilterOptionText: {
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fcfcfc',
  },
  orderList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Transactions;
