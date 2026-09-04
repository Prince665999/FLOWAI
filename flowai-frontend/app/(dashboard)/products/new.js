import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { createProduct } from "../../../src/api/products";
import ProductForm from "../../../src/components/products/ProductForm";
import { useAuth } from "../../../src/hooks/useAuth";

export default function NewProductScreen() {
	const { token } = useAuth();
	const [saving, setSaving] = useState(false);
	const submit = async (payload) => { setSaving(true); try { await createProduct(token, payload); router.replace("/(dashboard)/products"); } catch (err) { Alert.alert("Unable to create product", err.message); } finally { setSaving(false); } };
	return <SafeAreaView style={styles.container}><Stack.Screen options={{ title: "New Product" }} /><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Create product</Text><Text style={styles.subtitle}>Price is entered in cents. For example, 89900 means $899.00.</Text><ProductForm onSubmit={submit} submitLabel={saving ? "Saving..." : "Create product"} /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f1f5f9" }, content: { padding: 20, gap: 12 }, title: { color: "#172033", fontSize: 24, fontWeight: "800" }, subtitle: { color: "#64748b", lineHeight: 20 } });
