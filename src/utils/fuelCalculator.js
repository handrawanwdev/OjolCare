// utils/fuelCalculator.js

/**
 * Hitung konsumsi rata-rata, prediksi jarak tempuh, dan sisa jarak tempuh
 * Aman untuk 1 log atau lebih
 * @param {Array} fuelLogs - Array fuel log {odometer, liter}
 * @param {number} tankCapacity - Kapasitas tangki (liter)
 * @param {number|null} remainingFuel - Liter bensin tersisa (optional)
 * @returns {Object} { avgConsumption, predictedRange, remainingRange, remainingFuelFromRange }
 */
export function calculateFuelStats(fuelLogs = [], tankCapacity = 0, remainingFuel = null) {
  fuelLogs = fuelLogs.reverse();
  if (!fuelLogs || fuelLogs.length < 2) {
    return { avgConsumption: 0, predictedRange: 0, remainingRange: 0, remainingFuelFromRange: 0 };
  }

  let totalKm = 0;
  let totalLiter = 0;

  for (let i = 1; i < fuelLogs.length; i++) {
    const prev = fuelLogs[i - 1];
    const curr = fuelLogs[i];

    const km = Number(curr.odometer || 0) - Number(prev.odometer || 0);
    if (km <= 0) continue; // hindari km negatif

    const literUsed = Number(curr.liter || 0); // gunakan liter diisi saja
    totalKm += km;
    totalLiter += literUsed;
  }

  const avgConsumption = totalLiter > 0 ? totalKm / totalLiter : 0;
  const predictedRange = avgConsumption * tankCapacity;

  const lastFuel = fuelLogs[fuelLogs.length - 1];
  const remaining = remainingFuel !== null ? remainingFuel : lastFuel?.liter || 0;
  const remainingRange = avgConsumption * remaining;
  const remainingFuelFromRange = avgConsumption > 0 ? remainingRange / avgConsumption : 0;

  return {
    avgConsumption: avgConsumption.toFixed(2),
    predictedRange: predictedRange.toFixed(1),
    remainingRange: remainingRange.toFixed(1),
    remainingFuelFromRange: remainingFuelFromRange.toFixed(1),
  };
}


/*
  // utils/fuelCalculator.js
function calculateFuelStats(fuelLogs = [], tankCapacity = 0, remainingFuel = null) {
  if (!fuelLogs || fuelLogs.length < 2) {
    return { avgConsumption: 0, predictedRange: 0, remainingRange: 0 };
  }

  let totalKm = 0;
  let totalLiter = 0;

  for (let i = 1; i < fuelLogs.length; i++) {
    const prevLog = fuelLogs[i - 1];
    const log = fuelLogs[i];
    const km = Number(log.odometer || 0) - Number(prevLog.odometer || 0);
    
    // Hanya hitung liter untuk log yang menandakan pengisian bensin
    const literUsed = Number(log.liter || 0);

    totalKm += km;
    totalLiter += literUsed;
  }

  const avgConsumption = totalLiter > 0 ? totalKm / totalLiter : 0;
  const predictedRange = avgConsumption * tankCapacity;
  const remaining = remainingFuel !== null ? remainingFuel : (fuelLogs[fuelLogs.length - 1]?.liter || 0);
  const remainingRange = avgConsumption * remaining;
  const remainingFuelFromRange = avgConsumption > 0 ? remainingRange / avgConsumption : 0;
  

  return {
    avgConsumption: avgConsumption.toFixed(2),       // km per liter
    predictedRange: predictedRange.toFixed(1),       // km
    remainingRange: remainingRange.toFixed(1),       // km
    remainingFuelFromRange: remainingFuelFromRange.toFixed(1), // liter
  };
}

// dummyFuelLogsBeat.js

const tankCapacity = 4.5; // liter

// Full to Full: tangki selalu diisi penuh
export const fuelLogsFullToFull = [
  { id: 1, date: "2025-10-01", odometer: 0, liter: 4.5, isFull: true },
  { id: 2, date: "2025-10-02", odometer: 180, liter: 4.5, isFull: true },
  { id: 3, date: "2025-10-03", odometer: 360, liter: 4.5, isFull: true },
];

// Partial to Full: kadang isi separuh, kadang penuh
export const fuelLogsPartialToFull = [
  { id: 1, date: "2025-10-01", odometer: 0, liter: 2.0, isFull: false },
  { id: 2, date: "2025-10-02", odometer: 150, liter: 4.5, isFull: true },
  { id: 3, date: "2025-10-03", odometer: 320, liter: 3.5, isFull: true },
];

// Partial not Full: tangki tidak pernah penuh
export const fuelLogsPartialNotFull = [
  { id: 1, date: "2025-10-01", odometer: 0, liter: 2.0, isFull: false },
  { id: 2, date: "2025-10-02", odometer: 120, liter: 1.8, isFull: false },
  { id: 3, date: "2025-10-03", odometer: 240, liter: 2.2, isFull: false },
];

// Hitung fuel stats
console.log("🏍 Full to Full:", calculateFuelStats(fuelLogsFullToFull, tankCapacity));
console.log("🏍 Partial to Full:", calculateFuelStats(fuelLogsPartialToFull, tankCapacity));
console.log("🏍 Partial not Full:", calculateFuelStats(fuelLogsPartialNotFull, tankCapacity, 1.5));

*/
