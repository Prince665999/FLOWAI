import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

export default function ConditionBuilder({ conditionConfig, onChange }) {
  const [field, setField] = useState(conditionConfig?.field || 'urgency');
  const [operator, setOperator] = useState(conditionConfig?.operator || 'equals');
  const [value, setValue] = useState(conditionConfig?.value || 'high');
  const [thenBranch, setThenBranch] = useState(conditionConfig?.then_branch || 'urgent_path');
  const [elseBranch, setElseBranch] = useState(conditionConfig?.else_branch || 'normal_path');

  const OPERATORS = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'];

  const updateConfig = (newField, newOp, newVal, newThen, newElse) => {
    onChange({
      field: newField,
      operator: newOp,
      value: newVal,
      then_branch: newThen,
      else_branch: newElse,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Branching Rule Logic</Text>

      <View style={styles.ruleBox}>
        <Text style={styles.ifLabel}>IF</Text>
        <TextInput
          style={styles.input}
          placeholder="Field (e.g. urgency)"
          placeholderTextColor={theme.colors.textMuted}
          value={field}
          onChangeText={(v) => {
            setField(v);
            updateConfig(v, operator, value, thenBranch, elseBranch);
          }}
        />

        <View style={styles.opRow}>
          {OPERATORS.map((op) => (
            <TouchableOpacity
              key={op}
              style={[styles.opBtn, operator === op && styles.opBtnActive]}
              onPress={() => {
                setOperator(op);
                updateConfig(field, op, value, thenBranch, elseBranch);
              }}
            >
              <Text style={[styles.opText, operator === op && styles.opTextActive]}>
                {op.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Expected Value (e.g. high)"
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={(v) => {
            setValue(v);
            updateConfig(field, operator, v, thenBranch, elseBranch);
          }}
        />
      </View>

      <View style={styles.branchBox}>
        <View style={styles.branchRow}>
          <Text style={[styles.branchLabel, { color: theme.colors.success }]}>
            THEN Branch:
          </Text>
          <TextInput
            style={[styles.input, styles.branchInput]}
            value={thenBranch}
            onChangeText={(v) => {
              setThenBranch(v);
              updateConfig(field, operator, value, v, elseBranch);
            }}
          />
        </View>

        <View style={styles.branchRow}>
          <Text style={[styles.branchLabel, { color: theme.colors.warning }]}>
            ELSE Branch:
          </Text>
          <TextInput
            style={[styles.input, styles.branchInput]}
            value={elseBranch}
            onChangeText={(v) => {
              setElseBranch(v);
              updateConfig(field, operator, value, thenBranch, v);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  ruleBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  ifLabel: {
    color: theme.colors.primaryLight,
    fontWeight: '900',
    fontSize: theme.typography.sizes.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.xs,
    marginVertical: 4,
  },
  opRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 4,
  },
  opBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  opBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  opText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  opTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  branchBox: {
    marginTop: theme.spacing.sm,
    gap: 6,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchLabel: {
    width: 90,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
  },
  branchInput: {
    flex: 1,
  },
});
