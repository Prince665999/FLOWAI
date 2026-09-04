import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { getProduct, updateProduct, publishProduct, unpublishProduct } from "../../../src/api/products";
import ProductForm from "../../../src/components/products/ProductForm";
import { useAuth } from "../../../src/hooks/useAuth";

export default function ProductDetailScreen() {
	const { id } = useLocalSearchParams(); const { token } = useAuth(); const [product, setProduct] = useState(null); const [error, setError] = useState(null);
	useEffect(() => { if (token && id) getProduct(token, id).then(setProduct).catch((err) => setError(err.message)); }, [token, id]);
	if (error) return <SafeAreaView style={styles.center}><Text style={styles.error}>{error}</Text></SafeAreaView>;
	if (!product) return <SafeAreaView style={styles.center}><ActivityIndicator color="#2563eb" /></SafeAreaView>;
	const save = async (payload) => { try { const updated = await updateProduct(token, id, payload); setProduct(updated); Alert.alert("Saved", "Product updated."); } catch (err) { Alert.alert("Unable to save", err.message); } };
	const toggle = async () => { try { const updated = product.is_published ? await unpublishProduct(token, id) : await publishProduct(token, id); setProduct(updated); } catch (err) { Alert.alert("Unable to change publication", err.message); } };
	return <SafeAreaView style={styles.container}><Stack.Screen options={{ title: product.name }} /><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>{product.name}</Text><Text style={styles.status}>{product.is_published ? "Published" : "Draft"}</Text><ProductForm initial={product} onSubmit={save} /><Text style={styles.action} onPress={toggle}>{product.is_published ? "Unpublish product" : "Publish product"}</Text><Text style={styles.action} onPress={() => router.push(`/(dashboard)/inventory/${id}`)}>Manage inventory</Text></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f1f5f9" }, content: { padding: 20, gap: 12 }, center: { flex: 1, justifyContent: "center", alignItems: "center" }, title: { color: "#172033", fontSize: 24, fontWeight: "800" }, status: { color: "#2563eb", fontWeight: "700" }, action: { color: "#2563eb", fontWeight: "700", paddingVertical: 10 }, error: { color: "#b91c1c" } });
