import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { theme } from '../../theme';

const NODE_TYPES = [
  { type: 'trigger', label: 'Trigger Event', color: theme.colors.primary },
  { type: 'ai', label: 'AI Intelligence Node', color: theme.colors.accent },
  { type: 'condition', label: 'IF / ELSE Condition', color: theme.colors.warning },
  { type: 'tool', label: 'Deterministic Tool', color: theme.colors.info },
  { type: 'action', label: 'Business Action', color: theme.colors.secondary },
  { type: 'approval', label: 'Human Approval Gate', color: theme.colors.warningLight },
  { type: 'notification', label: 'Notification Dispatch', color: theme.colors.success },
];

const AVAILABLE_TOOLS = [
  'crm',
  'email',
  'calendar',
  'database',
  'file',
  'web_search',
  'calculator',
  'weather',
  'notification',
];

export default function NodeEditor({ visible, node, onSave, onClose, onDelete }) {
  if (!node) return null;

  const [label, setLabel] = useState(node.label || node.id || '');
  const [nodeType, setNodeType] = useState(node.type || 'ai');
  const [toolName, setToolName] = useState(node.config?.tool_name || 'crm');
  const [prompt, setPrompt] = useState(node.config?.prompt || '');
  const [configJson, setConfigJson] = useState(
    JSON.stringify(node.config || {}, null, 2)
  );

  const handleSave = () => {
    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(configJson);
    } catch (e) {
      alert('Invalid JSON in config');
      return;
    }

    if (nodeType === 'tool') {
      parsedConfig.tool_name = toolName;
    }
    if (prompt) {
      parsedConfig.prompt = prompt;
    }

    onSave({
      ...node,
      label,
      type: nodeType,
      config: parsedConfig,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Configure Workflow Node</Text>
            <Text style={styles.nodeId}>ID: {node.id}</Text>

            <Text style={styles.inputLabel}>Node Label / Title</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Classify Customer Urgency"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.inputLabel}>Node Type</Text>
            <View style={styles.typeGrid}>
              {NODE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[
                    styles.typePill,
                    nodeType === t.type && {
                      backgroundColor: t.color,
                      borderColor: t.color,
                    },
                  ]}
                  onPress={() => setNodeType(t.type)}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      nodeType === t.type && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {nodeType === 'tool' && (
              <>
                <Text style={styles.inputLabel}>Select Tool</Text>
                <View style={styles.toolRow}>
                  {AVAILABLE_TOOLS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.toolBtn,
                        toolName === t && styles.toolBtnActive,
                      ]}
                      onPress={() => setToolName(t)}
                    >
                      <Text
                        style={[
                          styles.toolBtnText,
                          toolName === t && styles.toolBtnTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {(nodeType === 'ai' || nodeType === 'trigger') && (
              <>
                <Text style={styles.inputLabel}>AI Prompt / Instructions</Text>
                <TextInput
                  style={[styles.input, { minHeight: 70 }]}
                  multiline
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="e.g. Analyze sentiment, extract customer issue urgency..."
                  placeholderTextColor={theme.colors.textMuted}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Node Parameters (JSON Config)</Text>
            <TextInput
              style={[styles.input, styles.jsonInput]}
              multiline
              value={configJson}
              onChangeText={setConfigJson}
              placeholder="{}"
              placeholderTextColor={theme.colors.textMuted}
            />

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.btnDelete} onPress={() => onDelete(node.id)}>
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Save Node</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scroll: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  nodeId: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Courier',
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.sm,
  },
  jsonInput: {
    fontFamily: 'Courier',
    fontSize: 12,
    minHeight: 80,
    color: '#34D399',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  typePill: {
    backgroundColor: theme.colors.card,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typePillText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  toolBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toolBtnActive: {
    backgroundColor: theme.colors.info,
    borderColor: theme.colors.info,
  },
  toolBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  toolBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  btnDelete: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.danger + '22',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    alignItems: 'center',
  },
  btnDeleteText: {
    color: theme.colors.dangerLight,
    fontWeight: '700',
    fontSize: theme.typography.sizes.xs,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
  },
  btnCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  btnSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
