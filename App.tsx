// App.js
import React, {useRef, useEffect} from "react";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import Navigation from "./src/Navigation";
import { 
  scheduleFuelCheckOnce,
  scheduleDailyServiceCheck
} from './src/utils/AlertNotificationScheduler';
import { showNotification } from './src/utils/notifications';

export default function App() {
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log('Welcome to OjolCare');
    showNotification({
      title: 'Selamat Datang di OjolCare',
      body: 'Asisten pribadi untuk perawatan dan pengingat kendaraan Anda.',
    })
    scheduleFuelCheckOnce(1 * 60 * 1000);// 1 menit untuk demo
    // Schedule daily service check
    scheduleDailyServiceCheck();
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
