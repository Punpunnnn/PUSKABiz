import { useCallback,  useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import MonthlySales from '../../components/monthlysales';
import OrderConfirmation from '../../components/confirmorder';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSales } from '../../context/salesContext';
import { useRestaurantOrders } from '../../context/orderContext';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

const RestaurantDashboard = () => {
  const [currentDate] = useState(() => {
    const today = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return today.toLocaleDateString('id-ID', options);
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState();
  const { restaurantId } = useAuth();
  const { dailyProfit, formatCurrency, dailyOrder } = useSales();
  const { orders, loading, error, refreshOrders, updateOrderStatus } = useRestaurantOrders();
  const pendingOrders = orders.filter(order => order.status === 'NEW');

  useFocusEffect(
  useCallback(() => {
    if (!restaurantId) return;
    const fetchRestaurantStatus = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('is_open')
        .eq('id', restaurantId) // Pastikan ini benar
        .single();

      if (data) {
        setStatus(data.is_open ? 'BUKA' : 'TUTUP');
      } else {
        console.error("Gagal ambil status is_open", error);
      }
    };

    fetchRestaurantStatus();
  }, [restaurantId])
);

  const handleOrderStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
      .then((result) => {
        if (result.success) {
          console.log(`Pesanan ${orderId} status diubah ke ${newStatus}`);
          refreshOrders();
        } else {
          console.error('Gagal mengubah status pesanan:', result.error);
        }
      });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };
  
  useEffect(() => {
    if (restaurantId) {
      refreshOrders();
    }
  }, [restaurantId]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.row}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard Restoran</Text>
          <Text style={styles.headerDate}>{currentDate}</Text>
        </View>
        <View style={[
          styles.headerRight,
          status === 'TUTUP' && styles.headerRightClosed
        ]}>
          <Text style={styles.headerStatus}>{status}</Text>
        </View>
      </SafeAreaView>
      
      <View style={styles.toprow}>
        <MonthlySales />

        {/* Daily Stats */}
        <View style={styles.dailyStatsContainer}>
          <View style={styles.dailyStat}>
            <View style={styles.dailyStatHeader}>
              <Text style={styles.dailyStatLabel}>Pendapatan hari ini</Text>
            </View>
            <Text style={styles.dailyStatValue}>{formatCurrency(dailyProfit || 0)}</Text>
          </View>
          
          <View style={styles.dailyStat}>
            <View style={styles.dailyStatHeader}>
              <Text style={styles.dailyStatLabel}>Total Pesanan hari ini</Text>
            </View>
            <Text style={styles.dailyStatValue}>{dailyOrder || 0} Pesanan</Text>
          </View>
        </View>
      </View>

      {/* Pending Orders Section */}
      <View style={styles.pendingContainer}>
        <Text style={styles.pendingTitle}>Pesanan Menunggu Konfirmasi</Text>
        
        <ScrollView 
          style={styles.ordersList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#8A1538']} 
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.statusContainer}>
              <Text style={styles.loadingText}>Sedang memuat pesanan...</Text>
            </View>
          ) : error ? (
            <View style={styles.statusContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          ) : pendingOrders && pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <OrderConfirmation 
                key={order.id} 
                order={order} 
                onOrderStatusChange={handleOrderStatusChange} 
              />
            ))
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.noOrdersText}>Tidak ada pesanan yang menunggu konfirmasi</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#8A1538',
    padding: 16,
    paddingTop: 0,
    paddingRight: 0,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRight: {
    backgroundColor: '#5DA574', // Untuk status OPEN
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginLeft: -20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightClosed: {
  backgroundColor: '#999',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerDate: {
    color: 'white',
    fontSize: 14,
  },
  headerStatus: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toprow: {
    backgroundColor: '#8A1538',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dailyStatsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  dailyStat: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dailyStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyStatLabel: {
    fontSize: 14,
    color: '#555',
  },
  dailyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pendingContainer: {
    flex: 1,
    padding: 16,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  ordersList: {
    flex: 1,
  },
  statusContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#e74c3c',
  },
});

export default RestaurantDashboard;