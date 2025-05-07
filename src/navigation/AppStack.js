import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './tabNavigator';
import TransactionDetail from '../screens/transactionsdetails';
import AddMenu from '../screens/addMenu';
import EditMenu from '../screens/editMenu';

const Stack = createStackNavigator();

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainApp" component={TabNavigator} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
    <Stack.Screen name="AddMenu" component={AddMenu} />
    <Stack.Screen name="EditMenu" component={EditMenu} />
  </Stack.Navigator>
);

export default AppStack;
