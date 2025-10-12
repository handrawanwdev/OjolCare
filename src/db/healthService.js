import { realm } from "./db";
import { getFuelLogs } from "./fuelService";
import { getServiceLogs } from "./serviceService";

// Hanya buat object, jangan panggil write
export const addHealthScore = (data) => {
  realm.create("HealthScore", { id: Date.now(), ...data });
};

export const getHealthScores = () => realm.objects("HealthScore").sorted("updated_at", true);

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
