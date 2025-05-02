import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image,
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import OrderFullList from '../../components/orderfulllist';
import { useRestaurantOrders } from '../../context/orderContext';
import OrderStatusBadge from '../transactions/badge';
import { useRatingContext } from '../../context/ratingContext';

const DisplayRatings = ({ orderId }) => {
  const ratingContext = useRatingContext();
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId && ratingContext) {
      fetchRating();
    }
  }, [orderId, ratingContext]);

  const fetchRating = async () => {
    try {
      setIsLoading(true);
      
      const startTime = Date.now();
      const rating = await ratingContext.getRatingByOrderId(orderId);
      
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 300; // 300ms biar smooth
      if (elapsed < minLoadingTime) {
        await new Promise((res) => setTimeout(res, minLoadingTime - elapsed));
      }
  
      setUserRating(rating);
    } catch (error) {
      console.error("Error fetching rating:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading) {
    return (
      <View style={styles.ratingsContainer}>
        <Text style={styles.sectionTitle}>Customer Rating</Text>
        <Text>Loading rating...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.ratingsContainer}>
        <Text style={styles.sectionTitle}>Customer Rating</Text>
        <Text style={styles.errorText}>Unable to load rating</Text>
      </View>
    );
  }

  if (!userRating) {
    return (
      <View style={styles.ratingsContainer}>
        <Text style={styles.sectionTitle}>Customer Rating</Text>
        <Text style={styles.noRatingsText}>No rating available for this order.</Text>
      </View>
    );
  }

  return (
    <View style={styles.ratingsContainer}>
      <Text style={styles.sectionTitle}>Customer Rating</Text>
      
      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Service Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={userRating.service_rating >= star ? "star" : "star-o"}
              size={20}
              color="#FFD700"
              style={styles.starIcon}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Food Quality Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={userRating.food_quality_rating >= star ? "star" : "star-o"}
              size={20}
              color="#FFD700"
              style={styles.starIcon}
            />
          ))}
        </View>
      </View>
      
      {userRating.review && (
        <View style={styles.reviewSection}>
          <Text style={styles.ratingLabel}>Review</Text>
          <Text style={styles.reviewText}>{userRating.review}</Text>
        </View>
      )}
      
      {userRating.user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>
            Rated by {userRating.name || "Anonymous"} on {new Date(userRating.created_at || userRating.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );
};
const TransactionDetail = () => {
  const route = useRoute();
  const { orderId } = route.params;
  const { getRestaurantOrder, updateOrderStatus } = useRestaurantOrders();
  const navigation = useNavigation();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await getRestaurantOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, successMessage) => {
    try {
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        Alert.alert("Success", successMessage);
        fetchOrder(); // Refresh order
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  if (isLoading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Detail</Text>
      </View>

      {/* Main Content - Scrollable */}
      <View style={styles.contentContainer}>
        {/* Order Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Status Pesanan</Text>
            <View style={[styles.statusBadge, { alignSelf: 'flex-start' }]}>
              <OrderStatusBadge status={order.status} />
            </View>
          </View>

          {/* Order Items - Scrollable */}
        <ScrollView style={styles.scrollableContent}>
          <View style={styles.orderItemsSection}>
            <Text style={styles.sectionTitle}>Daftar Pesanan</Text>
            {(order.dishes || []).map((item, index) => (
              <OrderFullList
                key={index}
                basketDish={{
                  quantity: item.quantity,
                  menus: item.menu
                }}
              />
            ))}
          </View>

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>{order.type || 'Cash'}</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{order.notes || 'Tidak ada catatan'}</Text>
            </View>
          </View>

          {/* Ratings - Show only if order is completed */}
          {order.status === 'COMPLETED' && (
            <DisplayRatings orderId={order.id} />
          )}
        </ScrollView>
      </View>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Harga Asli</Text>
            <Text style={styles.priceValue}>Rp.{order.originalTotal?.toLocaleString("id-ID") || 0},00</Text>
          </View>
          <View style={styles.priceRow}>
            <View style={styles.coinRow}>
              <Image source={require('../../../assets/puskaCoin.png')} style={styles.coinIcon} />
              <Text style={styles.coinLabel}>PUSKACoin</Text>
            </View>
            <Text style={styles.coinValue}>{order.usedCoin || 0} Koin</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rp.{order.total?.toLocaleString("id-ID") || 0},00</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status === 'PENDING' && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => handleUpdateStatus('CANCELLED', 'Order has been cancelled.')}
            >
              <Text style={styles.buttonText}>Batalkan Pesanan</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'COOKING' && (
            <TouchableOpacity 
              style={styles.readyButton}
              onPress={() => handleUpdateStatus('READY_FOR_PICKUP', 'Order is ready for pickup.')}
            >
              <Text style={styles.buttonText}>Pesanan Siap</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'READY_FOR_PICKUP' && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleUpdateStatus('COMPLETED', 'Order completed!')}
            >
              <Text style={styles.buttonText}>Selesaikan Pesanan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  scrollableContent: {
    flex: 1,
  },
  statusSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  orderItemsSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  paymentSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  paymentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  paymentText: {
    color: 'white',
    fontWeight: '600',
  },
  notesSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  noteBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  noteText: {
    color: '#757575',
  },
  ratingsContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 2,
  },
  reviewSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  userInfo: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  userText: {
    fontSize: 12,
    color: '#777',
  },
  noRatingsText: {
    fontStyle: 'italic',
    color: '#777',
  },
  errorText: {
    color: 'red',
    fontStyle: 'italic',
  },
  bottomSection: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 16,
    paddingBottom: 48,
  },
  priceSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '500',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 48,
    height: 48,
    marginRight: 6,
  },
  coinLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  coinValue: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionButtons: {
    paddingHorizontal: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  readyButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default TransactionDetail;