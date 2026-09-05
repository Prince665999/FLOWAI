import { StyleSheet, Text, View } from "react-native";
export default function OrderDetailCard({ order }) { return <View style={styles.card}><Text style={styles.title}>{order.order_number}</Text><Text>Status: {order.status}</Text><Text>Payment: {order.payment_status}</Text><Text>Total: {order.currency} {(order.total_amount / 100).toFixed(2)}</Text>{order.items?.map((item) => <Text key={item.id}>{item.quantity} × {item.product_name}</Text>)}</View>; }
const styles=StyleSheet.create({card:{backgroundColor:"#fff",padding:16,borderRadius:12,gap:6},title:{fontSize:18,fontWeight:"700"}});
