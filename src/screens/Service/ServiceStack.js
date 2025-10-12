// navigation/ServiceStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServiceListScreen from "./ServiceListScreen";
import ServiceFormScreen from "./ServiceFormScreen";

const Stack = createNativeStackNavigator();

export default function ServiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceList" component={ServiceListScreen} />
      <Stack.Screen name="ServiceForm" component={ServiceFormScreen} />
    </Stack.Navigator>
  );
}
