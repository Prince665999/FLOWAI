import { StyleSheet, Text, View } from "react-native";

const citationPattern = /\[Source:\s*([^,\]]+),\s*section\s*([^\]]+)\]/gi;

export function extractCitations(content = "") {
  const citations = [];
  const seen = new Set();
  let match;
  while ((match = citationPattern.exec(content)) !== null) {
    const key = `${match[1].trim()}-${match[2].trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({ filename: match[1].trim(), section: match[2].trim() });
    }
  }
  return citations;
}

export function Citations({ content }) {
  const citations = extractCitations(content);
  if (!citations.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sources</Text>
      {citations.map((citation) => (
        <View key={`${citation.filename}-${citation.section}`} style={styles.source}>
          <Text style={styles.filename} numberOfLines={1}>{citation.filename}</Text>
          <Text style={styles.section}>Section {citation.section}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: "#dbeafe" },
  heading: { color: "#1d4ed8", fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 5 },
  source: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  filename: { flex: 1, color: "#334155", fontSize: 12, fontWeight: "600" },
  section: { color: "#64748b", fontSize: 12 },
});