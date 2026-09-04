/**
 * Voice Audio Recorder utility for Expo / React Native
 */
export class AudioRecorder {
  constructor() {
    this.isRecording = false;
    this.audioBuffer = [];
  }

  async startRecording() {
    this.isRecording = true;
    this.audioBuffer = [];
    return { status: 'recording', startedAt: Date.now() };
  }

  async stopRecording() {
    this.isRecording = false;
    const mockAudioBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    return {
      status: 'stopped',
      audioBase64: mockAudioBase64,
      durationMs: 3200,
    };
  }

  getRecordingStatus() {
    return this.isRecording;
  }
}

export const audioRecorder = new AudioRecorder();
