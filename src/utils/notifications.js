import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';

export async function ensureChannel() {
  return notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestNotifPermission() {
  // Android 13+ akan menampilkan prompt permission
  try {
    await notifee.requestPermission();
  } catch (e) {
    console.warn('requestPermission error', e);
  }
}

/** Tampilkan notifikasi lokal segera */
export async function showLocalNotification({ title = 'Hello', body = 'This is a local notification' } = {}) {
  const channelId = await ensureChannel();

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // ganti dengan ic_notification jika sudah menambahkan icon khusus
      pressAction: { id: 'open' },
    },
  });
}

/**
 * Schedule notifikasi dalam N detik dari sekarang
 */
export async function scheduleInSeconds(seconds, { title = 'Reminder', body = 'Terjadwal' } = {}) {
  const channelId = await ensureChannel();
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + seconds * 1000,
    // Opsional: gunakan AlarmManager untuk keandalan (Android)
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // ganti dengan ic_notification jika sudah menambahkan icon khusus
        pressAction: { id: 'open' },
      },
    },
    trigger
  );
}

/**
 * Schedule pada tanggal/jam tertentu (Date object)
 */
export async function scheduleAt(date, { title = 'Reminder', body = 'Waktunya!' } = {}) {
  const channelId = await ensureChannel();
  const when = date.getTime();

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: when,
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: { channelId, smallIcon: 'ic_launcher', pressAction: { id: 'open' } },
    },
    trigger
  );
}

/**
 * Schedule harian pada jam:menit (mis: 9:00 setiap hari)
 */
export async function scheduleDaily(hour, minute, { title = 'Pengingat Harian', body = 'Sudah waktunya' } = {}) {
  const channelId = await ensureChannel();

  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    // jika waktu sudah lewat hari ini, jadwalkan besok
    next.setDate(next.getDate() + 1);
  }

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    repeatFrequency: RepeatFrequency.DAILY, // akan berulang setiap hari pada waktu yang sama
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: { channelId, smallIcon: 'ic_launcher', pressAction: { id: 'open' } },
    },
    trigger
  );
}

/**
 * Melihat daftar notifikasi yang terjadwal
 */
export async function getAllScheduled() {
  return notifee.getTriggerNotifications();
}

/**
 * Batalkan semua notifikasi terjadwal
 */
export async function cancelAllScheduled() {
  await notifee.cancelTriggerNotifications();
}

/**
 * Batalkan notifikasi terjadwal tertentu (berdasarkan notification.id)
 */
export async function cancelScheduledById(notificationId) {
  await notifee.cancelTriggerNotification(notificationId);
}