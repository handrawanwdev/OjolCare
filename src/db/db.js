// db/realm.js
import Realm from "realm";

// ======= Schemas =======
export const FuelLogSchema = {
  name: "FuelLog",
  primaryKey: "id",
  properties: {
    id: "int",
    date: "string",
    time: "string",
    liter: "double",
    price: "double",
    odometer: "double",
    fuel_type: "string",
    consumption: "double?",
    prediction: "double?"
  }
};

export const ServiceLogSchema = {
  name: "ServiceLog",
  primaryKey: "id",
  properties: {
    id: "int",
    component: "string",
    odometer: "double",
    cost: "double",
    date: "string",
    note: "string?"
  }
};

export const SettingsSchema = {
  name: "Settings",
  primaryKey: "id",
  properties: {
    id: "int",
    tank_capacity: "double",
    avg_consumption: "double",
    daily_distance: "double",
    fuel_low_km: "double?",
    service_interval: "double?"
  }
};

export const AlertSchema = {
  name: "Alert",
  primaryKey: "id",
  properties: {
    id: "int",
    type: "string",
    message: "string",
    date: "string",
    status: "string"
  }
};

export const HealthScoreSchema = {
  name: "HealthScore",
  primaryKey: "id",
  properties: {
    id: "int",
    score: "double",
    comment: "string",
    updated_at: "string"
  }
};

// ======= Realm Instance =======
export const realm = new Realm({
  path: "ojolmate.realm",
  schema: [FuelLogSchema, ServiceLogSchema, SettingsSchema, AlertSchema, HealthScoreSchema],
  schemaVersion: 1
});

// ======= Listener Helper =======
export const addListener = (schemaName, callback) => {
  const objects = realm.objects(schemaName);
  objects.addListener((collection, changes) => {
    callback([...collection]);
  });
  return () => objects.removeAllListeners();
};

// ======= Reset Database =======
const resetDatabase = () => {
  realm.write(() => {
    realm.deleteAll();
  });
};

const initializeSettings = () => {
  const settings = realm.objects("Settings");
  if (settings.length === 0) {
    realm.write(() => {
      realm.create("Settings", {
        id: 1,
        tank_capacity: 10.0,
        avg_consumption: 0.0,
        daily_distance: 0.0,
        fuel_low_km: 50.0,
        service_interval: 1000.0
      });
    });
  }
}
// resetDatabase();
initializeSettings();
