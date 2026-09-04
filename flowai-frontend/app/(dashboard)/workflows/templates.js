import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createWorkflow } from '../../../src/api/workflows';
import { theme } from '../../../src/theme';

const TEMPLATES = [
  {
    id: 'customer_support',
    name: 'Customer Support Automation',
    tag: 'CRM & EMAIL',
    description:
      'Inbound Email -> AI Intent & Urgency Classification -> Search CRM & Knowledge Base -> Branch on Urgency -> Human Approval -> Send Response.',
    nodesCount: 6,
    icon: '💬',
    definition: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'New Customer Email', config: { event: 'email_received' } },
        { id: 'ai_classify', type: 'ai', label: 'Classify Urgency & Sentiment', config: { prompt: 'Classify email urgency and extract customer inquiry' } },
        { id: 'tool_crm', type: 'tool', label: 'Lookup Customer CRM Record', config: { tool_name: 'crm', action: 'find' } },
        { id: 'condition_urgency', type: 'condition', label: 'Urgent vs Normal', config: { field: 'urgency', operator: 'equals', value: 'high', then_branch: 'urgent', else_branch: 'normal' } },
        { id: 'approval_gate', type: 'approval', label: 'Manager Review', config: { message: 'Review drafted support response before sending' } },
        { id: 'notify_completion', type: 'notification', label: 'Dispatch Notification', config: { channel: 'push', message: 'Inquiry resolved' } },
      ],
      edges: [
        { source: 'trigger', target: 'ai_classify' },
        { source: 'ai_classify', target: 'tool_crm' },
        { source: 'tool_crm', target: 'condition_urgency' },
        { source: 'condition_urgency', target: 'approval_gate', condition: 'urgent' },
        { source: 'approval_gate', target: 'notify_completion' },
      ],
    },
  },
  {
    id: 'daily_sales_report',
    name: 'Daily Sales & Executive Summary',
    tag: 'ANALYTICS',
    description:
      'Scheduled 8:00 AM Trigger -> Query Sales Database -> Run AI Analytics -> Generate Executive Report -> Notify Management.',
    nodesCount: 5,
    icon: '📊',
    definition: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'Schedule 8:00 AM Daily', config: { event: 'cron_schedule' } },
        { id: 'tool_db', type: 'tool', label: 'Query Sales Metrics', config: { tool_name: 'database', action: 'query' } },
        { id: 'ai_analyze', type: 'ai', label: 'AI Trend & Revenue Analysis', config: { prompt: 'Analyze daily sales trends and key drivers' } },
        { id: 'action_report', type: 'action', label: 'Generate PDF Report', config: { action_type: 'generate_report' } },
        { id: 'notify_execs', type: 'notification', label: 'Notify Executive Team', config: { channel: 'email', message: 'Daily sales summary is ready' } },
      ],
      edges: [
        { source: 'trigger', target: 'tool_db' },
        { source: 'tool_db', target: 'ai_analyze' },
        { source: 'ai_analyze', target: 'action_report' },
        { source: 'action_report', target: 'notify_execs' },
      ],
    },
  },
  {
    id: 'document_processing',
    name: 'Multimodal Document & Invoice Processing',
    tag: 'OCR & RAG',
    description:
      'Upload Scanned PDF/Image -> Vision OCR Extraction -> Classify & Embed -> Vector Knowledge Store -> Generate Summary.',
    nodesCount: 5,
    icon: '📄',
    definition: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'Document Upload Trigger', config: { event: 'document_upload' } },
        { id: 'tool_ocr', type: 'tool', label: 'Vision OCR Extraction', config: { tool_name: 'file', action: 'ocr_analyze' } },
        { id: 'ai_extract', type: 'ai', label: 'Extract Line Items & Totals', config: { prompt: 'Extract structured vendor, date, and invoice totals' } },
        { id: 'action_store', type: 'action', label: 'Save to Knowledge Base', config: { action_type: 'store_knowledge' } },
        { id: 'notify_user', type: 'notification', label: 'Notify Ingestion Complete', config: { message: 'Document embedded in RAG' } },
      ],
      edges: [
        { source: 'trigger', target: 'tool_ocr' },
        { source: 'tool_ocr', target: 'ai_extract' },
        { source: 'ai_extract', target: 'action_store' },
        { source: 'action_store', target: 'notify_user' },
      ],
    },
  },
  {
    id: 'lead_processing',
    name: 'Inbound Lead Enrichment & CRM Scoring',
    tag: 'GROWTH',
    description:
      'New Webhook Lead -> Web Search Company Intelligence -> AI Lead Scoring -> Create CRM Contact -> Notify Sales Rep.',
    nodesCount: 5,
    icon: '🎯',
    definition: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'New Webhook Lead Event', config: { event: 'webhook_lead' } },
        { id: 'tool_web', type: 'tool', label: 'Research Company Background', config: { tool_name: 'web_search' } },
        { id: 'ai_score', type: 'ai', label: 'Score Lead Quality (1-100)', config: { prompt: 'Score lead qualification based on company size and market fit' } },
        { id: 'tool_crm_create', type: 'tool', label: 'Create CRM Customer', config: { tool_name: 'crm', action: 'create' } },
        { id: 'notify_sales', type: 'notification', label: 'Alert Sales Account Exec', config: { message: 'High score lead qualified' } },
      ],
      edges: [
        { source: 'trigger', target: 'tool_web' },
        { source: 'tool_web', target: 'ai_score' },
        { source: 'ai_score', target: 'tool_crm_create' },
        { source: 'tool_crm_create', target: 'notify_sales' },
      ],
    },
  },
];

export default function WorkflowTemplatesScreen() {
  const router = useRouter();

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

      <View style={styles.list}>
        {TEMPLATES.map((tmpl) => (
          <View key={tmpl.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{tmpl.icon}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tmpl.tag}</Text>
              </View>
            </View>

            <Text style={styles.name}>{tmpl.name}</Text>
            <Text style={styles.description}>{tmpl.description}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.nodesCount}>{tmpl.nodesCount} Pipeline Steps</Text>
              <TouchableOpacity
                style={styles.useBtn}
                onPress={() => handleUseTemplate(tmpl)}
              >
                <Text style={styles.useBtnText}>Use Template →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
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
