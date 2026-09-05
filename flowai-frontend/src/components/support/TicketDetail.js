import { Text, View } from "react-native";
export default function TicketDetail({ ticket }) { if(!ticket)return null; return <View style={{padding:16,gap:8}}><Text style={{fontWeight:"700",fontSize:18}}>{ticket.subject}</Text><Text>{ticket.description}</Text><Text>Status: {ticket.status}</Text>{ticket.resolution?<Text>Resolution: {ticket.resolution}</Text>:null}</View>; }
