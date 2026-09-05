import { Pressable, StyleSheet, Text, View } from "react-native";
const statuses=["pending","confirmed","processing","fulfilled","shipped","delivered","cancelled"];
export default function OrderStatusEditor({ value, onChange, disabled }) { return <View style={styles.row}>{statuses.map((status)=><Pressable disabled={disabled} key={status} onPress={()=>onChange(status)} style={[styles.item,value===status&&styles.selected]}><Text style={value===status&&styles.selectedText}>{status}</Text></Pressable>)}</View>; }
const styles=StyleSheet.create({row:{flexDirection:"row",flexWrap:"wrap",gap:6},item:{padding:8,borderRadius:8,backgroundColor:"#e2e8f0"},selected:{backgroundColor:"#2563eb"},selectedText:{color:"#fff"}});
