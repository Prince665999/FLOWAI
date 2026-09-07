import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { listStaffTickets } from "../../../src/api/support";
import TicketQueue from "../../../src/components/support/TicketQueue";
import { AuthContext } from "../../../src/context/AuthContext";

export default function SupportScreen() {
	const { user } = useContext(AuthContext);
	const [tickets, setTickets] = useState();
	const [error, setError] = useState(null);
	const isStaff = user?.account_type === "staff" || user?.is_superuser;

	useEffect(() => {
		if (!isStaff) return;
		listStaffTickets().then(setTickets).catch((requestError) => setError(requestError.message));
	}, [isStaff]);

	if (!isStaff) return <View style={{ padding: 16 }}><Text>Customer support is available to internal staff accounts.</Text></View>;
	if (error) return <View style={{ padding: 16 }}><Text>Unable to load support tickets: {error}</Text></View>;
	return <View style={{ padding: 16 }}>{tickets ? <TicketQueue tickets={tickets} onSelect={(ticket) => router.push(`/(dashboard)/support/${ticket.id}`)} /> : <ActivityIndicator />}</View>;
}
