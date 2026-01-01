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
 * Fade out a sound smoothly over a specified duration
 * Uses exponential fade for more natural sound
 */
const fadeOutSound = (sound: Sound, fadeDuration: number): Promise<void> => {
  return new Promise((resolve) => {
    const fadeSteps = 30; // Increased steps for smoother fade
    const stepDuration = fadeDuration / fadeSteps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      // Use exponential fade for more natural sound (ease-out curve)
      const progress = currentStep / fadeSteps;
      const newVolume = Math.max(0, 1.0 - (progress * progress)); // Quadratic ease-out
      
      try {
        if (sound && sound.isPlaying()) {
          sound.setVolume(newVolume);
        }
        
        if (currentStep >= fadeSteps || newVolume <= 0) {
          clearInterval(fadeInterval);
          if (sound && sound.isPlaying()) {
            sound.stop();
            sound.setVolume(1.0); // Reset volume for next play
          }
          resolve();
        }
      } catch (error) {
        clearInterval(fadeInterval);
        if (sound && sound.isPlaying()) {
          sound.stop();
        }
        resolve();
      }
    }, stepDuration);
  });
};

/**
 * Play a single note using react-native-sound with MP3 files
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let sound: Sound | null = null;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let completed = false;
    let isFading = false;
    const fadeDuration = 250; // Fade out duration in milliseconds (increased for more subtle effect)
    
    const cleanup = async (shouldFade: boolean = false) => {
      if (!completed) {
        completed = true;
        if (stopTimer) {
          clearTimeout(stopTimer);
          stopTimer = null;
        }
        if (fadeTimer) {
          clearTimeout(fadeTimer);
          fadeTimer = null;
        }
        
        if (sound && sound.isPlaying()) {
          if (shouldFade && !isFading) {
            // Fade out smoothly
            isFading = true;
            await fadeOutSound(sound, fadeDuration);
          } else if (!shouldFade) {
            // Immediate stop (for errors)
            sound.stop();
          }
        }
      }
    };
    
    try {
      sound = await loadSound(note);
      
      // Set volume
      sound.setVolume(1.0);
      sound.setNumberOfLoops(0);
      
      // Store reference for potential cleanup
      const soundKey = `${note.name}-${Date.now()}`;
      activeSounds.set(soundKey, sound);
      
      // Calculate when to start fade out (before the note ends)
      const fadeStartTime = Math.max(0, (duration * 1000) - fadeDuration);
      
      // Set up fade-out timer
      fadeTimer = setTimeout(async () => {
        if (!completed && sound && sound.isPlaying() && !isFading) {
          isFading = true;
          await fadeOutSound(sound, fadeDuration);
        }
      }, fadeStartTime);
      
      // Set up duration control (after fade completes)
      stopTimer = setTimeout(async () => {
        await cleanup(false);
        activeSounds.delete(soundKey);
        resolve();
      }, duration * 1000);
      
      // Play the sound
      sound.play(async (success) => {
        if (completed) return;
        
        if (success) {
          // Sound finished playing naturally (might be shorter than duration)
          // Apply fade-out even if it finished early
          if (!isFading && sound && sound.isPlaying()) {
            isFading = true;
            await fadeOutSound(sound, fadeDuration);
          }
          await cleanup(false);
          activeSounds.delete(soundKey);
          resolve();
        } else {
          await cleanup(false);
          activeSounds.delete(soundKey);
          console.error(`Failed to play note: ${note.name}`);
          reject(new Error(`Failed to play note: ${note.name}`));
        }
      });
      
    } catch (error) {
      await cleanup(false);
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
  await stopAllSounds();
  
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
 * Stop all currently playing sounds with fade-out effect
 */
export const stopAllSounds = async (): Promise<void> => {
  try {
    const fadePromises: Promise<void>[] = [];
    activeSounds.forEach((sound, key) => {
      if (sound && sound.isPlaying()) {
        fadePromises.push(fadeOutSound(sound, 250)); // Use same fade duration as playNote
      }
      activeSounds.delete(key);
    });
    await Promise.all(fadePromises);
  } catch (error) {
    console.error('Error stopping sounds:', error);
  }
};

/**
 * Release all cached sounds (call this when component unmounts)
 */
export const releaseAllSounds = async (): Promise<void> => {
  try {
    await stopAllSounds();
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

