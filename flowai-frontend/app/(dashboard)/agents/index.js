import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { listToolCalls } from "../../../src/api/agents";
import { ToolActivityItem } from "../../../src/components/agent/ToolActivityItem";
import { useAuth } from "../../../src/hooks/useAuth";

export default function AgentActivityScreen() {
  const { token } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCalls = async () => {
    try {
      setCalls(await listToolCalls(token));
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load tool activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadCalls(); }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.eyebrow}>AUTOMATION AUDIT</Text><Text style={styles.title}>Tool activity</Text><Text style={styles.subtitle}>Recent tools used by FLOWAI</Text></View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <View style={styles.centered}><ActivityIndicator color="#2563eb" /></View> : <FlatList data={calls} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} onRefresh={loadCalls} refreshing={loading} renderItem={({ item }) => <ToolActivityItem call={item} />} ListEmptyComponent={<Text style={styles.empty}>No tool calls yet.</Text>} />}
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
});