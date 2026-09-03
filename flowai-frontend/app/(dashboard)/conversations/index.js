import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable , StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

import { createConversation, listConversations } from "../../../src/api/conversations";
import { useAuth } from "../../../src/hooks/useAuth";

export default function ConversationsScreen() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConversations = async () => {
    try {
      setConversations(await listConversations(token));
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadConversations();
  }, [token]);

  const startConversation = async () => {
    const conversation = await createConversation(token);
    router.push(`/conversations/${conversation.id}`);
  };

  if (loading) return <SafeAreaView style={styles.centered}><ActivityIndicator color="#2563eb" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>WORKSPACE ASSISTANT</Text><Text style={styles.title}>Conversations</Text></View>
        <Pressable accessibilityLabel="Start conversation" style={styles.newButton} onPress={startConversation}><Text style={styles.newButtonText}>New</Text></Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onRefresh={loadConversations}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => router.push(`/conversations/${item.id}`)}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>{item.messages?.length || 0} messages</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Start a conversation with your business assistant.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#93c5fd", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  newButton: { backgroundColor: "#38bdf8", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  newButtonText: { color: "#082f49", fontWeight: "700" },
  list: { padding: 16 },
  item: { backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  itemTitle: { color: "#172033", fontSize: 16, fontWeight: "600" },
  itemMeta: { color: "#64748b", marginTop: 6, fontSize: 13 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32 },
  error: { color: "#b91c1c", paddingHorizontal: 16, paddingTop: 12 },
});