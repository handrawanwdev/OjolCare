import { realm } from "./db";
import { addAlert } from "./alertService";
import { calculateHealthScore } from "./healthService";
import { getSettings } from "./settingsService";

export const addFuelLog = (data) => {
  realm.write(() => {
    const lastLog = realm.objects("FuelLog").sorted("date", true).sorted("time", true)[0];
    const consumption = lastLog ? (data.odometer - lastLog.odometer) / data.liter : 0;
    const prediction = data.liter * (consumption || 0);

    realm.create("FuelLog", { id: Date.now(), ...data, consumption, prediction });

    calculateHealthScore();
  });
};

export const getLastLog = () => {
  return realm.objects("FuelLog").sorted("date", true).sorted("time", true)[0];
}

export const getFuelLogs = () => realm.objects("FuelLog").sorted("date", true).sorted("time", true);
