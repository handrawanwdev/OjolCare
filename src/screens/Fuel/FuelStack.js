import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FuelListScreen from "./FuelListScreen";
import FuelFormScreen from "./FuelFormScreen";

const Stack = createNativeStackNavigator();

export default function FuelStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FuelList" component={FuelListScreen} />
      <Stack.Screen name="FuelForm" component={FuelFormScreen} />
    </Stack.Navigator>
  );
}
