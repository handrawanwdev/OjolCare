/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { runFuelCheckAndReschedule } from './src/utils/AlertNotificationScheduler';
import { runServiceCheck } from './src/utils/AlertNotificationScheduler';

// Wajib! Notifee background handler harus di sini
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;

  console.log('[BG EVENT] ', type, notification?.data);

  if (notification?.data?.type === 'FUEL_CHECK_RUN') {
    await runFuelCheckAndReschedule();
    return;
  }

  if (notification?.data?.type === 'SERVICE_CHECK_RUN') {
    await runServiceCheck();
    return;
  }

  if (type === EventType.PRESS) {
    console.log('[BG] Notification pressed:', notification.id);
  }
});

AppRegistry.registerComponent(appName, () => App);