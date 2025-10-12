// App.js
import React from "react";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import Navigation from "./src/Navigation";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* StatusBar global */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Navigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
});
