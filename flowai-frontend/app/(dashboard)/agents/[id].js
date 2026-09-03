import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { getAgentRun } from "../../../src/api/agents";
import { AgentRunSteps } from "../../../src/components/agent/AgentRunSteps";
import { useAuth } from "../../../src/hooks/useAuth";

export default function AgentRunDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [run, setRun] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const result = await getAgentRun(token, id); if (active) setRun(result); }
      catch (err) { if (active) setError(err.message || "Unable to load agent run"); }
    };
    if (token && id) load();
    const polling = setInterval(async () => {
      if (!active || !token || !id || !["queued", "running"].includes(run?.status)) return;
      const result = await getAgentRun(token, id).catch(() => null);
      if (result && active) setRun(result);
    }, 3000);
    return () => { active = false; clearInterval(polling); };
  }, [token, id, run?.status]);

  if (error) return <SafeAreaView style={styles.centered}><Text style={styles.error}>{error}</Text></SafeAreaView>;
  if (!run) return <SafeAreaView style={styles.centered}><ActivityIndicator color="#2563eb" /></SafeAreaView>;
  return <SafeAreaView style={styles.container}><Stack.Screen options={{ title: `Agent Run #${run.id}`, headerShown: true }} /><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>AGENT EXECUTION</Text><Text style={styles.title}>Run #{run.id}</Text><Text style={styles.objective}>{run.objective}</Text><AgentRunSteps run={run} /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" }, centered: { flex: 1, justifyContent: "center", alignItems: "center" }, content: { padding: 20 }, eyebrow: { color: "#2563eb", fontSize: 11, fontWeight: "800", letterSpacing: 1 }, title: { color: "#172033", fontSize: 26, fontWeight: "700", marginTop: 5 }, objective: { color: "#475569", lineHeight: 21, marginTop: 8 }, error: { color: "#b91c1c" },
});