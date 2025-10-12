import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import { getAlerts, updateAlertStatus } from "../../db/alertService";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    setAlerts([...getAlerts()]);
  }, []);

  const markRead = (id) => {
    updateAlertStatus(id, "read");
    setAlerts([...getAlerts()]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem title={`${item.type} - ${item.message}`} subtitle={`${item.date} | Status: ${item.status}`}>
            {item.status === "unread" && <ButtonPrimary title="Mark Read" onPress={() => markRead(item.id)} style={{ marginTop: 8 }} />}
          </CardItem>
        )}
      />
      {alerts.length === 0 && <Text style={styles.empty}>No alerts</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "#555" },
});
