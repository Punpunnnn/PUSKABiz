import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRestaurantOrders } from '../../context/orderContext';
import { useNavigation } from '@react-navigation/native';

const OrderConfirmation = ({ order, onOrderStatusChange }) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { updateOrderStatus, loading } = useRestaurantOrders();
  const navigation = useNavigation();

  
  const handleViewDetail = () => {
    // Logic to view order details
    navigation.navigate('TransactionDetail', { orderId: order.id }); // Replace 'OrderDetail' with the actual screen name('View details for order:', order.id);
  };
  
  const handleReject = () => {
    setShowRejectModal(true);
  };
  
  const handleAccept = () => {
    setShowAcceptModal(true);
  };
  
  const confirmAccept = async () => {
    try {
      const result = await updateOrderStatus(order.id, 'COOKING');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to accept order');
      }
  
      // Notify parent component about the status change if needed
      if (onOrderStatusChange) {
        onOrderStatusChange(order.id, 'COOKING');
      }
  
      setShowAcceptModal(false);
      Alert.alert('Success', 'Order has been accepted!');
    } catch (err) {
      console.error('Error accepting order:', err);
      Alert.alert('Error', `Failed to accept order: ${err.message}`);
    }
  };
  
  const confirmReject = async () => {
    try {
      const result = await updateOrderStatus(order.id, 'CANCELLED');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject order');
      }
      if (onOrderStatusChange) {
        onOrderStatusChange(order.id, 'REJECTED');
      }
  
      setShowRejectModal(false);
      Alert.alert('Pesanan Ditolak', 'Pesanan sudah ditolak!');
    } catch (err) {
      console.error('Error rejecting order:', err);
      Alert.alert('Error', `Failed to reject order: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Text style={styles.price}>Rp {order.originalTotal.toLocaleString('id-ID')}</Text>
      <View style={styles.actionButtons}>
    <TouchableOpacity 
      style={styles.rejectButton} 
      onPress={handleReject}
      disabled={loading}
    >
      <Text style={styles.rejectText}>Tolak</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[
        styles.acceptButton,
        order.status === 'COOKING' && styles.disabledButton
      ]} 
      onPress={handleAccept}
      disabled={loading || order.status === 'COOKING'}
    >
      <Text style={styles.acceptText}>
        {order.status === 'COOKING' ? 'Diterima' : 'Terima'}
      </Text>
    </TouchableOpacity>
  </View>
    </View>
  </View>

  
      
      {/* Accept Order Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showAcceptModal}
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi</Text>
            <Text style={styles.modalText}>
              Apakah kamu yakin ingin menerima order ini?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonYes}
                onPress={confirmAccept}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextYes}>Ya</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonNo}
                onPress={() => setShowAcceptModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextNo}>Tidak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Reject Order Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showRejectModal}
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi</Text>
            <Text style={styles.modalText}>
              Apakah kamu yakin ingin menolak order ini?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonYes}
                onPress={confirmReject}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextYes}>Ya</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonNo}
                onPress={() => setShowRejectModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextNo}>Tidak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
  borderLeftWidth: 4,
  borderLeftColor: '#FF5722', // garis orange di sisi kiri
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#555',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 16,
    marginBottom: 4,
  },
  productInfo: {
    color: '#555',
    fontSize: 12,
    marginBottom: 4,
  },
  viewDetail: {
    color: '#B02E26',
    fontSize: 12,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 20,
  },
  discount: {
    color: '#4CAF50',
    fontSize: 12,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rejectButton: {
    backgroundColor: '#E53935',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#43A047',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
  marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  rejectText: {
    color: 'white',
    fontWeight: 'bold',
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButtonYes: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalButtonNo: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalButtonTextYes: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonTextNo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderConfirmation;