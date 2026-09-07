import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { listAgentRuns, startAgentRun } from "../../../src/api/agents";
import { useAuth } from "../../../src/hooks/useAuth";

export default function AgentActivityScreen() {
  const { token } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objective, setObjective] = useState("");
  const [starting, setStarting] = useState(false);

  const loadCalls = async () => {
    try {
      setCalls(await listAgentRuns(token));
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load tool activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadCalls(); }, [token]);

  const handleStartRun = async () => {
    if (!objective.trim() || starting) return;
    try {
      setStarting(true);
      const run = await startAgentRun(token, objective.trim());
      setObjective("");
      await loadCalls();
      router.push(`/agents/${run.id}`);
    } catch (err) {
      Alert.alert("Unable to start agent run", err.message || "Please try again");
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.eyebrow}>CONTROLLED AUTOMATION</Text><Text style={styles.title}>Agent activity</Text><Text style={styles.subtitle}>Plans and execution progress from FLOWAI agents</Text></View>
      <View style={styles.startBox}>
        <Text style={styles.startTitle}>Start an agent run</Text>
        <TextInput
          style={styles.input}
          value={objective}
          onChangeText={setObjective}
          placeholder="What should FLOWAI do?"
          placeholderTextColor="#64748b"
          multiline
        />
        <Pressable style={[styles.startButton, (!objective.trim() || starting) && styles.disabledButton]} onPress={handleStartRun} disabled={!objective.trim() || starting}>
          <Text style={styles.startButtonText}>{starting ? "Starting..." : "Start Run"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <View style={styles.centered}><ActivityIndicator color="#2563eb" /></View> : <FlatList data={calls} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} onRefresh={loadCalls} refreshing={loading} renderItem={({ item }) => <Pressable style={styles.item} onPress={() => router.push(`/agents/${item.id}`)}><View style={styles.itemHeader}><Text style={styles.itemTitle}>Run #{item.id}</Text><Text style={styles.status}>{item.status}</Text></View><Text style={styles.objective} numberOfLines={2}>{item.objective}</Text><Text style={styles.meta}>{item.steps?.length || 0} steps · {item.plan?.length || 0} planned</Text></Pressable>} ListEmptyComponent={<Text style={styles.empty}>No agent runs yet.</Text>} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, backgroundColor: "#0f172a" },
  eyebrow: { color: "#93c5fd", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  subtitle: { color: "#cbd5e1", marginTop: 5 },
  list: { padding: 16 },
  empty: { color: "#64748b", textAlign: "center", marginTop: 32 },
  error: { color: "#b91c1c", padding: 16 },
  startBox: { backgroundColor: "#ffffff", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  startTitle: { color: "#172033", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, color: "#172033", backgroundColor: "#f8fafc" },
  startButton: { marginTop: 10, backgroundColor: "#2563eb", borderRadius: 8, padding: 12, alignItems: "center" },
  disabledButton: { opacity: 0.5 },
  startButtonText: { color: "#ffffff", fontWeight: "700" },
  item: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, marginBottom: 10 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between" },
  itemTitle: { color: "#172033", fontWeight: "700", fontSize: 16 },
  status: { color: "#2563eb", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  objective: { color: "#334155", marginTop: 8, lineHeight: 19 },
  meta: { color: "#64748b", fontSize: 12, marginTop: 9 },
});