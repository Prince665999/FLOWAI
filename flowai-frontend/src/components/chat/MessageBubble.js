import { StyleSheet, Text, View } from "react-native";

import { Citations } from "./Citations";
import { responseParagraphs } from "../../utils/formatAiResponse";

export function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? <Text style={[styles.text, styles.userText]}>{message.content || " "}</Text> : responseParagraphs(message.content).map((paragraph, index) => (
          <Text key={`${index}-${paragraph.slice(0, 12)}`} style={[styles.text, styles.assistantText, index > 0 && styles.paragraph]}>{paragraph}</Text>
        ))}
        {!isUser ? <Citations content={message.content} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: "100%", marginBottom: 12 },
  userRow: { alignItems: "flex-end" },
  assistantRow: { alignItems: "flex-start" },
  bubble: { maxWidth: "86%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11 },
  userBubble: { backgroundColor: "#2563eb", borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: "#ffffff", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#e2e8f0" },
  text: { fontSize: 15, lineHeight: 21 },
  paragraph: { marginTop: 8 },
  userText: { color: "#ffffff" },
  assistantText: { color: "#172033" },
});