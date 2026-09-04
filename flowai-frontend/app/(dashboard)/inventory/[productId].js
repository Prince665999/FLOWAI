import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { adjustInventory, getInventory } from "../../../src/api/inventory";
import StockAdjustForm from "../../../src/components/inventory/StockAdjustForm";
import { useAuth } from "../../../src/hooks/useAuth";

export default function InventoryDetailScreen() { const { productId } = useLocalSearchParams(); const { token } = useAuth(); const [item, setItem] = useState(null); const [error, setError] = useState(null); const load = () => getInventory(token, productId).then(setItem).catch((err) => setError(err.message)); useEffect(() => { if (token && productId) load(); }, [token, productId]); if (error) return <SafeAreaView style={styles.center}><Text style={styles.error}>{error}</Text></SafeAreaView>; if (!item) return <SafeAreaView style={styles.center}><ActivityIndicator color="#2563eb" /></SafeAreaView>; const submit = async (payload) => { try { setItem(await adjustInventory(token, productId, payload)); Alert.alert("Saved", "Inventory adjusted."); } catch (err) { Alert.alert("Unable to adjust stock", err.message); } }; return <SafeAreaView style={styles.container}><Stack.Screen options={{ title: `Inventory #${productId}` }} /><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Product #{productId}</Text><Text style={styles.meta}>{item.available_quantity} available · {item.quantity_on_hand} on hand · {item.quantity_reserved} reserved</Text><StockAdjustForm onSubmit={submit} /></ScrollView></SafeAreaView>; }

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f1f5f9" }, content: { padding: 20, gap: 12 }, center: { flex: 1, justifyContent: "center", alignItems: "center" }, title: { color: "#172033", fontSize: 24, fontWeight: "800" }, meta: { color: "#64748b" }, error: { color: "#b91c1c" } });
