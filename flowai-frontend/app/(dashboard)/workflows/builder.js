import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createWorkflow } from '../../../src/api/workflows';
import WorkflowGraph from '../../../src/components/workflow/WorkflowGraph';
import NodeEditor from '../../../src/components/workflow/NodeEditor';
import ConditionBuilder from '../../../src/components/workflow/ConditionBuilder';
import { theme } from '../../../src/theme';

export default function WorkflowBuilderScreen() {
  const router = useRouter();
  const [name, setName] = useState('New AI Automation Workflow');
  const [description, setDescription] = useState('Automated end-to-end business process workflow.');
  const [saving, setSaving] = useState(false);

  // Workflow Graph State
  const [nodes, setNodes] = useState([
    {
      id: 'node_trigger',
      type: 'trigger',
      label: 'New Customer Inquiry',
      config: { event: 'email_received' },
    },
    {
      id: 'node_classify',
      type: 'ai',
      label: 'Classify Urgency & Intent',
      config: { prompt: 'Classify the urgency as high or normal, and extract customer issue.' },
    },
    {
      id: 'node_condition',
      type: 'condition',
      label: 'Is Urgent Case?',
      config: {
        field: 'urgency',
        operator: 'equals',
        value: 'high',
        then_branch: 'urgent_branch',
        else_branch: 'normal_branch',
      },
    },
    {
      id: 'node_crm_ticket',
      type: 'tool',
      label: 'Create Support Ticket',
      config: { tool_name: 'crm', action: 'create_ticket' },
    },
    {
      id: 'node_approval',
      type: 'approval',
      label: 'Manager Approval Gate',
      config: { message: 'Review drafted resolution before sending to customer.' },
    },
    {
      id: 'node_notify',
      type: 'notification',
      label: 'Notify Support Lead',
      config: { channel: 'push', message: 'Inquiry processed successfully.' },
    },
  ]);

  const [edges, setEdges] = useState([
    { source: 'node_trigger', target: 'node_classify' },
    { source: 'node_classify', target: 'node_condition' },
    { source: 'node_condition', target: 'node_crm_ticket', condition: 'urgent_branch' },
    { source: 'node_crm_ticket', target: 'node_approval' },
    { source: 'node_approval', target: 'node_notify' },
  ]);

  // Selected Node for Editor Modal
  const [selectedNode, setSelectedNode] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);

  const handleAddNode = () => {
    const newId = `node_${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: newId,
      type: 'ai',
      label: 'New AI Processing Step',
      config: { prompt: 'Process business information' },
    };
    const lastNode = nodes[nodes.length - 1];
    setNodes([...nodes, newNode]);
    if (lastNode) {
      setEdges([...edges, { source: lastNode.id, target: newId }]);
    }
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    setEditorVisible(true);
  };

  const handleSaveNode = (updatedNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setEditorVisible(false);
    setSelectedNode(null);
  };

  const handleDeleteNode = (nodeId) => {
    if (nodes.length <= 1) {
      Alert.alert('Validation', 'A workflow must have at least one node');
      return;
    }
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setEditorVisible(false);
    setSelectedNode(null);
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Workflow name cannot be empty');
      return;
    }
    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    if (!hasTrigger) {
      Alert.alert('Validation Error', 'Workflow must have a trigger node');
      return;
    }

    setSaving(true);
    try {
      const definition = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          config: n.config,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          condition: e.condition || null,
        })),
      };

      await createWorkflow({
        name,
        description,
        definition,
        status: 'published',
      });

      Alert.alert('Success', 'Workflow successfully published!', [
        { text: 'OK', onPress: () => router.push('/(dashboard)/workflows') },
      ]);
    } catch (e) {
      Alert.alert('Validation Error', e.response?.data?.detail || e.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: 'Visual Workflow Builder',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />

      <View style={styles.headerBox}>
        <Text style={styles.title}>Visual Workflow Builder</Text>
        <Text style={styles.subtitle}>
          Assemble AI nodes, conditions, tools, and approval checkpoints into executable graphs.
        </Text>

        <Text style={styles.inputLabel}>Workflow Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Workflow Name..."
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.descInput]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the workflow purpose..."
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <WorkflowGraph
        nodes={nodes}
        edges={edges}
        onSelectNode={handleSelectNode}
        onAddNode={handleAddNode}
        selectedNodeId={selectedNode?.id}
      />

      {/* Conditions editor if selected node is condition */}
      {selectedNode?.type === 'condition' && (
        <ConditionBuilder
          conditionConfig={selectedNode.config}
          onChange={(newConfig) => {
            handleSaveNode({
              ...selectedNode,
              config: newConfig,
            });
          }}
        />
      )}

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={[styles.publishBtn, saving && styles.btnDisabled]}
          onPress={handlePublish}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.publishBtnText}>🚀 Publish Workflow (v1)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Node Editor Modal */}
      <NodeEditor
        visible={editorVisible}
        node={selectedNode}
        onSave={handleSaveNode}
        onClose={() => setEditorVisible(false)}
        onDelete={handleDeleteNode}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  headerBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    marginTop: 6,
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
  descInput: {
    minHeight: 50,
  },
  actionsBar: {
    marginTop: theme.spacing.lg,
  },
  publishBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.typography.sizes.md,
  },
});
