import notifee, {
  AndroidImportance,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

/**
 * Buat channel Android sekali (wajib sebelum tampilkan notif)
 */
export async function ensureDefaultChannel() {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
  return channelId;
}

/**
 * Minta izin (Android 13+ dan iOS). Aman dipanggil di Android lama (no-op).
 */
export async function requestNotificationPermission() {
  try {
    await notifee.requestPermission();
  } catch (e) {
    console.warn('requestPermission error', e);
  }
}

/**
 * Tampilkan notifikasi lokal segera.
 */
export async function showLocalNotification({
  title = 'Halo',
  body = 'Ini notifikasi lokal',
} = {}) {
  const channelId = await ensureDefaultChannel();
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // gunakan ic_notification jika kamu punya icon khusus
      pressAction: { id: 'default' },
    },
  });
}

/**
 * Jadwalkan notifikasi setiap hari pada jam 10 pagi.
 */
export async function scheduleInDaily({
  title = 'Reminder',
  body = 'Notifikasi terjadwal (5 detik)',
} = {}) {
  const channelId = await ensureDefaultChannel();
  const trigger = {
    type: TriggerType.TIMESTAMP,
    // timestamp: Date.now() + 5000, // 5 detik
    // schedule setiap hari pada jam 10 pagi
    timestamp: new Date().setHours(10, 0, 0, 0) + 24 * 60 * 60 * 1000,
    repeatFrequency: 'DAILY',
    alarmManager: true, // opsional, agar lebih andal di Android
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open' },
      },
    },
    trigger
  );
}

export async function scheduleIn5Seconds() {
  const channelId = await ensureDefaultChannel();
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 5000, // 5 detik
  };

  await notifee.createTriggerNotification(
    {
      title: 'Pengingat',
      body: 'Ini notifikasi terjadwal dalam 5 detik',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    },
    trigger
  );
}

/**
 * Notifikasi dengan tombol aksi.
 */
export async function showWithActions() {
  const channelId = await ensureDefaultChannel();
  await notifee.displayNotification({
    title: 'Pesan baru',
    body: 'Pilih aksi di bawah',
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      actions: [
        {
          title: 'Buka',
          pressAction: { id: 'open' },
        },
        {
          title: 'Tunda 5m',
          pressAction: { id: 'snooze_5m' },
        },
      ],
    },
  });
}

/**
 * Daftarkan listener event foreground (aksi tombol, dismiss, dsb.)
 * Panggil sekali saat app start, simpan unsubscribe untuk dibersihkan saat unmount.
 */
export function registerForegroundNotificationEvents() {
  const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      const { pressAction, notification } = detail;
      if (pressAction?.id === 'open') {
        // Lakukan navigasi / aksi buka layar
        console.log('Action: open', notification?.id);
      } else if (pressAction?.id === 'snooze_5m') {
        // Jadwalkan ulang 5 menit dari sekarang
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + 5 * 60 * 1000,
        };
        await notifee.createTriggerNotification(
          {
            title: 'Pengingat',
            body: 'Ini hasil snooze 5 menit',
            android: { channelId: 'default', smallIcon: 'ic_launcher' },
          },
          trigger
        );
      }
    }
  });

  return unsubscribe;
}

/**
 * Schedule notifikasi dalam N detik dari sekarang
 */
export async function scheduleInSeconds(seconds, { title = 'Reminder', body = 'Terjadwal' } = {}) {
  const channelId = await ensureDefaultChannel();
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
  const channelId = await ensureDefaultChannel();
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
  const channelId = await ensureDefaultChannel();

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