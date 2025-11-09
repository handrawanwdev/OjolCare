import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import ButtonPrimary from "../../components/ButtonPrimary";
import { getSettings, updateSettings } from "../../db/settingsService";
import { getAlerts, markAlertRead } from "../../db/alertService";
import { getHealthScores } from "../../db/healthService";
import { getFuelLogs } from "../../db/fuelService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function SettingsScreen() {
  const [form, setForm] = useState({
    tank_capacity: "5",
    avg_consumption: "40",
    daily_distance: "80",
    fuel_low_km: "50",
    service_interval: "5000"
  });
  const [health, setHealth] = useState([]);
  const [lastOdometer, setLastOdometer] = useState(0);

  useEffect(() => {
    const s = getSettings();
    setForm({
      tank_capacity: s?.tank_capacity?.toString() || "5",
      avg_consumption: s?.avg_consumption?.toString() || "40",
      daily_distance: s?.daily_distance?.toString() || "80",
      fuel_low_km: s?.fuel_low_km?.toString() || "50",
      service_interval: s?.service_interval?.toString() || "5000"
    });

    setHealth([...getHealthScores()]);

    const fuelLogs = getFuelLogs();
    if (fuelLogs.length > 0) setLastOdometer(fuelLogs[0].odometer);
  }, []);

  const handleSave = () => {
    updateSettings({
      tank_capacity: Number(form.tank_capacity),
      avg_consumption: Number(form.avg_consumption),
      daily_distance: Number(form.daily_distance),
      fuel_low_km: Number(form.fuel_low_km),
      service_interval: Number(form.service_interval)
    });
    Alert.alert("Sukses", "Pengaturan berhasil diperbarui!");
  };


  const renderInput = (label, key, recommended) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form[key]}
        onChangeText={(text) => setForm({ ...form, [key]: text })}
        placeholder={`Rekomendasi: ${recommended}`}
        placeholderTextColor="#aaa"
      />
      {key === "fuel_low_km" && Number(form.fuel_low_km) < 20 && (
        <Text style={styles.warningText}>⚠ Ambang batas terlalu rendah, risiko kehabisan bensin</Text>
      )}
      {key === "service_interval" && lastOdometer > 0 && Number(form.service_interval) - lastOdometer < 500 && (
        <Text style={styles.warningText}>⚠ Jarak servis hampir tercapai</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan</Text>
      </View>
      {renderInput("Kapasitas Tangki (L)", "tank_capacity", 5)}
      {/* {renderInput("Konsumsi Rata-rata (km/L)", "avg_consumption", 40)} */}
      {/* {renderInput("Jarak Harian (km)", "daily_distance", 80)} */}
      {renderInput("Ambang Batas Bensin (km)", "fuel_low_km", 50)}
      {/* {renderInput("Interval Servis (km)", "service_interval", 5000)} */}
      <ButtonPrimary title="Simpan Pengaturan" onPress={handleSave} style={{ marginBottom: 20 }} />

      <Text style={styles.sectionTitle}>Kesehatan Kendaraan</Text>
      {health.length === 0 ? <Text>Tidak ada data kesehatan</Text> :
        health.map((h) => (
          <View key={h.id} style={styles.card}>
            <Text style={{ fontWeight: "600" }}>Skor: {h.score}</Text>
            <Text>Komentar: {h.comment}</Text>
            <Text style={styles.date}>{h.updated_at}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 12 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  warningText: { color: "#F59E0B", marginTop: 4, fontSize: 12, fontWeight: "600" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10 },
  unreadCard: { backgroundColor: "#FEF3C7" },
  date: { fontSize: 12, color: "#6B7280", marginTop: 4 }
});
