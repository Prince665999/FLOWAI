import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProductList({ products, onSelect }) {
	return products.map((product) => (
		<Pressable key={product.id} style={styles.card} onPress={() => onSelect(product)}>
			<View style={styles.row}><Text style={styles.name}>{product.name}</Text><Text style={styles.status}>{product.is_published ? "Published" : "Draft"}</Text></View>
			<Text style={styles.meta}>{product.sku} · {product.currency} {(product.price_amount / 100).toFixed(2)}</Text>
			<Text style={styles.description}>{product.short_description || product.description || "No description"}</Text>
		</Pressable>
	));
}

const styles = StyleSheet.create({ card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 14, marginBottom: 10 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, name: { color: "#172033", fontWeight: "700", flex: 1 }, status: { color: "#2563eb", fontSize: 12, fontWeight: "700" }, meta: { color: "#64748b", fontSize: 12, marginTop: 6 }, description: { color: "#475569", marginTop: 6 } });
