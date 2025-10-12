// Navigation.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import DashboardScreen from "./screens/Dashboard/DashboardScreen";
import FuelListScreen from "./screens/Fuel/FuelStack";
import ServiceListScreen from "./screens/Service/ServiceStack";
import SettingsScreen from "./screens/Settings/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#1F2937",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#F3F4F6",
            borderTopWidth: 0,
            elevation: 5,
            height: 60,
            paddingBottom: 5,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Dashboard") iconName = "home-outline";
            else if (route.name === "Fuel") iconName = "flame-outline";
            else if (route.name === "Service") iconName = "construct-outline";
            else if (route.name === "Settings") iconName = "settings-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Fuel" component={FuelListScreen} />
        <Tab.Screen name="Service" component={ServiceListScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
