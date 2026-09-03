import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { runWorkflow } from "../../../src/api/workflows";
import { WorkflowStatus } from "../../../src/components/workflow/WorkflowStatus";
import { useAuth } from "../../../src/hooks/useAuth";
import { useWorkflow } from "../../../src/hooks/useWorkflow";

export default function WorkflowDetailScreen() {
	const { id } = useLocalSearchParams();
	const { token } = useAuth();
	const { workflow, run, loading, error, setRun } = useWorkflow(token, id);
	const [running, setRunning] = useState(false);

	const startRun = async () => {
		setRunning(true);
		try { setRun(await runWorkflow(token, id)); } catch (err) { } finally { setRunning(false); }
	};

	if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color="#2563eb" /></SafeAreaView>;
	if (error || !workflow) return <SafeAreaView style={styles.centered}><Text style={styles.error}>{error || "Workflow not found"}</Text></SafeAreaView>;
	const latestRun = run || workflow.runs?.[0];
	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen options={{ title: workflow.name, headerShown: true }} />
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.eyebrow}>WORKFLOW DETAIL</Text><Text style={styles.title}>{workflow.name}</Text><Text style={styles.description}>{workflow.description || "No description"}</Text>
				<Pressable onPress={startRun} disabled={running} style={[styles.runButton, running && styles.disabled]}><Text style={styles.runText}>{running ? "Running..." : "Run workflow"}</Text></Pressable>
				<Text style={styles.sectionTitle}>Workflow steps</Text>
				{workflow.definition.nodes.map((node, index) => <View key={node.id} style={styles.node}><Text style={styles.nodeNumber}>{index + 1}</Text><View><Text style={styles.nodeName}>{node.id}</Text><Text style={styles.nodeType}>{node.type}</Text></View></View>)}
				<Text style={styles.sectionTitle}>Latest run</Text><WorkflowStatus run={latestRun} />
				{!latestRun ? <Text style={styles.empty}>Run this workflow to see step-by-step progress.</Text> : null}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f1f5f9" }, centered: { flex: 1, justifyContent: "center", alignItems: "center" }, content: { padding: 20 }, eyebrow: { color: "#2563eb", fontSize: 11, fontWeight: "800", letterSpacing: 1 }, title: { color: "#172033", fontSize: 26, fontWeight: "700", marginTop: 5 }, description: { color: "#64748b", marginTop: 8, lineHeight: 20 }, runButton: { backgroundColor: "#2563eb", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 20 }, disabled: { opacity: 0.6 }, runText: { color: "#fff", fontWeight: "700" }, sectionTitle: { color: "#172033", fontSize: 17, fontWeight: "700", marginTop: 24, marginBottom: 10 }, node: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: 13, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }, nodeNumber: { width: 28, height: 28, borderRadius: 14, textAlign: "center", paddingTop: 5, color: "#1d4ed8", backgroundColor: "#dbeafe", fontWeight: "700", marginRight: 12 }, nodeName: { color: "#172033", fontWeight: "600" }, nodeType: { color: "#64748b", fontSize: 12, marginTop: 2, textTransform: "capitalize" }, empty: { color: "#64748b", textAlign: "center", marginTop: 14 }, error: { color: "#b91c1c" },
});
