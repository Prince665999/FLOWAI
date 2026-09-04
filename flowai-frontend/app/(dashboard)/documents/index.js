import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listDocuments, uploadDocument } from "../../../src/api/documents";
import { useAuth } from "../../../src/hooks/useAuth";

export default function DocumentsScreen() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    try {
      setDocuments(await listDocuments(token));
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDocuments();
  }, [token]);

  const chooseDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "text/plain", "text/markdown", "text/csv", "application/json", "text/html"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    setError(null);
    try {
      const document = await uploadDocument(token, result.assets[0]);
      setDocuments((current) => [document, ...current]);
    } catch (err) {
      setError(err.message || "Unable to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>BUSINESS KNOWLEDGE</Text><Text style={styles.title}>Documents</Text></View>
        <Pressable accessibilityLabel="Upload document" onPress={chooseDocument} disabled={uploading} style={[styles.button, uploading && styles.disabled]}>
          <Text style={styles.buttonText}>{uploading ? "Uploading" : "Upload"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <View style={styles.centered}><ActivityIndicator color="#2563eb" /></View> : (
        <FlatList
          data={documents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={loadDocuments}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.fileIcon}><Text style={styles.fileIconText}>DOC</Text></View>
              <View style={styles.itemBody}><Text style={styles.filename} numberOfLines={1}>{item.filename}</Text><Text style={styles.meta}>{item.status} · {Math.ceil(item.size_bytes / 1024)} KB</Text></View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Upload a document to give FLOWAI business context.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#93c5fd", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  button: { backgroundColor: "#38bdf8", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#082f49", fontWeight: "700" },
  list: { padding: 16 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  fileIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center", marginRight: 12 },
  fileIconText: { color: "#1d4ed8", fontSize: 10, fontWeight: "800" },
  itemBody: { flex: 1 },
  filename: { color: "#172033", fontSize: 15, fontWeight: "600" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4, textTransform: "capitalize" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32, lineHeight: 20 },
  error: { color: "#b91c1c", paddingHorizontal: 16, paddingTop: 12 },
});