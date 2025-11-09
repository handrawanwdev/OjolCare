import { getFuelLogs } from "./fuelService";
import { getServiceLogs } from "./serviceService";
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

export function markAlertRead(alertId) {
  alerts = alerts.map(alert =>
    alert.id === alertId ? { ...alert, status: "read" } : alert
  );
}


// ================= Service Alert =================
export function handleServiceAlert() {
  const fuelLogs = getFuelLogs();
  const settings = getSettings();
  const serviceLogs = getServiceLogs();
  if (!settings || fuelLogs.length === 0) return; // motor baru, skip
  if (fuelLogs.length < 2) return; // butuh minimal 2 log untuk hitung jarak tempuh

  const lastOdometer = fuelLogs[0].odometer || 0;

  // Cek apakah sudah melewati jarak servis berikutnya
  for(let serviceLog of serviceLogs) {
    const nextDue = serviceLog.odometer;
    if (lastOdometer >= nextDue) {
      const exists = alerts.find(a => a.id === serviceLog.id);
      if (exists) continue; // sudah ada alert untuk service ini
      alerts.push({
        id: serviceLog.id,
        type: 'Service',
        message: `⚙️ Waktunya servis berkala pada jarak ${nextDue} km, untuk komponen ${serviceLog.component}`,
        status: 'unread',
        is_complete: serviceLog.is_complete,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }

}

export const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Pastikan angka bersih
    const numericValue = Number(value.toString().replace(/\D/g, ''));
    if (isNaN(numericValue)) return '';

    // Format ribuan biasa
    return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
  

export function notifyFuelAndServiceAlerts() {
  let notifyAlert = [];
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

  if (Number(stats.remainingRange) < Number(fuelLowKm)) {
    notifyAlert.push({
      id: Date.now(),
      type: 'Fuel',
      message: `⛽ Bensin hampir habis, prediksi sisa jarak ${stats.remainingRange} km`,
      status: 'unread',
      is_complete: false,
      date: new Date().toISOString().split('T')[0],
    });
  }

  const serviceLogs = getServiceLogs();
  const lastOdometer = fuelLogs[0].odometer || 0;

  // Cek apakah sudah melewati jarak servis berikutnya
  for(let serviceLog of serviceLogs) {
    const nextDue = serviceLog.odometer;
    if (lastOdometer >= nextDue) {
      const exists = notifyAlert.find(a => a.id === serviceLog.id);
      if (exists) continue; // sudah ada alert untuk service ini
      notifyAlert.push({
        id: serviceLog.id,
        type: 'Service',
        message: `⚙️ Waktunya servis berkala pada jarak ${formatNumber(nextDue)} km, untuk komponen ${serviceLog.component}`,
        status: 'unread',
        is_complete: serviceLog.is_complete,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }

  return notifyAlert;
}

// reset alert
export function resetAlerts() {
  alerts = [];
}
