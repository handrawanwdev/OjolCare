import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CardItem from '../../components/CardItem';
import { getServiceLogs, updateServiceLogStatus } from '../../db/serviceService';

export default function ServiceListScreen({ navigation }) {
  const [serviceLogs, setServiceLogs] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Refresh daftar service setiap kali screen difokuskan
  useFocusEffect(
    React.useCallback(() => {
      const logs = [...getServiceLogs()];
      setServiceLogs(logs);

      // Otomatis tampilkan modal untuk log pertama yang belum punya status
      const firstPending = logs.find(
        l => typeof l.is_complete !== 'boolean'
      );
      if (firstPending) {
        setSelectedLog(firstPending);
        setConfirmVisible(true);
      }
    }, []),
  );

  const openConfirm = (log) => {
    setSelectedLog(log);
    setConfirmVisible(true);
  };

  const handleSetStatus = (status) => {
    if (!selectedLog) return;
    // Update di "DB"/storage
    try {
      updateServiceLogStatus(selectedLog.id, status);
    } catch (e) {
      // Jika implementasi penyimpanan perlu async/berbeda, tangani sesuai kebutuhan
      console.warn('Gagal update status log:', e);
    }
    console.log(selectedLog.id, status);
    
    // Update di state UI
    setServiceLogs(prev =>
      prev.map(l => (l.id === selectedLog.id ? { ...l, is_complete: status } : l))
    );

    setConfirmVisible(false);
    setSelectedLog(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => openConfirm(item)}>
      <CardItem
        title={`${item.date} - ${item.component}`}
        subtitle={`Odometer: ${item.odometer} km | Biaya: ${item.cost}`}
        rightContent={
          <View style={[styles.badge, item.is_complete ? styles.badgeSuccess : styles.badgePending]}>
            <Text style={styles.badgeText}>
              {typeof item.is_complete === 'boolean'
                ? item.is_complete ? 'Selesai' : 'Belum'
                : 'Perlu Konfirmasi'}
            </Text>
          </View>
        }
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Service</Text>
      </View>

      {/* List Service */}
      {serviceLogs.length === 0 ? (
        <Text style={styles.noData}>Belum ada riwayat service</Text>
      ) : (
        <FlatList
          data={serviceLogs}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ServiceForm')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal Konfirmasi */}
      <Modal
        visible={confirmVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sudah di-service?</Text>
            <Text style={styles.modalText}>
              {selectedLog
                ? `Tandai status untuk: ${selectedLog.component} (${selectedLog.date})`
                : 'Tandai status service'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnSecondary]}
                onPress={() => handleSetStatus(false)}
              >
                <Text style={styles.btnSecondaryText}>Belum</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnPrimary]}
                onPress={() => handleSetStatus(true)}
              >
                <Text style={styles.btnPrimaryText}>Sudah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
    fontSize: 16,
  },

  // Badge status di kanan CardItem
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: '#E5E7EB',
  },
  btnSecondaryText: {
    color: '#111827',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#4F46E5',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalClose: {
    marginTop: 12,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#6B7280',
  },
});