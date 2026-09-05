import { useEffect,useState } from "react";
import { ActivityIndicator,Text,View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCustomer } from "../../../src/api/customers";
export default function CustomerDetail(){const {id}=useLocalSearchParams(),[customer,setCustomer]=useState();useEffect(()=>{getCustomer(id).then(setCustomer);},[id]);if(!customer)return <ActivityIndicator/>;return <View style={{padding:16,gap:8}}><Text style={{fontSize:22,fontWeight:"700"}}>{customer.name}</Text><Text>{customer.email||"No email"}</Text><Text>{customer.company||"No company"}</Text><Text>{customer.notes||"No notes"}</Text></View>}
