import React, { useState} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import OrderList from '../../components/orderlist';
import { useRestaurantOrders } from '../../context/orderContext';

const Transactions = () => {

    const { orders } = useRestaurantOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('Semua');
    const [showFilterOptions, setShowFilterOptions] = useState(false);

    const filterOptions = ['Semua', 'Selesai', 'Siap Diambil', 'Dibatalkan', 'Diproses','Tertunda'];

    const handleFilterSelect = (option) => {
        setFilterOption(option);
        setShowFilterOptions(false);
    };

    const filteredOrders = orders.filter(order => {
        // Guard against undefined or invalid orders
        if (!order) return false;
        
        // Search filter with null checks
        const orderId = order.id ? order.id.toString().toLowerCase() : '';
        const username = order.username ? order.username.toLowerCase() : '';
        const searchLower = searchQuery.toLowerCase();
        
        const matchesSearch = 
            orderId.includes(searchLower) ||
            username.includes(searchLower);

        // Status filter with null check
        let matchesStatus = true;
        const status = order.status || '';
        
        if (filterOption === 'Selesai') {
            matchesStatus = status === 'COMPLETED';
        } else if (filterOption === 'Dibatalkan') {
            matchesStatus = status === 'CANCELLED';
        } else if (filterOption === 'Diproses') {
            matchesStatus = status === 'COOKING';
        } else if (filterOption === 'Siap Diambil') {
            matchesStatus = status === 'READY_TO_PICKUP';
        } else if (filterOption === 'Tertunda') {
            matchesStatus = status === 'NEW';
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transaksi</Text>
            </View>
            
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari transaksi..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={() => setShowFilterOptions(!showFilterOptions)}
                >
                    <Feather name="filter" size={18} color="#333" />
                    <Text style={styles.filterText}>{filterOption}</Text>
                    <Feather name="chevron-down" size={18} color="#333" />
                </TouchableOpacity>
            </View>
            
            {showFilterOptions && (
                <View style={styles.filterOptionsContainer}>
                    {filterOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.filterOption,
                                filterOption === option && styles.selectedFilterOption
                            ]}
                            onPress={() => handleFilterSelect(option)}
                        >
                            <Text style={[
                                styles.filterOptionText,
                                filterOption === option && styles.selectedFilterOptionText
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
                
                {orders.length > 0 ? (
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={(item, index) => item?.id?.toString() || `order-${index}`}
                        renderItem={({ item }) => (
                            <OrderList order={item}/>
                        )}
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
                        <Text style={styles.emptyText}>No transactions available</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF9F6",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
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
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    filterText: {
        marginHorizontal: 6,
        fontSize: 15,
        color: '#333',
    },
    filterOptionsContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 8,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
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