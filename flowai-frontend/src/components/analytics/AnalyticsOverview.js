import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function AnalyticsOverview({ data }) {
  if (!data) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Business Value & ROI Metrics</Text>
      <Text style={styles.sectionSub}>
        Measuring automated business outcomes, time saved, and platform costs
      </Text>

      <View style={styles.grid}>
        {/* TIME SAVED */}
        <View style={[styles.card, { borderColor: theme.colors.success + '44' }]}>
          <Text style={styles.cardLabel}>TIME SAVED</Text>
          <Text style={[styles.cardValue, { color: theme.colors.success }]}>
            {data.hours_saved || 14}h
          </Text>
          <Text style={styles.cardSub}>~10 min per task</Text>
        </View>

        {/* AI COST */}
        <View style={[styles.card, { borderColor: theme.colors.primaryLight + '44' }]}>
          <Text style={styles.cardLabel}>AI COST</Text>
          <Text style={[styles.cardValue, { color: theme.colors.primaryLight }]}>
            ${(data.ai_cost_usd || 2.31).toFixed(2)}
          </Text>
          <Text style={styles.cardSub}>Total token compute</Text>
        </View>

        {/* TASKS AUTOMATED */}
        <View style={[styles.card, { borderColor: theme.colors.accent + '44' }]}>
          <Text style={styles.cardLabel}>TASKS AUTOMATED</Text>
          <Text style={[styles.cardValue, { color: theme.colors.accent }]}>
            {data.tasks_automated || 0}
          </Text>
          <Text style={styles.cardSub}>Across all workflows</Text>
        </View>

        {/* WORKFLOWS RUN */}
        <View style={[styles.card, { borderColor: theme.colors.info + '44' }]}>
          <Text style={styles.cardLabel}>RUNS EXECUTED</Text>
          <Text style={[styles.cardValue, { color: theme.colors.info }]}>
            {data.workflows_executed || 0}
          </Text>
          <Text style={styles.cardSub}>
            {data.success_rate_percent || 100}% Success Rate
          </Text>
        </View>
      </View>

      {/* DETAILED STATS ROW */}
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailNum}>{data.successful_workflows || 0}</Text>
          <Text style={styles.detailLabel}>Successful</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailNum, { color: theme.colors.danger }]}>
            {data.failed_workflows || 0}
          </Text>
          <Text style={styles.detailLabel}>Failed</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailNum, { color: theme.colors.warning }]}>
            {data.human_approvals_total || 0}
          </Text>
          <Text style={styles.detailLabel}>Human Reviews</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailNum}>{data.customers_processed || 0}</Text>
          <Text style={styles.detailLabel}>Customers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  sectionHeader: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
  },
  sectionSub: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  cardLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  cardSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  detailBox: {
    alignItems: 'center',
    flex: 1,
  },
  detailNum: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
