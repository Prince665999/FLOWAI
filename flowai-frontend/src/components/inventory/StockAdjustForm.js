import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function StockAdjustForm({ onSubmit }) {
	const [delta, setDelta] = useState("");
	const [reason, setReason] = useState("");
	return <View style={styles.form}><TextInput style={styles.input} placeholder="Quantity change (for example 10 or -2)" keyboardType="numeric" value={delta} onChangeText={setDelta} /><TextInput style={styles.input} placeholder="Reason" value={reason} onChangeText={setReason} /><Pressable style={styles.button} onPress={() => onSubmit({ quantity_delta: Number(delta), reason })}><Text style={styles.buttonText}>Adjust stock</Text></Pressable></View>;
}

const styles = StyleSheet.create({ form: { gap: 10 }, input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, color: "#172033" }, button: { backgroundColor: "#0f766e", padding: 14, borderRadius: 8, alignItems: "center" }, buttonText: { color: "#fff", fontWeight: "700" } });
