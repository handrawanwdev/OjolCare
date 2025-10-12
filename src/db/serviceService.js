import { realm } from "./db";
import { addAlert } from "./alertService";
import { calculateHealthScore } from "./healthService";

export const addServiceLog = (data) => {
  realm.write(() => {
    realm.create("ServiceLog", { id: Date.now(), ...data });

    // trigger service alert
    const nextDue = data.odometer + 1000; // interval servis
    addAlert({ type: "Service", message: `Service due around ${nextDue} km`, date: new Date().toISOString(), status: "unread" });

    calculateHealthScore();
  });
};

export const getServiceLogs = () => realm.objects("ServiceLog").sorted("date", true);
