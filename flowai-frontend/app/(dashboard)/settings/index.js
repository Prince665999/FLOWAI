import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../../src/api/schedules';
import { getWorkflows } from '../../../src/api/workflows';
import { theme } from '../../../src/theme';

export default function SettingsScreen() {
  const [schedules, setSchedules] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // New Schedule Form
  const [newScheduleName, setNewScheduleName] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [cronExpr, setCronExpr] = useState('0 8 * * *');
  const [timezone, setTimezone] = useState('UTC');

  // General Settings
  const [autoApproval, setAutoApproval] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [queueRetries, setQueueRetries] = useState('3');

  const fetchData = async () => {
    try {
      const [schedData, wfData] = await Promise.all([
        getSchedules(),
        getWorkflows(),
      ]);
      setSchedules(schedData || []);
      setWorkflows(wfData || []);
      if (wfData && wfData.length > 0) {
        setSelectedWorkflowId(wfData[0].id);
      }
    } catch (e) {
      console.error('Failed to load settings data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSchedule = async (schedule) => {
    try {
      await updateSchedule(schedule.id, { is_active: !schedule.is_active });
      fetchData();
    } catch (e) {
      alert('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete schedule');
    }
  };

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim() || !selectedWorkflowId) {
      alert('Please fill out all schedule fields');
      return;
    }
    try {
      await createSchedule({
        name: newScheduleName,
        workflow_id: selectedWorkflowId,
        cron_expression: cronExpr,
        timezone,
        is_active: true,
      });
      setModalVisible(false);
      setNewScheduleName('');
      fetchData();
    } catch (e) {
      alert('Failed to create schedule');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Automation</Text>
        <Text style={styles.subtitle}>
          Configure cron schedules, background policies, and system parameters
        </Text>
      </View>

      {/* SCHEDULED AUTOMATIONS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scheduled Workflows (Cron)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Add Schedule</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : schedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recurring schedules active.</Text>
          </View>
        ) : (
          schedules.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>{item.name}</Text>
                <Text style={styles.scheduleCron}>
                  Cron: {item.cron_expression} ({item.timezone})
                </Text>
                <Text style={styles.scheduleNext}>
                  Next Run: {item.next_run_at ? new Date(item.next_run_at).toLocaleString() : 'Pending'}
                </Text>
              </View>
              <View style={styles.scheduleActions}>
                <Switch
                  value={item.is_active}
                  onValueChange={() => handleToggleSchedule(item)}
                  trackColor={{ false: '#374151', true: theme.colors.primary }}
                  thumbColor={item.is_active ? '#FFFFFF' : '#9CA3AF'}
                />
                <TouchableOpacity
                  onPress={() => handleDeleteSchedule(item.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* SYSTEM CONTROLS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Execution Policies</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Auto-Approve Low Risk Tasks</Text>
            <Text style={styles.settingDesc}>
              Bypass human review for pure read-only AI research
            </Text>
          </View>
          <Switch
            value={autoApproval}
            onValueChange={setAutoApproval}
            trackColor={{ false: '#374151', true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Audio & Voice Responses</Text>
            <Text style={styles.settingDesc}>
              Enable text-to-speech feedback for agent commands
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#374151', true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Queue Max Retries</Text>
            <Text style={styles.settingDesc}>
              Number of background task retry attempts
            </Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={queueRetries}
            onChangeText={setQueueRetries}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* MODAL FOR NEW SCHEDULE */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Scheduled Workflow</Text>

            <Text style={styles.inputLabel}>Schedule Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Daily Morning Inquiries Check"
              placeholderTextColor={theme.colors.textMuted}
              value={newScheduleName}
              onChangeText={setNewScheduleName}
            />

            <Text style={styles.inputLabel}>Select Workflow</Text>
            <ScrollView horizontal style={styles.wfPillRow}>
              {workflows.map((wf) => (
                <TouchableOpacity
                  key={wf.id}
                  style={[
                    styles.wfPill,
                    selectedWorkflowId === wf.id && styles.wfPillActive,
                  ]}
                  onPress={() => setSelectedWorkflowId(wf.id)}
                >
                  <Text
                    style={[
                      styles.wfPillText,
                      selectedWorkflowId === wf.id && styles.wfPillTextActive,
                    ]}
                  >
                    {wf.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Cron Expression</Text>
            <TextInput
              style={styles.input}
              placeholder="0 8 * * * (Daily at 8:00 AM)"
              placeholderTextColor={theme.colors.textMuted}
              value={cronExpr}
              onChangeText={setCronExpr}
            />

            <Text style={styles.inputLabel}>Timezone</Text>
            <TextInput
              style={styles.input}
              placeholder="UTC"
              placeholderTextColor={theme.colors.textMuted}
              value={timezone}
              onChangeText={setTimezone}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSubmit]}
                onPress={handleCreateSchedule}
              >
                <Text style={styles.btnSubmitText}>Create Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.xs,
  },
  scheduleCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  scheduleCron: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  scheduleNext: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 4,
  },
  scheduleActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: theme.colors.dangerLight,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
  },
  emptyCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  settingDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  numberInput: {
    backgroundColor: theme.colors.surfaceLight,
    color: theme.colors.text,
    width: 60,
    textAlign: 'center',
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: theme.spacing.sm,
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
  wfPillRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  wfPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  wfPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  wfPillText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
  },
  wfPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: theme.colors.surfaceLight,
  },
  btnCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  btnSubmit: {
    backgroundColor: theme.colors.primary,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
