import { StyleSheet, Text, View } from "react-native";

export function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content || " "}
        </Text>
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
  userText: { color: "#ffffff" },
  assistantText: { color: "#172033" },
});