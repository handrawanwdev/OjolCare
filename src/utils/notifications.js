// =======================================
// NotificationService.js (Complete Module)
// =======================================

import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
  EventType,
} from '@notifee/react-native';
import { Platform, Linking } from 'react-native';


import { runFuelCheckAndReschedule, runServiceCheck } from './AlertNotificationScheduler';



// ----- Navigation Ref (set dari App.js)
export let navRef = null;
export const setNavRef = (ref) => (navRef = ref);

// =======================================
// 1. CHANNEL
// =======================================
export async function ensureDefaultChannel() {
  return notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
}

// =======================================
// 2. PERMISSION
// =======================================
export async function requestNotifPermission() {
  try {
    await notifee.requestPermission();
  } catch (e) {
    console.warn('Permission Error:', e);
  }
}

// =======================================
// 3. IMMEDIATE NOTIFICATION
// =======================================
export async function showNotification({
  title = 'Hello',
  body = 'This is a notification',
  data = {},
} = {}) {
  const channelId = await ensureDefaultChannel();

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'open' },
    },
  });
}

// =======================================
// 4. SCHEDULE DELAY (N seconds)
// =======================================
export async function scheduleInSeconds(seconds, {
  title = 'Reminder',
  body = 'Scheduled',
  data = {},
} = {}) {
  const channelId = await ensureDefaultChannel();

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + seconds * 1000,
    alarmManager: true,
    exact: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open' },
        reboot: true,
      },
    },
    trigger
  );
}

// =======================================
// 5. SCHEDULE AT DATE
// =======================================
export async function scheduleAt(date, {
  title = 'Reminder',
  body = 'Waktunya!',
  data = {},
} = {}) {
  const channelId = await ensureDefaultChannel();
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: true,
    exact: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open' },
        reboot: true,
      },
    },
    trigger
  );
}

// =======================================
// 6. DAILY AT HH:mm
// =======================================
export async function scheduleDaily(hour, minute, {
  title = 'Pengingat Harian',
  body = 'Sudah waktunya',
  data = {},
} = {}) {
  const channelId = await ensureDefaultChannel();

  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
    alarmManager: true,
    exact: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open' },
        reboot: true,
      },
    },
    trigger
  );
}

// =======================================
// 7. WEEKLY (e.g. setiap Senin 09:00)
// =======================================
export async function scheduleWeekly(dayIndex, hour, minute, {
  title = 'Pengingat Mingguan',
  body = 'Sudah waktunya!',
  data = {},
} = {}) {
  // dayIndex = 0 Minggu, 1 Senin, dst.
  const channelId = await ensureDefaultChannel();

  const now = new Date();
  const next = new Date();

  next.setDate(
    now.getDate() + ((dayIndex + 7 - now.getDay()) % 7)
  );
  next.setHours(hour, minute, 0, 0);

  if (next <= now) next.setDate(next.getDate() + 7);

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    repeatFrequency: RepeatFrequency.WEEKLY,
    alarmManager: true,
    exact: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open' },
        reboot: true,
      },
    },
    trigger
  );
}

// =======================================
// 8. GET / CANCEL SCHEDULED
// =======================================
export const getScheduled = () => notifee.getTriggerNotifications();
export const cancelAllScheduled = () => notifee.cancelTriggerNotifications();
export const cancelById = (id) => notifee.cancelTriggerNotification(id);

// =======================================
// 9. NOTIFICATION PRESS HANDLER
// =======================================
export function setupNotificationHandlers() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification } = detail;
    console.log("notification ",notification);
    

    if (notification?.data?.type === 'FUEL_CHECK_RUN') {
      await runFuelCheckAndReschedule();
      return;
    }

    if (notification?.data?.type === 'SERVICE_CHECK_RUN') {
      await runServiceCheck();
      return;
    }

    // Press → navigate
    if (type === EventType.PRESS) {
      onPress(notification);
    }
  });

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) onPress(detail.notification);
  });
}



function onPress(notification) {
  const route = notification?.data?.route;
  if (route && navRef?.current) {
    navRef.current.navigate(route, notification.data);
  }
}

// =======================================
// 10. HELPER: OPEN AUTOSTART SETTINGS
// =======================================
export const openAutoStart = () => {
  const intents = [
    'miui.intent.action.OP_AUTO_START',
    'com.miui.securitycenter/com.miui.permcenter.autostart.AutoStartManagementActivity',
    'oppo.intent.action.OPPO_AUTO_START',
    'com.coloros.safecenter/.startupapp.StartupAppListActivity',
    'com.vivo.permissionmanager/.activity.BgStartUpManagerActivity',
  ];

  intents.forEach((intent) => {
    Linking.openSettings(intent).catch(() => {});
  });
};
