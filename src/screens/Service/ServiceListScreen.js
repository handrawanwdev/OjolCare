// screens/Service/ServiceListScreen.js
import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CardItem from '../../components/CardItem';
import { getServiceLogs } from '../../db/serviceService';

export default function ServiceListScreen({ navigation }) {
  const [serviceLogs, setServiceLogs] = useState([]);

  // Refresh daftar service setiap kali screen difokuskan
  useFocusEffect(
    React.useCallback(() => {
      setServiceLogs([...getServiceLogs()]);
    }, []),
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
          renderItem={({ item }) => (
            <CardItem
              title={`${item.date} - ${item.component}`}
              subtitle={`Odometer: ${item.odometer} km | Biaya: ${item.cost}`}
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ServiceForm')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
});
