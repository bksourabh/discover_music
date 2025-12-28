import Sound from 'react-native-sound';
import {PianoNote} from './pianoNotes';
import {getMp3Filename} from './noteToMp3';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

// Store active sounds for cleanup
const activeSounds: Map<string, Sound> = new Map();

// Cache of loaded sounds to avoid reloading
const soundCache: Map<string, Sound> = new Map();

/**
 * Load a sound file for a note
 * For Android: files should be in android/app/src/main/res/raw/ (without .mp3 extension)
 * For iOS: files should be bundled or in the app bundle
 */
const loadSound = (note: PianoNote): Promise<Sound> => {
  return new Promise((resolve, reject) => {
    const filename = getMp3Filename(note);
    // Remove .mp3 extension for react-native-sound (it expects just the filename)
    const soundName = filename.replace('.mp3', '');
    
    // Check cache first
    if (soundCache.has(soundName)) {
      const cachedSound = soundCache.get(soundName)!;
      // Create a new instance from the cached sound to allow multiple simultaneous plays
      const sound = new Sound(soundName, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error(`Error loading sound ${soundName}:`, error);
          reject(error);
        } else {
          resolve(sound);
        }
      });
      return;
    }
    
    // Load new sound
    // For Android: Sound.MAIN_BUNDLE looks in res/raw/
    // For iOS: needs to be in the bundle
    const sound = new Sound(soundName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error(`Error loading sound ${soundName}:`, error);
        reject(error);
      } else {
        soundCache.set(soundName, sound);
        resolve(sound);
      }
    });
  });
};

/**
 * Play a single note using react-native-sound with MP3 files
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let sound: Sound | null = null;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;
    let completed = false;
    
    const cleanup = () => {
      if (!completed) {
        completed = true;
        if (stopTimer) {
          clearTimeout(stopTimer);
        }
        if (sound && sound.isPlaying()) {
          sound.stop();
        }
      }
    };
    
    try {
      sound = await loadSound(note);
      
      // Set volume
      sound.setVolume(1.0);
      sound.setNumberOfLoops(0);
      
      // Set up duration control
      stopTimer = setTimeout(() => {
        cleanup();
        resolve();
      }, duration * 1000);
      
      // Store reference for potential cleanup
      const soundKey = `${note.name}-${Date.now()}`;
      activeSounds.set(soundKey, sound);
      
      // Play the sound
      sound.play((success) => {
        if (completed) return;
        
        if (success) {
          // Sound finished playing (might be shorter than duration)
          cleanup();
          activeSounds.delete(soundKey);
          resolve();
        } else {
          cleanup();
          activeSounds.delete(soundKey);
          console.error(`Failed to play note: ${note.name}`);
          reject(new Error(`Failed to play note: ${note.name}`));
        }
      });
      
    } catch (error) {
      cleanup();
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
  noteLength: number,
  onNoteStart?: (note: PianoNote) => void,
  onNoteEnd?: (note: PianoNote) => void
): Promise<void> => {
  // Stop any currently playing sounds
  stopAllSounds();
  
  // Play notes sequentially
  for (const note of notes) {
    if (onNoteStart) {
      onNoteStart(note);
    }
    await playNote(note, noteLength);
    if (onNoteEnd) {
      onNoteEnd(note);
    }
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = (): void => {
  try {
    activeSounds.forEach((sound, key) => {
      if (sound && sound.isPlaying()) {
        sound.stop();
      }
      activeSounds.delete(key);
    });
  } catch (error) {
    console.error('Error stopping sounds:', error);
  }
};

/**
 * Release all cached sounds (call this when component unmounts)
 */
export const releaseAllSounds = (): void => {
  try {
    stopAllSounds();
    soundCache.forEach((sound) => {
      if (sound) {
        sound.release();
      }
    });
    soundCache.clear();
  } catch (error) {
    console.error('Error releasing sounds:', error);
  }
};

