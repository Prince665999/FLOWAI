import { useEffect } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform , StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { createConversation, getConversation } from "../../../src/api/conversations";
import { ChatInput } from "../../../src/components/chat/ChatInput";
import { MessageBubble } from "../../../src/components/chat/MessageBubble";
import { StreamingIndicator } from "../../../src/components/chat/StreamingIndicator";
import { useAuth } from "../../../src/hooks/useAuth";
import { useConversationStream } from "../../../src/hooks/useConversationStream";

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const { messages, sending, error, replaceMessages, sendMessage } = useConversationStream(token, id, []);

  useEffect(() => {
    const loadConversation = async () => {
      if (!token || !id || id === "new") return;
      const conversation = await getConversation(token, id);
      replaceMessages(conversation.messages || []);
    };
    loadConversation().catch(() => {});
  }, [token, id]);

  useEffect(() => {
    const createIfNeeded = async () => {
      if (token && id === "new") {
        const conversation = await createConversation(token);
        router.replace(`/conversations/${conversation.id}`);
      }
    };
    createIfNeeded().catch(() => {});
  }, [token, id]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "FLOWAI Assistant", headerShown: true }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={88}>
        <View style={styles.intro}><Text style={styles.title}>Business assistant</Text><Text style={styles.subtitle}>Ask about your operations, customers, or next task.</Text></View>
        <FlatList data={messages} keyExtractor={(item, index) => String(item.id || index)} contentContainerStyle={styles.messages} renderItem={({ item }) => <MessageBubble message={item} />} ListEmptyComponent={<Text style={styles.empty}>Your conversation will appear here.</Text>} />
        <StreamingIndicator visible={sending} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ChatInput onSend={sendMessage} disabled={sending || id === "new"} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  flex: { flex: 1 },
  intro: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  title: { color: "#172033", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", marginTop: 4 },
  messages: { padding: 16, paddingTop: 8, flexGrow: 1 },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 48 },
  error: { color: "#b91c1c", paddingHorizontal: 16, paddingBottom: 8 },
});