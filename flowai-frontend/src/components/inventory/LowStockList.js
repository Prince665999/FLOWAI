import { StyleSheet, Text, View } from "react-native";

export default function LowStockList({ items }) {
	return items.length ? items.map((item) => <View key={item.id} style={styles.item}><Text style={styles.title}>Product #{item.product_id}</Text><Text style={styles.meta}>{item.available_quantity} available · reorder at {item.reorder_level}</Text></View>) : <Text style={styles.empty}>No low-stock products.</Text>;
}

const styles = StyleSheet.create({ item: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fed7aa", borderRadius: 8, padding: 12, marginBottom: 8 }, title: { color: "#9a3412", fontWeight: "700" }, meta: { color: "#c2410c", marginTop: 4 }, empty: { color: "#64748b" } });
