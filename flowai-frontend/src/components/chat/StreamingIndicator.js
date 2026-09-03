import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function StreamingIndicator({ visible }) {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#2563eb" />
      <Text style={styles.text}>FLOWAI is thinking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  text: { color: "#64748b", fontSize: 13 },
});