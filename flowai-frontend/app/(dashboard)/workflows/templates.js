import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createWorkflow, listWorkflowTemplates } from '../../../src/api/workflows';
import { getAccessToken } from '../../../src/utils/storage';
import { theme } from '../../../src/theme';

export default function WorkflowTemplatesScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadTemplates = async () => {
      try {
        const token = await getAccessToken();
        const data = await listWorkflowTemplates(token);
        if (mounted) {
          setTemplates(data || []);
        }
      } catch (error) {
        if (mounted) {
          Alert.alert('Templates unavailable', error?.message || 'Unable to load workflow templates.');
          setTemplates([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadTemplates();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUseTemplate = async (template) => {
    try {
      await createWorkflow({
        name: template.name,
        description: template.description,
        definition: template.definition,
        status: 'published',
      });
      Alert.alert(
        'Template Instantiated',
        `Successfully created workflow from '${template.name}'!`,
        [{ text: 'View Workflows', onPress: () => router.push('/(dashboard)/workflows') }]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to instantiate template');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: 'Workflow Templates',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Production Workflow Templates</Text>
        <Text style={styles.subtitle}>
          Jumpstart your business operations with proven, production-grade automation patterns.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.list}>
          {templates.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workflow templates available.</Text>
            </View>
          ) : (
            templates.map((tmpl) => (
              <View key={tmpl.id || tmpl.name} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.icon}>{tmpl.icon || '📋'}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tmpl.tag || 'WORKFLOW'}</Text>
                  </View>
                </View>

                <Text style={styles.name}>{tmpl.name}</Text>
                <Text style={styles.description}>{tmpl.description}</Text>

                <View style={styles.footerRow}>
                  <Text style={styles.nodesCount}>{tmpl.nodes_count || tmpl.definition?.nodes?.length || 0} Pipeline Steps</Text>
                  <TouchableOpacity
                    style={styles.useBtn}
                    onPress={() => handleUseTemplate(tmpl)}
                  >
                    <Text style={styles.useBtnText}>Use Template →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
    marginBottom: theme.spacing.lg,
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
  list: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  badge: {
    backgroundColor: theme.colors.primary + '22',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    color: theme.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  nodesCount: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
  },
  useBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
  },
  useBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.xs,
  },
});
