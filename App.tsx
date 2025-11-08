// App.js
import React, {useRef, useEffect} from "react";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import Navigation from "./src/Navigation";
import {
  requestNotificationPermission,
  showLocalNotification,
  registerForegroundNotificationEvents,
  ensureDefaultChannel,
  scheduleInSeconds,
} from './src/utils/notifications';

export default function App() {
  const unsubRef = useRef(null);

  useEffect(() => {
    (async () => {
      console.log('Welcome to OjolCare');
      await ensureDefaultChannel();
      await requestNotificationPermission(); // Android 13+ dan iOS
      await showLocalNotification({
        title: 'Welcome to OjolCare',
        body: 'Thank you for using our app!',
      });
      
      // @ts-ignore
      unsubRef.current = registerForegroundNotificationEvents();
    })();

    return () => {
      // @ts-ignore
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
