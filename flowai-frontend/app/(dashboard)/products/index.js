import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { listProducts } from "../../../src/api/products";
import ProductList from "../../../src/components/products/ProductList";
import { useAuth } from "../../../src/hooks/useAuth";

export default function ProductsScreen() {
	const { token } = useAuth();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const load = async () => { try { setProducts(await listProducts(token)); setError(null); } catch (err) { setError(err.message); } finally { setLoading(false); } };
	useEffect(() => { if (token) load(); }, [token]);
	return <SafeAreaView style={styles.container}><View style={styles.header}><View><Text style={styles.eyebrow}>COMMERCE</Text><Text style={styles.title}>Products</Text><Text style={styles.subtitle}>Manage the customer catalog</Text></View><Pressable style={styles.button} onPress={() => router.push("/(dashboard)/products/new")}><Text style={styles.buttonText}>Add product</Text></Pressable></View>{error ? <Text style={styles.error}>{error}</Text> : null}{loading ? <ActivityIndicator style={styles.loader} color="#2563eb" /> : <ScrollView contentContainerStyle={styles.list}><ProductList products={products} onSelect={(product) => router.push(`/(dashboard)/products/${product.id}`)} /></ScrollView>}</SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f1f5f9" }, header: { padding: 20, backgroundColor: "#0f172a", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, eyebrow: { color: "#93c5fd", fontSize: 11, fontWeight: "700", letterSpacing: 1 }, title: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 }, subtitle: { color: "#cbd5e1", marginTop: 5 }, button: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 }, buttonText: { color: "#fff", fontWeight: "700" }, list: { padding: 16 }, loader: { marginTop: 32 }, error: { color: "#b91c1c", padding: 16 } });
