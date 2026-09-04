import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { listWorkflows } from "../../../src/api/workflows";
import { useAuth } from "../../../src/hooks/useAuth";

export default function WorkflowsScreen() {
	const { token } = useAuth();
	const [workflows, setWorkflows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const load = async () => {
		try { setWorkflows(await listWorkflows(token)); setError(null); }
		catch (err) { setError(err.message || "Unable to load workflows"); }
		finally { setLoading(false); }
	};
	useEffect(() => { if (token) load(); }, [token]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}><Text style={styles.eyebrow}>AUTOMATION</Text><Text style={styles.title}>Workflows</Text><Text style={styles.subtitle}>Run and monitor business processes</Text></View>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			{loading ? <View style={styles.centered}><ActivityIndicator color="#2563eb" /></View> : <FlatList data={workflows} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} onRefresh={load} refreshing={loading} renderItem={({ item }) => <Pressable style={styles.item} onPress={() => router.push(`/workflows/${item.id}`)}><View style={styles.itemTop}><Text style={styles.itemTitle}>{item.name}</Text><View style={[styles.badge, item.is_active ? styles.active : styles.inactive]}><Text style={styles.badgeText}>{item.is_active ? "Active" : "Paused"}</Text></View></View><Text style={styles.description}>{item.description || "No description"}</Text><Text style={styles.meta}>{item.definition?.nodes?.length || 0} nodes</Text></Pressable>} ListEmptyComponent={<Text style={styles.empty}>No workflows yet.</Text>} />}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f1f5f9" }, centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: { padding: 20, backgroundColor: "#0f172a" }, eyebrow: { color: "#93c5fd", fontSize: 11, fontWeight: "700", letterSpacing: 1 }, title: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 }, subtitle: { color: "#cbd5e1", marginTop: 5 }, list: { padding: 16 }, item: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginBottom: 10 }, itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, itemTitle: { color: "#172033", fontSize: 16, fontWeight: "700", flex: 1 }, description: { color: "#64748b", marginTop: 8 }, meta: { color: "#94a3b8", fontSize: 12, marginTop: 10 }, badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }, active: { backgroundColor: "#dcfce7" }, inactive: { backgroundColor: "#e2e8f0" }, badgeText: { color: "#334155", fontSize: 11, fontWeight: "700" }, empty: { color: "#64748b", textAlign: "center", marginTop: 32 }, error: { color: "#b91c1c", padding: 16 },
});
