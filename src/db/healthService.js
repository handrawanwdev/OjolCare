import { realm } from "./db";
import { getFuelLogs } from "./fuelService";
import { getServiceLogs } from "./serviceService";

// Hanya buat object, jangan panggil write
export const addHealthScore = (data) => {
  realm.create("HealthScore", { id: Date.now(), ...data });
};

export const getHealthScores = () => {
  let scores = realm.objects("HealthScore").sorted("updated_at", true); // sorted descending
  const total = scores.length;

  if (total > 1) {
    realm.write(() => {
      // ambil data yang lebih lama dari 1 terakhir
      const toDelete = scores.slice(1); // slice mulai index ke-1 (0..4 tetap)
      realm.delete(toDelete);
    });
    // update scores setelah dihapus
    scores = realm.objects("HealthScore").sorted("updated_at", true);
  }

  return scores.slice(0, 1); // pastikan hanya 3 data terbaru dikembalikan
};

export const calculateHealthScore = () => {
  const fuels = [...getFuelLogs()];
  const services = [...getServiceLogs()];
  if (fuels.length === 0) return;

  const avgConsumption = fuels.reduce((acc, f) => acc + (f.consumption || 0), 0) / fuels.length;
  const serviceCount = services.length;

  let score = 50 + avgConsumption * 10 + serviceCount * 5;
  score = Math.min(score, 100);

  // Jangan pakai write di sini, dipanggil dari transaction utama
  addHealthScore({ score, comment: "Auto calculated based on fuel & service logs", updated_at: new Date().toISOString() });
};
