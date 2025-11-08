/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Handler BACKGROUND untuk aksi notifikasi (harus di entry root)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    const { pressAction, notification } = detail;
    if (pressAction?.id === 'open') {
      // Lakukan tugas di background jika perlu
      console.log('BG action: open', notification?.id);
    } else if (pressAction?.id === 'snooze_5m') {
      // Contoh: log atau panggil API
      console.log('BG action: snooze 5m');
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
