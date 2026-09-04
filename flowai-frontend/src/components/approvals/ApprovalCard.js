import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

export default function ApprovalCard({ approval, onApprove, onReject, onEdit }) {
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(approval.payload || {}, null, 2)
  );
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(approval.id, comment);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(approval.id, comment);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditAndApprove = async () => {
    setLoading(true);
    try {
      let parsed = approval.payload;
      try {
        parsed = JSON.parse(payloadText);
      } catch (e) {
        alert('Invalid JSON in payload editor');
        setLoading(false);
        return;
      }
      await onEdit(approval.id, parsed, comment);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.danger;
      case 'edited':
        return theme.colors.accent;
      default:
        return theme.colors.warning;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{approval.title}</Text>
          <Text style={styles.actionType}>{approval.action_type}</Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: getStatusBadgeColor(approval.status) + '22' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: getStatusBadgeColor(approval.status) },
            ]}
          >
            {approval.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {approval.description ? (
        <Text style={styles.description}>{approval.description}</Text>
      ) : null}

      <View style={styles.payloadBox}>
        <Text style={styles.payloadHeader}>Proposed Action Data:</Text>
        {isEditing ? (
          <TextInput
            style={styles.payloadInput}
            multiline
            value={payloadText}
            onChangeText={setPayloadText}
            placeholder="Edit JSON data..."
            placeholderTextColor={theme.colors.textMuted}
          />
        ) : (
          <Text style={styles.payloadCode}>
            {JSON.stringify(approval.payload || {}, null, 2)}
          </Text>
        )}
      </View>

      {approval.status === 'pending' && (
        <View style={styles.actionSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add reviewer comment (optional)..."
            placeholderTextColor={theme.colors.textMuted}
            value={comment}
            onChangeText={setComment}
          />

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} />
          ) : (
            <View style={styles.buttonsRow}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnApprove]}
                    onPress={handleSaveEditAndApprove}
                  >
                    <Text style={styles.btnText}>Save & Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnApprove]}
                    onPress={handleApprove}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnEdit]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.btnEditText}>Edit & Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnReject]}
                    onPress={handleReject}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {approval.reviewed_at && (
        <View style={styles.reviewedFooter}>
          <Text style={styles.reviewedText}>
            Reviewed on {new Date(approval.reviewed_at).toLocaleString()}
          </Text>
          {approval.review_comment ? (
            <Text style={styles.commentText}>Note: "{approval.review_comment}"</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  actionType: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.sm,
  },
  payloadBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  payloadHeader: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  payloadCode: {
    color: '#34D399',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  payloadInput: {
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    fontFamily: 'Courier',
    fontSize: 12,
    minHeight: 80,
  },
  actionSection: {
    marginTop: theme.spacing.sm,
  },
  commentInput: {
    backgroundColor: theme.colors.surfaceLight,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApprove: {
    backgroundColor: theme.colors.success,
  },
  btnEdit: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  btnReject: {
    backgroundColor: theme.colors.danger,
  },
  btnSecondary: {
    backgroundColor: theme.colors.surfaceHover,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },
  btnEditText: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },
  btnSecondaryText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: theme.typography.sizes.sm,
  },
  reviewedFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
  },
  commentText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
