import { Slot } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 10}
      >
        <Slot />
      </KeyboardAvoidingView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
