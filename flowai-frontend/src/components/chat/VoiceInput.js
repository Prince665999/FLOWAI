import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useVoice } from '../../hooks/useVoice';
import { theme } from '../../theme';

export default function VoiceInput({ onVoiceCommand }) {
  const { isRecording, processing, startListening, stopListening } = useVoice();

  const handlePress = async () => {
    if (isRecording) {
      const text = await stopListening();
      if (text && onVoiceCommand) {
        onVoiceCommand(text);
      }
    } else {
      await startListening();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.micButton,
          isRecording && styles.micRecording,
        ]}
        onPress={handlePress}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.micIcon}>
            {isRecording ? '⏹ Stop' : '🎙 Voice'}
          </Text>
        )}
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.recordingLabel}>Listening to voice command...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  micButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRecording: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.dangerLight,
  },
  micIcon: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
  },
  recordingLabel: {
    color: theme.colors.dangerLight,
    fontSize: theme.typography.sizes.xs,
    marginTop: 4,
    fontWeight: '600',
  },
});
