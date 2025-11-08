import { realm } from "./db";
import { calculateHealthScore } from "./healthService";

export const addServiceLog = (data) => {
  realm.write(() => {
    realm.create("ServiceLog", { id: Date.now(), ...data });

    calculateHealthScore();
  });
};

export const getServiceLogs = () => realm.objects("ServiceLog").sorted("date", true);

export const updateServiceLogStatus = (id, status) => {
  realm.write(() => {
    const log = realm.objectForPrimaryKey("ServiceLog", id);
    if (log) {
      log.is_complete = status;

      calculateHealthScore();
    } else {
      throw new Error("Service log not found");
    }
  });
};