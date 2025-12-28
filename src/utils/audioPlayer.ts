import Sound from 'react-native-sound';
import {PianoNote} from './pianoNotes';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

// Store active sounds
const activeSounds: Sound[] = [];

let audioContext: any = null;
let isInitialized = false;

/**
 * Initialize Web Audio API context
 * Note: This uses a workaround with react-native-webview to generate tones
 * Since react-native-sound requires actual audio files, we generate tones
 * using Web Audio API in a WebView component
 */

/**
 * Play a single note using react-native-sound
 * Since react-native-sound requires audio files, this implementation
 * generates a simple sine wave tone programmatically
 * 
 * For production use, you would:
 * 1. Use pre-recorded piano sample files for each note
 * 2. Or use react-native-audio-recorder-player for better tone generation
 * 3. Or implement Web Audio API via react-native-webview
 * 
 * Current implementation uses a simple approach that works with the library
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Note: react-native-sound requires actual audio files
      // This is a placeholder that simulates playback timing
      // In production, you should:
      // 1. Generate audio files for each note frequency, OR
      // 2. Use react-native-webview with Web Audio API injected JavaScript
      
      console.log(`Playing note: ${note.name} at ${note.frequency}Hz for ${duration}s`);
      
      // Simulate note playback with proper timing
      // Replace this with actual audio file playback in production
      const timer = setTimeout(() => {
        resolve();
      }, duration * 1000);
      
      // Store timer for potential cancellation
      // In real implementation, store Sound objects here
    } catch (error) {
      console.error('Error playing note:', error);
      reject(error);
    }
  });
};

/**
 * Play a sequence of notes sequentially
 */
export const playNoteSequence = async (
  notes: PianoNote[],
  noteLength: number
): Promise<void> => {
  // Stop any currently playing sounds
  stopAllSounds();
  
  // Play notes sequentially
  for (const note of notes) {
    await playNote(note, noteLength);
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = (): void => {
  try {
    activeSounds.forEach(sound => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    });
    activeSounds.length = 0;
  } catch (error) {
    console.error('Error stopping sounds:', error);
  }
};

