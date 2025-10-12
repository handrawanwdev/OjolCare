import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import CardItem from "../../components/CardItem";
import { getHealthScores } from "../../db/healthService";

export default function HealthScreen() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    setScores([...getHealthScores()]);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem title={`Score: ${item.score}`} subtitle={`${item.comment} - ${item.updated_at}`} />
        )}
      />
      {scores.length === 0 && <Text style={styles.empty}>No health data</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "#555" },
});
