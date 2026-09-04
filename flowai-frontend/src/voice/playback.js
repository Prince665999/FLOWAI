/**
 * Audio Playback utility for Text-to-Speech playback
 */
export class AudioPlayback {
  constructor() {
    this.isPlaying = false;
  }

  async playAudio(audioBase64) {
    this.isPlaying = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isPlaying = false;
        resolve({ status: 'completed' });
      }, 2000);
    });
  }

  stopAudio() {
    this.isPlaying = false;
  }
}

export const audioPlayback = new AudioPlayback();
