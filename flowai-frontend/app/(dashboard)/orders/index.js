import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { listCustomerOrders, listOrders } from "../../../src/api/orders";
import { AuthContext } from "../../../src/context/AuthContext";

export default function OrdersScreen() {
	const { user } = useContext(AuthContext);
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadOrders = user?.is_customer ? listCustomerOrders : listOrders;
		loadOrders()
			.then(setOrders)
			.catch((requestError) => setError(requestError.message))
			.finally(() => setLoading(false));
	}, [user?.is_customer]);

	if (loading) return <ActivityIndicator />;
	if (error) return <View style={{ padding: 16 }}><Text>Unable to load orders: {error}</Text></View>;

	return <View style={{ padding: 16 }}><Text style={{ fontSize: 24, fontWeight: "700" }}>Orders</Text><FlatList data={orders} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <Pressable onPress={() => router.push(`/(dashboard)/orders/${item.id}`)} style={{ padding: 14, borderBottomWidth: 1, borderColor: "#ddd" }}><Text>{item.order_number}</Text><Text>{item.status} · {item.payment_status}</Text></Pressable>} /></View>;
}
