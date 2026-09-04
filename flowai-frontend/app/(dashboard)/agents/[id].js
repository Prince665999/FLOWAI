import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';

import { getAgentRun } from '../../../src/api/agents';
import { AgentRunSteps } from '../../../src/components/agent/AgentRunSteps';
import DelegationTree from '../../../src/components/agent/DelegationTree';
import { useAuth } from '../../../src/hooks/useAuth';
import { theme } from '../../../src/theme';

export default function AgentRunDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [run, setRun] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await getAgentRun(token, id);
        if (active) setRun(result);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load agent run');
      }
    };
    if (token && id) load();

    const polling = setInterval(async () => {
      if (!active || !token || !id || !['queued', 'running'].includes(run?.status)) return;
      const result = await getAgentRun(token, id).catch(() => null);
      if (result && active) setRun(result);
    }, 3000);

    return () => {
      active = false;
      clearInterval(polling);
    };
  }, [token, id, run?.status]);

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!run) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const delegationTree =
    run.plan && Array.isArray(run.plan) && run.plan.some((p) => p.sub_agent)
      ? run.plan
      : run.result?.delegation_tree;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Agent Run #${run.id}`,
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.eyebrow}>AGENT EXECUTION TRACE</Text>
          <Text style={styles.title}>Run #{run.id}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status: </Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    run.status === 'succeeded'
                      ? theme.colors.success
                      : run.status === 'failed'
                      ? theme.colors.danger
                      : theme.colors.warning,
                },
              ]}
            >
              {run.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.objective}>{run.objective}</Text>
        </View>

        {delegationTree && (
          <DelegationTree
            delegationTree={delegationTree}
            aggregatedFindings={run.result}
          />
        )}

        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Execution Step Timeline</Text>
          <AgentRunSteps run={run} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  eyebrow: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  statusLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
  },
  statusValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
  },
  objective: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    marginTop: 8,
  },
  stepsSection: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.md,
  },
});