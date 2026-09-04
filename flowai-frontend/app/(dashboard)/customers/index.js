import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { listCustomers, createCustomer } from '../../../src/api/customers';
import { theme } from '../../../src/theme';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await listCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateCustomer = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Customer name is required');
      return;
    }
    setSaving(true);
    try {
      await createCustomer({
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        company: newCompany.trim() || undefined,
        phone: newPhone.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
      setModalVisible(false);
      setNewName('');
      setNewEmail('');
      setNewCompany('');
      setNewPhone('');
      setNewNotes('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.company?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'CRM Customers',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>BUSINESS CRM</Text>
          <Text style={styles.title}>Customers Directory</Text>
          <Text style={styles.subtitle}>Unified customer profiles, companies, and interaction notes.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Customer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or company..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primaryLight}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name?.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  {item.company ? (
                    <Text style={styles.companyName}>🏢 {item.company}</Text>
                  ) : null}
                </View>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>#{item.id}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                {item.email ? (
                  <Text style={styles.detailText}>📧 {item.email}</Text>
                ) : null}
                {item.phone ? (
                  <Text style={styles.detailText}>📞 {item.phone}</Text>
                ) : null}
                {item.notes ? (
                  <Text style={styles.notesText} numberOfLines={2}>
                    📝 {item.notes}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No customer records found</Text>
              <Text style={styles.emptySubtitle}>
                Add customers manually or automate ingestion via CRM webhook workflows.
              </Text>
            </View>
          }
        />
      )}

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New CRM Customer</Text>
            
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Jane Doe"
              placeholderTextColor={theme.colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. jane@acmecorp.com"
              placeholderTextColor={theme.colors.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Acme Corp"
              placeholderTextColor={theme.colors.textMuted}
              value={newCompany}
              onChangeText={setNewCompany}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555-0199"
              placeholderTextColor={theme.colors.textMuted}
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Key notes, preferences, or lead source..."
              placeholderTextColor={theme.colors.textMuted}
              value={newNotes}
              onChangeText={setNewNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleCreateCustomer}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 2,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },
  searchBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.sm,
  },
  list: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  avatarText: {
    color: theme.colors.primaryLight,
    fontWeight: '800',
    fontSize: theme.typography.sizes.sm,
  },
  cardInfo: {
    flex: 1,
  },
  customerName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
  },
  companyName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  idBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
  },
  cardDetails: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 4,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
  },
  notesText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
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
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.sm,
  },
  notesInput: {
    minHeight: 60,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
