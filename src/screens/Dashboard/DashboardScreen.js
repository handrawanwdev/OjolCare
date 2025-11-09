// screens/Dashboard/DashboardScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { getFuelLogs } from '../../db/fuelService';
import { notifyFuelAndServiceAlerts } from '../../db/alertService';
import { getSettings } from '../../db/settingsService';
import { calculateFuelStats } from '../../utils/fuelCalculator';

// Reusable InfoCard
const InfoCard = ({ icon, colors, label, value }) => (
  <View style={styles.infoCard}>
    <LinearGradient colors={colors} style={styles.gradient}>
      <Icon name={icon} size={36} color="#fff" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </LinearGradient>
  </View>
);

export default function DashboardScreen() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    avgConsumption: "0.00",
    predictedRange: "0.0",
    remainingRange: "0.0",
    remainingFuelFromRange: "0.0",
  });

  useFocusEffect(
    React.useCallback(() => {
      const fuelLogs = getFuelLogs() || [];
      const settings = getSettings() || {};
      const tankCapacity = Number(settings.tank_capacity);
      let fuelLogsMap = fuelLogs.map((item)=>item);
      
      const calculated = calculateFuelStats(fuelLogsMap, tankCapacity);

      setStats({
        avgConsumption: calculated.avgConsumption,
        predictedRange: calculated.predictedRange,
        remainingRange: calculated.remainingRange,
        remainingFuelFromRange: calculated.remainingFuelFromRange,
      });

      setAlerts(notifyFuelAndServiceAlerts() || []);
    }, [])
  );

  const isNoData = stats.avgConsumption === 0 && stats.predictedRange === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Dashboard</Text>

      {/* No Data */}
      {isNoData && (
        <View style={styles.noDataCard}>
          <Icon name="information" size={28} color="#92400E" />
          <Text style={styles.noDataText}>
            ⛽ Tambahkan minimal 2 catatan pengisian bahan bakar untuk melihat statistik.
          </Text>
        </View>
      )}

      {/* Info Cards */}
      <InfoCard
        icon="fuel"
        colors={['#4F46E5', '#6366F1']}
        label="Konsumsi Rata-rata"
        value={`${stats.avgConsumption} km/L`}
      />
      <InfoCard
        icon="map-marker-distance"
        colors={['#10B981', '#34D399']}
        label="Prediksi Jarak Tangki Penuh"
        value={`${stats.predictedRange} km`}
      />
      <InfoCard
        icon="gas-station"
        colors={['#F59E0B', '#FBBF24']}
        label="Sisa Jarak & Bensin"
        value={`${stats.remainingRange} km / ${stats.remainingFuelFromRange} L`}
      />

      {/* Alerts */}
      <Text style={styles.subheading}>Alerts</Text>
      {alerts.length === 0 ? (
        <Text style={styles.noData}>Tidak ada alert</Text>
      ) : (
        alerts.filter(alert => !alert.is_complete).map(alert => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              { backgroundColor: alert.status === 'unread' ? '#FEF3C7' : '#F3F4F6' },
            ]}
          >
            <Icon
              name="bell-alert"
              size={24}
              color={alert.type === 'Fuel' ? '#F59E0B' : '#EF4444'}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertMeta}>{alert.type} | {alert.date}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, paddingTop: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  subheading: { fontSize: 20, fontWeight: '600', color: '#111827', marginTop: 24, marginBottom: 12 },
  infoCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16 },
  infoText: { marginLeft: 12 },
  infoLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertMessage: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  alertMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  noData: { color: '#6B7280', fontStyle: 'italic' },
  noDataCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  noDataText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginLeft: 8,
  },
});
 