import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AddProductScreen from "../screens/AddProductScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import BuyerHomeScreen from "../screens/BuyerHomeScreen";
import RoleSelectScreen from "../screens/RoleSelectScreen";
import SellerDashboardScreen from "../screens/SellerDashboardScreen";
import { User } from "../types/api";

export type RootStackParamList = {
  Auth: undefined;
  BuyerHome: { user: User };
  SellerDashboard: { user: User };
  AdminDashboard: { user: User };
  AddProduct: { user: User };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator
    initialRouteName="Auth"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Auth" component={RoleSelectScreen} />
    <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} />
    <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
