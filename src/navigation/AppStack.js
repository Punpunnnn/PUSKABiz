
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './tabNavigator';
import TransactionDetail from '../screens/transactionsdetails';
import MenuFormScreen from '../screens/menuForm';
import ChangePasswordScreen from '../screens/ChangePassword';
import EditKantinScreen from '../screens/editkantin';

const Stack = createStackNavigator();

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainApp" component={TabNavigator} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
    <Stack.Screen name="MenuForm" component={MenuFormScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="EditKantin" component={EditKantinScreen} />
  </Stack.Navigator>
);

export default AppStack;
