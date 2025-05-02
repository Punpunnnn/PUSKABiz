import { View, Text, StyleSheet } from 'react-native';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'purple'; // Yellow
      case 'NEW':
        return '#2196f3'; // Blue
      case 'COOKING':
        return '#ff9800'; // Orange
      case 'READY_FOR_PICKUP':
        return '#008a65'; // Green
      case 'COMPLETED':
        return '#8bc34a'; // Light Green
      case 'CANCELLED':
        return '#f44336'; // Red
      case 'EXPIRED':
        return 'gray'; // Deep Orange
      default:
        return '#9e9e9e'; // Grey
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default OrderStatusBadge;