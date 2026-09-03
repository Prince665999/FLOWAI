import { StyleSheet, Text, View } from "react-native";

export function ToolActivityItem({ call }) {
  const succeeded = call.status === "succeeded";
  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.name}>{call.tool_name}</Text>
        <Text style={[styles.status, succeeded ? styles.success : styles.failure]}>{call.status}</Text>
      </View>
      <Text style={styles.label}>Arguments</Text>
      <Text style={styles.code}>{JSON.stringify(call.arguments)}</Text>
      {call.result ? <><Text style={styles.label}>Result</Text><Text style={styles.code}>{JSON.stringify(call.result)}</Text></> : null}
      {call.error ? <Text style={styles.error}>{call.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  name: { color: "#172033", fontSize: 16, fontWeight: "700" },
  status: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  success: { color: "#15803d" },
  failure: { color: "#b91c1c" },
  label: { color: "#64748b", fontSize: 11, fontWeight: "700", marginTop: 6, marginBottom: 3, textTransform: "uppercase" },
  code: { color: "#334155", fontSize: 12 },
  error: { color: "#b91c1c", fontSize: 12, marginTop: 8 },
});