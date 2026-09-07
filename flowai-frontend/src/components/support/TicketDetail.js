import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function TicketDetail({ ticket, editable = false, onSave }) {
	const [status, setStatus] = useState(ticket.status);
	const [resolution, setResolution] = useState(ticket.resolution || "");
	const [saving, setSaving] = useState(false);
	if (!ticket) return null;

	const save = async () => {
		setSaving(true);
		try { await onSave({ status, resolution }); } finally { setSaving(false); }
	};

	return <View style={{ padding: 16, gap: 10 }}><Text style={{ fontWeight: "700", fontSize: 18 }}>{ticket.subject}</Text><Text>{ticket.description}</Text><Text>Priority: {ticket.priority}</Text><Text>Status: {ticket.status}</Text>{editable ? <><TextInput value={resolution} onChangeText={setResolution} placeholder="Write guidance or resolution" multiline style={{ minHeight: 100, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10 }} /><View style={{ flexDirection: "row", gap: 8 }}>{["open", "in_progress", "resolved"].map((value) => <Pressable key={value} onPress={() => setStatus(value)} style={{ padding: 10, backgroundColor: status === value ? "#2563eb" : "#e2e8f0", borderRadius: 8 }}><Text style={{ color: status === value ? "#fff" : "#172033" }}>{value.replace("_", " ")}</Text></Pressable>)}</View><Pressable onPress={save} disabled={saving} style={{ padding: 12, backgroundColor: "#2563eb", borderRadius: 8, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>{saving ? "Saving..." : "Save assistance"}</Text></Pressable></> : ticket.resolution ? <Text>Resolution: {ticket.resolution}</Text> : null}</View>;
}
