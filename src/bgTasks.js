import BackgroundFetch from 'react-native-background-fetch';
import notifee, { AndroidImportance } from '@notifee/react-native';

// TODO: ganti path import berikut sesuai lokasi fungsi kamu
// Misal jika notifyFuelAndServiceAlerts ada di src/alerts.js
// import { notifyFuelAndServiceAlerts } from './alerts';
import { notifyFuelAndServiceAlerts } from './db/alertService';

const FUEL_TASK_ID = 'FUEL_ALERT_TASK';
const SERVICE_TASK_ID = 'SERVICE_ALERT_TASK';

async function ensureChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH
  });
}

async function showNotification(title, body) {
  const channelId = await ensureChannel();
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // ganti ke 'ic_notification' bila sudah punya
      pressAction: { id: 'open' },
    },
  });
}

async function runFuelCheck() {
  const alerts = notifyFuelAndServiceAlerts() || [];
  const pending = alerts.filter(a => a.type === 'Fuel' && a.status === 'unread');
  if (pending.length > 0) {
    // Tampilkan satu (atau loop jika mau semua)
    const a = pending[0];
    await showNotification('Fuel Alert', a.message);
    // TODO: setelah tampil, tandai alert sebagai 'read' di storage kamu agar tidak spam
  }
}

async function runServiceCheck() {
  const alerts = notifyFuelAndServiceAlerts() || [];
  const pending = alerts.filter(a => a.type === 'Service' && a.status === 'unread');
  if (pending.length > 0) {
    const a = pending[0];
    await showNotification('Service Alert', a.message);
    // TODO: tandai sebagai read agar tidak berulang
  }
}

async function onEvent(taskId) {
  try {
    console.log('[BackgroundFetch] taskId:', taskId);
    
    if (taskId === FUEL_TASK_ID) {
      await runFuelCheck();
    } else if (taskId === SERVICE_TASK_ID) {
      await runServiceCheck();
    } else {
      // default fetch event (jika kamu pakai configure default)
      await runFuelCheck();
      await runServiceCheck();
    }
  } catch (e) {
    console.warn('BG task error:', e);
  } finally {
    BackgroundFetch.finish(taskId);
  }
}

export async function initBackgroundTasks() {
  console.log('Initializing background tasks...');
  // Minta izin notifikasi (Android 13+)
  try { await notifee.requestPermission(); } catch {}

  await ensureChannel();

  // Daftarkan callback untuk event BG saat app hidup
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 5, // menit; ini untuk default task (opsional)
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
    },
    onEvent,
    taskId => {
      console.warn('BG Fetch TIMEOUT:', taskId);
      BackgroundFetch.finish(taskId);
    }
  );

  // Jadwalkan task FUEL tiap 5 menit
  await BackgroundFetch.scheduleTask({
    taskId: FUEL_TASK_ID,
    delay: 5 * 60 * 1000, // 20 menit
    periodic: true,// ulangi terus
    forceAlarmManager: true, // lebih agresif (Doze)
    stopOnTerminate: false, // tetap jalan walau app dimatikan
    startOnBoot: true, // mulai saat boot
    enableHeadless: true, // jalankan saat app mati
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
  });

  // Jadwalkan task SERVICE tiap 6 jam
  await BackgroundFetch.scheduleTask({
    taskId: SERVICE_TASK_ID,
    delay: 3 * 60 * 60 * 1000, // 3 jam
    periodic: true, // ulangi terus
    forceAlarmManager: true, // lebih agresif (Doze)
    stopOnTerminate: false, // tetap jalan walau app dimatikan
    startOnBoot: true, // mulai saat boot
    enableHeadless: true, // jalankan saat app mati
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
  });
}

// Headless task (saat app dimatikan)
export function registerHeadlessTask() {
  BackgroundFetch.registerHeadlessTask(async event => {
    const { taskId } = event;
    console.log('[BackgroundFetch] onEvent:', taskId);
    await showNotification('Background Task', `Running task: ${taskId}`);
    await onEvent(taskId);
  });
}