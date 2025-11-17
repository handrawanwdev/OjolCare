// ===========================================
// AlertNotificationScheduler.js (FINAL VERSION)
// ===========================================

import notifee, { TriggerType } from '@notifee/react-native';
import { notifyFuelAndServiceAlerts, shouldSendFuelAlert } from '../db/alertService';
import { ensureDefaultChannel } from './notifications';

// ----------------------------------
// 1) Fuel Check - Self Reschedule
// ----------------------------------
export async function scheduleFuelCheckOnce(delayMs) {
  const channelId = await ensureDefaultChannel();

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + delayMs,
    alarmManager: true,
    exact: true,
  };

  await notifee.createTriggerNotification(
    {
      id: 'fuel-check',
      title: 'Fuel Check Background Task',
      body: 'Memeriksa kondisi bensin...',
      data: { type: 'FUEL_CHECK_RUN' },
      android: {
        channelId,
        smallIcon: 'ic_launcher',
      },
    },
    trigger
  );
}

export async function runFuelCheckAndReschedule() {
  const alerts = notifyFuelAndServiceAlerts();
  
  const fuelAlert = alerts.find(a => a.type === 'Fuel');
  
  // kalau tidak ada alert → next jadwal saja
  if (fuelAlert) {
    const isLow = true; // karena alert sudah dihitung oleh notifyFuelAndServiceAlerts()

    if (shouldSendFuelAlert(isLow)) {
      await notifee.displayNotification({
        title: '⛽ Peringatan Bahan Bakar',
        body: fuelAlert.message,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: { id: 'open' },
        },
      });
      await scheduleFuelCheckOnce(1 * 60 * 1000); // cek lagi dalam 1 menit
    }
  } else {
    // fuel normal → reset state
    shouldSendFuelAlert(false);
  }
}

// ----------------------------------
// 2) Service Check - Daily at 08:00
// ----------------------------------
export async function scheduleDailyServiceCheck() {
  const channelId = await ensureDefaultChannel();

  const now = new Date();
  const next = new Date();
  next.setHours(8, 0, 0, 0); // jam 08:00 setiap hari

  if (next <= now) next.setDate(next.getDate() + 1);

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: 'service-check',
      title: 'Service Check Background Task',
      body: 'Memeriksa jadwal servis...',
      data: { type: 'SERVICE_CHECK_RUN' },
      android: {
        channelId,
        smallIcon: 'ic_launcher',
      },
    },
    trigger
  );
}

export async function runServiceCheck() {
  const alerts = notifyFuelAndServiceAlerts();

  alerts
    .filter(a => a.type === 'Service')
    .forEach(async (alert) => {
      await notifee.displayNotification({
        title: '⚙️ Servis Berkala',
        body: alert.message,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: { id: 'open' },
        },
      });
    });

  // Notifee sudah repeat daily → tidak perlu reschedule manual
}
