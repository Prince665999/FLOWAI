import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ProductForm({ initial = {}, onSubmit, submitLabel = "Save product" }) {
	const [form, setForm] = useState({ sku: initial.sku || "", name: initial.name || "", slug: initial.slug || "", price_amount: String(initial.price_amount || ""), brand: initial.brand || "", short_description: initial.short_description || "" });
	const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
	return <View style={styles.form}>{["sku", "name", "slug", "brand", "short_description", "price_amount"].map((key) => <TextInput key={key} style={styles.input} placeholder={key.replace("_", " ")} value={form[key]} onChangeText={(value) => set(key, value)} keyboardType={key === "price_amount" ? "numeric" : "default"} />)}<Pressable style={styles.button} onPress={() => onSubmit({ ...form, price_amount: Number(form.price_amount) })}><Text style={styles.buttonText}>{submitLabel}</Text></Pressable></View>;
}

const styles = StyleSheet.create({ form: { gap: 10 }, input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, color: "#172033" }, button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" }, buttonText: { color: "#fff", fontWeight: "700" } });
