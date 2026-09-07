import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCustomerOrder, getOrder } from "../../../src/api/orders";
import OrderDetailCard from "../../../src/components/orders/OrderDetailCard";
import { AuthContext } from "../../../src/context/AuthContext";

export default function OrderScreen() {
	const { id } = useLocalSearchParams();
	const { user } = useContext(AuthContext);
	const [order, setOrder] = useState();
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadOrder = user?.is_customer ? getCustomerOrder : getOrder;
		loadOrder(id).then(setOrder).catch((requestError) => setError(requestError.message));
	}, [id, user?.is_customer]);

	return <View style={{ padding: 16 }}>{error ? <Text>Unable to load order: {error}</Text> : order ? <OrderDetailCard order={order} /> : <ActivityIndicator />}</View>;
}
