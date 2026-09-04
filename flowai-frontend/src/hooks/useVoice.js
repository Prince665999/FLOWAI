import { useState, useCallback } from 'react';
import { audioRecorder } from '../voice/recorder';
import { audioPlayback } from '../voice/playback';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);

  const startListening = useCallback(async () => {
    setIsRecording(true);
    setTranscript('');
    await audioRecorder.startRecording();
  }, []);

  const stopListening = useCallback(async () => {
    setIsRecording(false);
    setProcessing(true);
    try {
      const result = await audioRecorder.stopRecording();
      // Simulated transcription or backend STT API
      const recognized = "Summarize today's customer support tickets and generate a report";
      setTranscript(recognized);
      return recognized;
    } finally {
      setProcessing(false);
    }
  }, []);

  const speakText = useCallback(async (text) => {
    setIsPlaying(true);
    try {
      await audioPlayback.playAudio(text);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    transcript,
    processing,
    startListening,
    stopListening,
    speakText,
  };
}
