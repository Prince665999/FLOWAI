import { StyleSheet, Text, View } from "react-native";

const colors = { succeeded: "#15803d", running: "#2563eb", failed: "#b91c1c", queued: "#64748b" };

export function AgentRunSteps({ run }) {
  if (!run) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.heading}>Execution steps</Text><Text style={{ color: colors[run.status] || "#64748b", fontWeight: "800", textTransform: "uppercase", fontSize: 12 }}>{run.status}</Text></View>
      {run.steps?.map((step) => (
        <View key={step.step} style={styles.step}>
          <View style={[styles.dot, { backgroundColor: colors[step.status] || "#64748b" }]} />
          <View style={styles.body}><Text style={styles.title}>{step.step}. {step.description}</Text><Text style={styles.meta}>{step.tool || "reasoning"} · {step.status}</Text>{step.observation ? <Text style={styles.observation}>{JSON.stringify(step.observation)}</Text> : null}{step.error ? <Text style={styles.error}>{step.error}</Text> : null}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  heading: { color: "#172033", fontSize: 16, fontWeight: "700" },
  step: { flexDirection: "row", paddingTop: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: 12 },
  body: { flex: 1 },
  title: { color: "#172033", fontSize: 14, fontWeight: "600" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 3, textTransform: "capitalize" },
  observation: { color: "#475569", fontSize: 12, marginTop: 6 },
  error: { color: "#b91c1c", fontSize: 12, marginTop: 6 },
});