import { getFuelLogs } from "./fuelService";
import { getSettings } from "./settingsService";
import { calculateFuelStats } from '../utils/fuelCalculator';

let alerts = [];

export function getAlerts() {
  return alerts;
}

export function markAlertAsRead(id) {
  alerts = alerts.map(a => (a.id === id ? { ...a, status: 'read' } : a));
}

export function handleFuelAlert() {
  const fuelLogs = getFuelLogs() || [];
  let fuelLogsMap = fuelLogs.map((item) => item);
  const settings = getSettings();
  if (!settings || !fuelLogs || fuelLogs.length === 0) return;

  const tankCapacity = Number(settings.tank_capacity) || 5;

  // Gunakan fuelCalculator agar sesuai rules baru
  const stats = calculateFuelStats(fuelLogsMap, tankCapacity);

  // Jangan bikin alert kalau remainingRange 0
  if (Number(stats.remainingRange) === 0) return;

  const fuelLowKm = Number(settings.fuel_low_km) || 30;
  // console.log('Remaining Range:', stats.remainingRange, 'Fuel Low Km Threshold:', fuelLowKm);

  if (Number(stats.remainingRange) < fuelLowKm) {
    const exists = alerts.find(a => a.type === 'Fuel' && a.status === 'unread');
    if (!exists) {
      alerts.push({
        id: Date.now(),
        type: 'Fuel',
        message: `⛽ Bensin hampir habis, prediksi sisa jarak ${stats.remainingRange} km`,
        status: 'unread',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }
}


// ================= Service Alert =================
export function handleServiceAlert() {
  const fuelLogs = getFuelLogs();
  const settings = getSettings();
  if (!settings || fuelLogs.length === 0) return; // motor baru, skip

  const lastOdometer = fuelLogs[fuelLogs.length - 1].odometer || 0;
  const serviceInterval = settings.service_interval;

  if (lastOdometer > 0 && serviceInterval - lastOdometer <= 500) {
    alerts.push({
      id: Date.now(),
      type: "Service",
      message: `Jarak servis hampir tercapai (${lastOdometer} km)`,
      status: "unread",
      date: new Date().toISOString().split("T")[0],
    });
  }
}

// reset alert
export function resetAlerts() {
  alerts = [];
}
