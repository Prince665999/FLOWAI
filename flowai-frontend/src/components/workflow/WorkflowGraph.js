import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';

export default function WorkflowGraph({
  nodes = [],
  edges = [],
  onSelectNode,
  onAddNode,
  selectedNodeId,
}) {
  const getNodeColor = (type) => {
    switch (type) {
      case 'trigger':
        return theme.colors.primary;
      case 'ai':
        return theme.colors.accent;
      case 'condition':
        return theme.colors.warning;
      case 'tool':
        return theme.colors.info;
      case 'action':
        return theme.colors.secondary;
      case 'approval':
        return theme.colors.warningLight;
      case 'notification':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Workflow Graph Canvas</Text>
        <TouchableOpacity style={styles.addNodeBtn} onPress={onAddNode}>
          <Text style={styles.addNodeBtnText}>+ Add Step</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.canvas}>
        <View style={styles.nodesSequence}>
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const nodeColor = getNodeColor(node.type);
            const edge = edges.find((e) => e.source === node.id);

            return (
              <React.Fragment key={node.id}>
                <TouchableOpacity
                  style={[
                    styles.nodeCard,
                    { borderLeftColor: nodeColor, borderLeftWidth: 4 },
                    isSelected && styles.nodeCardSelected,
                  ]}
                  onPress={() => onSelectNode(node)}
                >
                  <View style={styles.nodeHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: nodeColor + '22' },
                      ]}
                    >
                      <Text style={[styles.typeBadgeText, { color: nodeColor }]}>
                        {node.type?.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.nodeIndex}>#{index + 1}</Text>
                  </View>

                  <Text style={styles.nodeLabel} numberOfLines={1}>
                    {node.label || node.id}
                  </Text>
                  <Text style={styles.nodeSubtext} numberOfLines={1}>
                    {node.type === 'tool'
                      ? `Tool: ${node.config?.tool_name || 'crm'}`
                      : node.type === 'ai'
                      ? 'AI Reasoning'
                      : node.type === 'approval'
                      ? 'Requires Human Review'
                      : 'Step Execution'}
                  </Text>
                </TouchableOpacity>

                {index < nodes.length - 1 && (
                  <View style={styles.connectorContainer}>
                    <View style={styles.connectorLine} />
                    {edge?.condition ? (
                      <Text style={styles.edgeCondition}>{edge.condition}</Text>
                    ) : null}
                    <Text style={styles.connectorArrow}>→</Text>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addNodeBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
  },
  addNodeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  canvas: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  nodesSequence: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    width: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nodeCardSelected: {
    borderColor: theme.colors.primaryLight,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  nodeIndex: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  nodeLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  nodeSubtext: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  connectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  connectorLine: {
    width: 20,
    height: 2,
    backgroundColor: theme.colors.primaryLight,
  },
  edgeCondition: {
    color: theme.colors.warningLight,
    fontSize: 9,
    fontWeight: '700',
    position: 'absolute',
    top: -12,
  },
  connectorArrow: {
    color: theme.colors.primaryLight,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: -4,
  },
});
