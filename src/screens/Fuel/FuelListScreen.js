// screens/Fuel/FuelListScreen.js
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import CardItem from "../../components/CardItem";
import { getFuelLogs } from "../../db/fuelService";

export default function FuelListScreen({ navigation }) {
  const [fuelLogs, setFuelLogs] = useState([]);

  // Update daftar setiap kali screen difokuskan
  useFocusEffect(
    React.useCallback(() => {
      setFuelLogs([...getFuelLogs()].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)));
    }, [])
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const abbreviateNumber = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Pastikan angka bersih
    const numericValue = Number(value.toString().replace(/\D/g, ''));
    if (isNaN(numericValue)) return '';

    // Format singkatan
    if (numericValue >= 1000000) {
      return (numericValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (numericValue >= 1000) {
      return (numericValue / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
      // Format ribuan biasa
      return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Pastikan angka bersih
    const numericValue = Number(value.toString().replace(/\D/g, ''));
    if (isNaN(numericValue)) return '';

    // Format ribuan biasa
    return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Bensin</Text>
      </View>

      {/* List Fuel */}
      {fuelLogs.length === 0 ? (
        <Text style={styles.noData}>Belum ada riwayat bensin</Text>
      ) : (
        <FlatList
          data={fuelLogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CardItem
              title={`${formatDate(item.date)} ${item.time} - ${item.liter} L - ${item.fuel_type}`}
              subtitle={`Odometer: ${formatNumber(item.odometer)} km | Biaya: ${abbreviateNumber(item.price)}`}
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("FuelForm")}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
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
  noData: { textAlign: "center", marginTop: 20, color: "#6B7280", fontSize: 16 },
});
