import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RestaurantDashboard from '../screens/Dashboard';
import Transactions from '../screens/transactions';
import MenuScreen from '../screens/menu/index';
import Profile from '../screens/profile';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen 
      name="Dashboard" 
      component={RestaurantDashboard} 
      options={{ tabBarIcon: ({ color, size }) => <Icon name="home-outline" size={size} color={color} /> }} 
    />
    <Tab.Screen 
      name="Pesanan"  // GANTI dari "Transaksi"
      component={Transactions} 
      options={{ tabBarIcon: ({ color, size }) => <Icon name="receipt-outline" size={size} color={color} /> }} 
    />
    <Tab.Screen 
      name="Menu" 
      component={MenuScreen} 
      options={{ tabBarIcon: ({ color, size }) => <Icon name="restaurant-outline" size={size} color={color} /> }} 
    />
    <Tab.Screen 
      name="Profil" 
      component={Profile} 
      options={{ tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} /> }} 
    />
  </Tab.Navigator>
);

export default TabNavigator;
