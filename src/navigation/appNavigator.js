import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/login';
import RegisterScreen from '../screens/register';
import TransactionDetail from '../screens/transactionsdetails';
import AddMenu from '../screens/addMenu';
import EditMenu from '../screens/editMenu';
import TabNavigator from './tabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
        <Stack.Screen name="AddMenu" component={AddMenu} />
        <Stack.Screen name="EditMenu" component={EditMenu} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
