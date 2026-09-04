import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { getAnalyticsOverview, getCostBreakdown } from '../../../src/api/analytics';
import AnalyticsOverview from '../../../src/components/analytics/AnalyticsOverview';
import { theme } from '../../../src/theme';

export default function AnalyticsDashboardScreen() {
  const [overview, setOverview] = useState(null);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [overviewData, costsData] = await Promise.all([
        getAnalyticsOverview(),
        getCostBreakdown(),
      ]);
      setOverview(overviewData);
      setCosts(costsData || []);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Stack.Screen
        options={{
          title: 'Business Analytics',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>FLOWAI Business Analytics</Text>
        <Text style={styles.subtitle}>
          Track automation ROI, operational efficiency, and token usage costs
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <AnalyticsOverview data={overview} />

          {/* AI MODEL TOKEN COSTS SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Model Cost Distribution</Text>
            <Text style={styles.sectionSub}>
              Token compute and cost breakdown by LLM architecture
            </Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Model</Text>
              <Text style={styles.th}>Calls</Text>
              <Text style={styles.th}>In/Out Tokens</Text>
              <Text style={[styles.th, { textAlign: 'right' }]}>Cost ($)</Text>
            </View>

            {costs.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.modelName, { flex: 2 }]} numberOfLines={1}>
                  {c.model_name}
                </Text>
                <Text style={styles.td}>{c.calls_count}</Text>
                <Text style={styles.td}>
                  {Math.round((c.input_tokens + c.output_tokens) / 1000)}k
                </Text>
                <Text style={[styles.td, styles.costText, { textAlign: 'right' }]}>
                  ${c.estimated_cost_usd.toFixed(4)}
                </Text>
              </View>
            ))}
          </View>

          {/* ROI COMPARISON CARD */}
          <View style={styles.roiCard}>
            <Text style={styles.roiTitle}>Operations ROI Summary</Text>
            <View style={styles.roiGrid}>
              <View style={styles.roiCol}>
                <Text style={styles.roiLabel}>Before Automation</Text>
                <Text style={styles.roiValueOld}>Manual Processing</Text>
                <Text style={styles.roiMetric}>~15 min / Inquiry</Text>
                <Text style={styles.roiMetric}>$25.00 / Hour Cost</Text>
              </View>
              <View style={styles.roiDivider} />
              <View style={styles.roiCol}>
                <Text style={styles.roiLabel}>With FLOWAI Platform</Text>
                <Text style={styles.roiValueNew}>AI Agent Execution</Text>
                <Text style={styles.roiMetric}>~4.2 sec / Task</Text>
                <Text style={[styles.roiMetric, { color: theme.colors.success }]}>
                  $0.02 / Task Average
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
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
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  center: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
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
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 6,
    marginBottom: 6,
  },
  th: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '44',
    alignItems: 'center',
  },
  td: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
  },
  modelName: {
    color: theme.colors.primaryLight,
    fontWeight: '600',
  },
  costText: {
    color: theme.colors.success,
    fontWeight: '700',
  },
  roiCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  roiTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  roiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roiCol: {
    flex: 1,
  },
  roiDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  roiLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roiValueOld: {
    color: theme.colors.dangerLight,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    marginVertical: 4,
  },
  roiValueNew: {
    color: theme.colors.successLight,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    marginVertical: 4,
  },
  roiMetric: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
});
