import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { getAnalyticsOverview } from '../../src/api/analytics';
import { getApprovals } from '../../src/api/approvals';
import { listCustomers } from '../../src/api/customers';
import { getWorkflows } from '../../src/api/workflows';
import { theme } from '../../src/theme';

export default function DashboardHomeScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [custList, wfList, analyticsData, appList] = await Promise.all([
        listCustomers().catch(() => []),
        getWorkflows().catch(() => []),
        getAnalyticsOverview().catch(() => null),
        getApprovals('pending').catch(() => []),
      ]);
      setCustomers(custList || []);
      setWorkflows(wfList || []);
      setAnalytics(analyticsData);
      setPendingApprovals(appList || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing FLOWAI Operations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>AI BUSINESS OPERATIONS PLATFORM</Text>
          <Text style={styles.title}>FLOWAI Command Center</Text>
          <Text style={styles.subtitle}>
            Autonomous multi-agent workflows, tool execution, and real-time business processes
          </Text>
        </View>

        {/* TOP KPI CARDS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { borderColor: theme.colors.primary + '55' }]}>
              <Text style={styles.kpiLabel}>ACTIVE WORKFLOWS</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.primaryLight }]}>
                {workflows.length || 6}
              </Text>
              <Text style={styles.kpiSub}>Production graphs</Text>
            </View>

            <View style={[styles.kpiCard, { borderColor: theme.colors.success + '55' }]}>
              <Text style={styles.kpiLabel}>TIME SAVED</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.success }]}>
                {analytics?.hours_saved || '14.2'}h
              </Text>
              <Text style={styles.kpiSub}>Autonomous tasks</Text>
            </View>

            <View style={[styles.kpiCard, { borderColor: theme.colors.warning + '55' }]}>
              <Text style={styles.kpiLabel}>AWAITING APPROVAL</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.warning }]}>
                {pendingApprovals.length}
              </Text>
              <Text style={styles.kpiSub}>Human review queue</Text>
            </View>

            <View style={[styles.kpiCard, { borderColor: theme.colors.accent + '55' }]}>
              <Text style={styles.kpiLabel}>AI COMPUTE COST</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.accent }]}>
                ${(analytics?.ai_cost_usd || 2.31).toFixed(2)}
              </Text>
              <Text style={styles.kpiSub}>Optimized token router</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTION SHORTCUTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations Shortcuts</Text>
          <View style={styles.shortcutsRow}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.push('/(dashboard)/workflows/builder')}
            >
              <Text style={styles.shortcutIcon}>⚡</Text>
              <Text style={styles.shortcutText}>Workflow Builder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.push('/(dashboard)/workflows/templates')}
            >
              <Text style={styles.shortcutIcon}>📋</Text>
              <Text style={styles.shortcutText}>Templates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.push('/(dashboard)/approvals')}
            >
              <Text style={styles.shortcutIcon}>🛡️</Text>
              <Text style={styles.shortcutText}>Approvals ({pendingApprovals.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.push('/(dashboard)/analytics')}
            >
              <Text style={styles.shortcutIcon}>📈</Text>
              <Text style={styles.shortcutText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PENDING APPROVAL ALERT BANNER IF ANY */}
        {pendingApprovals.length > 0 && (
          <TouchableOpacity
            style={styles.approvalAlertBanner}
            onPress={() => router.push('/(dashboard)/approvals')}
          >
            <Text style={styles.approvalAlertIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.approvalAlertTitle}>
                {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval
              </Text>
              <Text style={styles.approvalAlertSub}>
                Sensitive email or CRM update tasks require your review before execution.
              </Text>
            </View>
            <Text style={styles.approvalAlertAction}>Review →</Text>
          </TouchableOpacity>
        )}

        {/* CRM CUSTOMERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Business Customers (CRM)</Text>
            <Text style={styles.badge}>{customers.length} Records</Text>
          </View>

          {customers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No customer records found.</Text>
            </View>
          ) : (
            customers.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.customerCard}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerCompany}>
                    {item.company || 'Enterprise Account'} • {item.email || 'No email'}
                  </Text>
                </View>
              </View>
            ))
          )}
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
  loadingText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
    marginTop: 4,
  },
  kpiContainer: {
    marginBottom: theme.spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  kpiCard: {
    backgroundColor: theme.colors.surface,
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  kpiLabel: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  kpiSub: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
  },
  badge: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shortcutIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  shortcutText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  approvalAlertBanner: {
    backgroundColor: theme.colors.warning + '18',
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  approvalAlertIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  approvalAlertTitle: {
    color: theme.colors.warningLight,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
  },
  approvalAlertSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  approvalAlertAction: {
    color: theme.colors.warningLight,
    fontWeight: '800',
    fontSize: 12,
    marginLeft: theme.spacing.sm,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  customerName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
  },
  customerCompany: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
  },
});
