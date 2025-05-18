import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView} from 'react-native';
import MonthlySales from '../../components/monthlysales';
import OrderConfirmation from '../../components/confirmorder';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSales } from '../../context/salesContext';
import { useRestaurantOrders } from '../../context/orderContext';

const RestaurantDashboard = () => {
  const [currentDate] = useState(() => {
    const today = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return today.toLocaleDateString('id-ID', options);
  });
  const [status, setStatus] = useState('OPEN');
  const { dailyProfit, formatCurrency, dailyOrder } = useSales();
  
  // Get orders data from context
  const { orders, loading, error, refreshOrders } = useRestaurantOrders();
  
  const pendingOrders = orders.filter(order => order.status === 'NEW');
  
  // Handle order status changes
  const handleOrderStatusChange = (orderId, newStatus) => {
    refreshOrders();
  };

  return (
    <View style={styles.container}>
      < SafeAreaView edges={['top']} style={styles.row}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard Restoran</Text>
          <Text style={styles.headerDate}>{currentDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerStatus}>{status}</Text>
        </View>
      </SafeAreaView>
      
      <View style={styles.toprow}>
      <MonthlySales/>

      {/* Daily Stats */}
      <View style={styles.dailyStatsContainer}>
        <View style={styles.dailyStat}>
          <View style={styles.dailyStatHeader}>
            <Text style={styles.dailyStatLabel}>Pendapatan hari ini</Text>
          </View>
          <Text style={styles.dailyStatValue}>{formatCurrency(dailyProfit)}</Text>
        </View>
        
        <View style={styles.dailyStat}>
          <View style={styles.dailyStatHeader}>
            <Text style={styles.dailyStatLabel}>Total Pesanan hari ini</Text>
          </View>
          <Text style={styles.dailyStatValue}>{dailyOrder} Pesanan</Text>
        </View>
      </View>
      </View>

      {/* Pending Orders Section */}
      <View style={styles.pendingContainer}>
        <Text style={styles.pendingTitle}>Pesanan Menunggu Konfirmasi</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading orders...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView style={styles.ordersList}>
            {pendingOrders && pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <OrderConfirmation 
                  key={order.id} 
                  order={order} 
                  onOrderStatusChange={handleOrderStatusChange} 
                />
              ))
            ) : (
              <Text style={styles.noOrdersText}>Tidak ada pesanan yang menunggu konfirmasi</Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#Fcfcfc',
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
      backgroundColor: 'OPEN' ? '#5DA574' : '#FFC107',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      marginLeft: -20,
      alignSelf: 'stretch',
      justifyContent: 'center',
      alignItems: 'center',
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
      textAlign: 'center', // Centered the text
    },
  toprow: {
    backgroundColor: '#8A1538',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  },
  dailyStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyStatLabel: {
    fontSize: 14,
  },
  dailyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  ordersList: {
    flex: 1,
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  activeNavText: {
    color: '#B02E26',
  },
});

export default RestaurantDashboard;