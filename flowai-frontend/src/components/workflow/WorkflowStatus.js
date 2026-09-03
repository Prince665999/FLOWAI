import { StyleSheet, Text, View } from "react-native";

const colors = { succeeded: "#15803d", running: "#2563eb", failed: "#b91c1c", retrying: "#b45309", awaiting_approval: "#b45309", pending: "#64748b", queued: "#64748b" };

export function WorkflowStatus({ run }) {
	if (!run) return null;
	return (
		<View style={styles.container}>
			<View style={styles.runHeader}><Text style={styles.runTitle}>Run #{run.id}</Text><Text style={[styles.status, { color: colors[run.status] || colors.pending }]}>{run.status.replace("_", " ")}</Text></View>
			{run.steps?.map((step) => (
				<View key={step.id} style={styles.step}>
					<View style={[styles.dot, { backgroundColor: colors[step.status] || colors.pending }]} />
					<View style={styles.stepBody}><Text style={styles.stepName}>{step.node_id}</Text><Text style={styles.stepType}>{step.node_type} · {step.status.replace("_", " ")}</Text></View>
				</View>
			))}
			{run.error ? <Text style={styles.error}>{run.error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginTop: 16 },
	runHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
	runTitle: { color: "#172033", fontSize: 16, fontWeight: "700" },
	status: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
	step: { flexDirection: "row", alignItems: "center", paddingTop: 14 },
	dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
	stepBody: { flex: 1 },
	stepName: { color: "#172033", fontSize: 14, fontWeight: "600" },
	stepType: { color: "#64748b", fontSize: 12, marginTop: 2, textTransform: "capitalize" },
	error: { color: "#b91c1c", marginTop: 12, fontSize: 12 },
});
