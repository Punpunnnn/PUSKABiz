import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const OrderFullList = ({ basketDish }) => {
  const { quantity, menus } = basketDish;
  const itemTotal = menus?.price * quantity || 0;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{menus?.name}</Text>
      </View>
      <Text style={styles.itemPrice}>Rp.{itemTotal.toLocaleString("id-ID")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 4,
  },
  quantityContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  }
});

export default OrderFullList;