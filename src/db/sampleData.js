import { addFuelLog } from "./fuelService";
import { addServiceLog } from "./serviceService";

// ==== SAMPLE FUEL LOGS ====
export const seedFuelLogs = () => {
  addFuelLog({
    id: 1,
    date: "2025-10-12",
    time: "08:00:00",
    liter: 0.8, // < 10% tangki → trigger alert
    price: 12000,
    odometer: 1500,
    fuel_type: "Pertalite",
  });

  addFuelLog({
    id: 2,
    date: "2025-10-11",
    time: "09:00:00",
    liter: 5, // normal
    price: 10000,
    odometer: 1000,
    fuel_type: "Pertamax",
  });

  addFuelLog({
    id: 3,
    date: "2025-10-10",
    time: "18:00:00",
    liter: 0.5, // < 10% tangki → trigger alert
    price: 11500,
    odometer: 1300,
    fuel_type: "Solar",
  });
};

// ==== SAMPLE SERVICE LOGS ====
export const seedServiceLogs = () => {
  addServiceLog({
    id: 1,
    component: "Oli Mesin",
    odometer: 4950, // mendekati 5000 → trigger alert
    cost: 200000,
    date: "2025-10-10",
    note: "Ganti oli rutin",
  });

  addServiceLog({
    id: 2,
    component: "Rem Belakang",
    odometer: 2000, // aman
    cost: 150000,
    date: "2025-09-01",
    note: "Cek rutin",
  });

  addServiceLog({
    id: 3,
    component: "Filter Udara",
    odometer: 4980, // mendekati 5000 → trigger alert
    cost: 50000,
    date: "2025-10-11",
    note: "Ganti filter",
  });
};
