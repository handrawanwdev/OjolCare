// App.js
import React, {useRef, useEffect} from "react";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import Navigation from "./src/Navigation";
import { initBackgroundTasks } from './src/bgTasks';

export default function App() {
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      await initBackgroundTasks();
      console.log('Welcome to OjolCare');
    })();

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

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
