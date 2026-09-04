import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function DelegationTree({ delegationTree, aggregatedFindings }) {
  if (!delegationTree || !Array.isArray(delegationTree) || delegationTree.length === 0) {
    return null;
  }

  const getAgentColor = (agent) => {
    switch (agent) {
      case 'research':
        return theme.colors.info;
      case 'customer':
        return theme.colors.secondary;
      case 'reporting':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Supervisor Multi-Agent Delegation Tree</Text>
      <Text style={styles.subHeader}>
        Top-level supervisor delegated tasks across specialized agents
      </Text>

      <View style={styles.tree}>
        <View style={styles.supervisorNode}>
          <Text style={styles.supervisorBadge}>SUPERVISOR AGENT</Text>
          <Text style={styles.supervisorLabel}>Orchestration & Task Decomposition</Text>
        </View>

        <View style={styles.branchLines} />

        <View style={styles.subAgentsList}>
          {delegationTree.map((item, idx) => {
            const color = getAgentColor(item.sub_agent);
            return (
              <View key={idx} style={styles.subAgentCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.agentTag, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.agentTagText, { color }]}>
                      {item.sub_agent?.toUpperCase()} AGENT
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statusTag,
                      {
                        color:
                          item.status === 'succeeded'
                            ? theme.colors.success
                            : theme.colors.warning,
                      },
                    ]}
                  >
                    {item.status?.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.taskTitle}>{item.description}</Text>
                <Text style={styles.taskObjective}>{item.task}</Text>

                {item.output && (
                  <View style={styles.outputBox}>
                    <Text style={styles.outputLabel}>Agent Observation & Output:</Text>
                    <Text style={styles.outputContent}>
                      {JSON.stringify(item.output, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
  },
  subHeader: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  tree: {
    marginTop: theme.spacing.xs,
  },
  supervisorNode: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  supervisorBadge: {
    color: theme.colors.primaryLight,
    fontWeight: '800',
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1,
  },
  supervisorLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  branchLines: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.primary,
    alignSelf: 'center',
    marginVertical: 4,
  },
  subAgentsList: {
    gap: theme.spacing.sm,
  },
  subAgentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  agentTagText: {
    fontWeight: '800',
    fontSize: 10,
  },
  statusTag: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
  },
  taskObjective: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  outputBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  outputLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  outputContent: {
    color: '#34D399',
    fontFamily: 'Courier',
    fontSize: 10,
    marginTop: 2,
  },
});
