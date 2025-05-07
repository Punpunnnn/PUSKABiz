import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OrderStatusBadge from '../../screens/transactions/badge'; 
import { useNavigation } from '@react-navigation/native';

const OrderList = ({ order}) => {
    const navigation = useNavigation();
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = getMonthName(d.getMonth());
    const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${day} ${month}, ${time}`;
  };

  const handleViewDetail = () => {
    console.log('View detail for order:', order.id);
    navigation.navigate('TransactionDetail', { orderId: order?.id });
    // navigation.navigate('OrderDetail', { orderId: order.id });
};

  const getMonthName = (monthIndex) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[monthIndex];
  };
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>ORD-{order.id}</Text>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <View>
          <Text style={styles.customerName}>{order.username}</Text>
          <Text style={styles.productInfo}>{order.dishesCount} Produk</Text>
          <TouchableOpacity onPress={handleViewDetail}>
            <Text style={styles.viewDetail}>Lihat Detail</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceContainer}>
        <OrderStatusBadge status={order.status} />
          <Text style={styles.price}>Rp. {order.originalTotal ? order.originalTotal.toLocaleString() : '0'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderDate: {
    color: '#666',
    fontSize: 14,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  productInfo: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  viewDetail: {
    color: '#FF6B00',
    fontWeight: '500',
    fontSize: 14,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  price: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default OrderList;