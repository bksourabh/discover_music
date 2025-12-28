/**
 * Web-compatible audio player using HTML5 Audio with MP3 files
 */
import {PianoNote} from './pianoNotes';
import {getMp3Path} from './noteToMp3';

// Store active audio elements for cleanup
const activeAudioElements: HTMLAudioElement[] = [];

// Store fade intervals for cleanup
const fadeIntervals: Map<HTMLAudioElement, ReturnType<typeof setInterval>> = new Map();

/**
 * Fade out an audio element smoothly over a specified duration
 */
const fadeOutAudio = (audio: HTMLAudioElement, fadeDuration: number): Promise<void> => {
  return new Promise((resolve) => {
    // Clear any existing fade interval for this audio
    const existingInterval = fadeIntervals.get(audio);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    const fadeSteps = 20; // Number of steps for smooth fade
    const stepDuration = fadeDuration / fadeSteps;
    const volumeStep = audio.volume / fadeSteps;
    let currentStep = 0;
    const startVolume = audio.volume;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, startVolume - (currentStep * volumeStep));
      
      try {
        if (audio && !audio.paused) {
          audio.volume = newVolume;
        }
        
        if (currentStep >= fadeSteps || newVolume <= 0) {
          clearInterval(fadeInterval);
          fadeIntervals.delete(audio);
          if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0; // Reset volume for next play
          }
          resolve();
        }
      } catch (error) {
        clearInterval(fadeInterval);
        fadeIntervals.delete(audio);
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
        resolve();
      }
    }, stepDuration);
    
    fadeIntervals.set(audio, fadeInterval);
  });
};

/**
 * Play a single note using HTML5 Audio with MP3 files
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audioPath = getMp3Path(note, true);
      const audio = new Audio(audioPath);
      const fadeDuration = 150; // Fade out duration in milliseconds
      let stopTimer: ReturnType<typeof setTimeout> | null = null;
      let fadeTimer: ReturnType<typeof setTimeout> | null = null;
      let completed = false;
      
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
          
          const index = activeAudioElements.indexOf(audio);
          if (index > -1) {
            activeAudioElements.splice(index, 1);
          }
          
          // Clear any fade interval
          const existingInterval = fadeIntervals.get(audio);
          if (existingInterval) {
            clearInterval(existingInterval);
            fadeIntervals.delete(audio);
          }
          
          if (!audio.paused) {
            if (shouldFade) {
              // Fade out smoothly
              await fadeOutAudio(audio, fadeDuration);
            } else {
              // Immediate stop (for errors)
              audio.pause();
              audio.currentTime = 0;
            }
          }
        }
      };
      
      // Handle audio loading errors
      audio.onerror = async (error) => {
        console.error(`Error loading audio: ${audioPath}`, error);
        await cleanup(false);
        reject(new Error(`Failed to load audio: ${audioPath}`));
      };
      
      // Calculate when to start fade out (before the note ends)
      const fadeStartTime = Math.max(0, (duration * 1000) - fadeDuration);
      
      // Set up fade-out timer
      fadeTimer = setTimeout(async () => {
        if (!completed && !audio.paused) {
          await fadeOutAudio(audio, fadeDuration);
        }
      }, fadeStartTime);
      
      // Stop after specified duration (slightly after fade completes)
      stopTimer = setTimeout(async () => {
        await cleanup(false);
        resolve();
      }, duration * 1000);
      
      // Handle natural end of audio (if it's shorter than duration)
      audio.onended = async () => {
        await cleanup(false);
        resolve();
      };
      
      // Start playback
      audio.volume = 1.0;
      audio.play().catch(async (error) => {
        console.error(`Error playing audio: ${audioPath}`, error);
        await cleanup(false);
        reject(error);
      });
      
      // Track active audio
      activeAudioElements.push(audio);
      
    } catch (error) {
      console.error('Error playing note:', error);
      reject(error);
    }
  });
};

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

export const stopAllSounds = async (): Promise<void> => {
  // Stop and cleanup all active audio elements with fade-out
  const fadePromises: Promise<void>[] = [];
  activeAudioElements.forEach((audio) => {
    if (!audio.paused) {
      fadePromises.push(fadeOutAudio(audio, 150));
    }
  });
  await Promise.all(fadePromises);
  activeAudioElements.length = 0;
};

