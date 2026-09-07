import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getStaffTicket, updateStaffTicket } from "../../../src/api/support";
import TicketDetail from "../../../src/components/support/TicketDetail";

export default function TicketScreen() {
	const { ticketId } = useLocalSearchParams();
	const [ticket, setTicket] = useState();
	const [error, setError] = useState(null);

	useEffect(() => {
		getStaffTicket(ticketId).then(setTicket).catch((requestError) => setError(requestError.message));
	}, [ticketId]);

	if (error) return <View style={{ padding: 16 }}><Text>{error}</Text></View>;
	if (!ticket) return <ActivityIndicator />;
	return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}><TicketDetail ticket={ticket} editable onSave={async (updates) => { const updated = await updateStaffTicket(ticket.id, updates); setTicket(updated); }} /></KeyboardAvoidingView>;
}
