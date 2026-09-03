import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Ask FLOWAI something..."
        placeholderTextColor="#94a3b8"
        multiline
        maxLength={20000}
        editable={!disabled}
        style={styles.input}
        onSubmitEditing={submit}
      />
      <Pressable accessibilityLabel="Send message" onPress={submit} disabled={disabled} style={[styles.button, disabled && styles.disabled]}>
        <Text style={styles.buttonText}>{disabled ? "..." : "Send"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: "#172033", fontSize: 15 },
  button: { minWidth: 58, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#2563eb" },
  disabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#ffffff", fontWeight: "700" },
});