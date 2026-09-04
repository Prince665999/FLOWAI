import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function SystemStatus({ healthData }) {
  const status = healthData?.status || 'healthy';
  const services = healthData?.services || {
    database: 'healthy',
    queue_redis: 'healthy',
    vector_chroma: 'healthy',
    workflow_engine: 'healthy',
    agents_platform: 'healthy',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Observability & Health</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status === 'healthy'
                  ? theme.colors.success + '22'
                  : theme.colors.warning + '22',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  status === 'healthy'
                    ? theme.colors.success
                    : theme.colors.warning,
              },
            ]}
          >
            ● {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.servicesGrid}>
        {Object.entries(services).map(([srv, st]) => (
          <View key={srv} style={styles.serviceItem}>
            <Text style={styles.serviceName}>{srv.replace('_', ' ')}</Text>
            <Text style={styles.serviceStatus}>
              {st === 'healthy' ? '✓ Operational' : st}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  serviceItem: {
    backgroundColor: theme.colors.card,
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceName: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  serviceStatus: {
    color: theme.colors.successLight,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
