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
 * Uses exponential fade for more natural sound
 */
const fadeOutAudio = (audio: HTMLAudioElement, fadeDuration: number): Promise<void> => {
  return new Promise((resolve) => {
    // Clear any existing fade interval for this audio
    const existingInterval = fadeIntervals.get(audio);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    const fadeSteps = 30; // Increased steps for smoother fade
    const stepDuration = fadeDuration / fadeSteps;
    let currentStep = 0;
    const startVolume = audio.volume;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      // Use exponential fade for more natural sound (ease-out curve)
      const progress = currentStep / fadeSteps;
      const newVolume = Math.max(0, startVolume * (1.0 - (progress * progress))); // Quadratic ease-out
      
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
 * Safari-compatible implementation with proper loading and playback handling
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audioPath = getMp3Path(note, true);
      const audio = new Audio(audioPath);
      
      // Safari-specific fixes:
      // 1. Set preload to auto for Safari
      audio.preload = 'auto';
      // 2. Ensure volume is set before loading (Safari quirk)
      audio.volume = 1.0;
      
      const fadeDuration = 250; // Fade out duration in milliseconds (increased for more subtle effect)
      let stopTimer: ReturnType<typeof setTimeout> | null = null;
      let fadeTimer: ReturnType<typeof setTimeout> | null = null;
      let completed = false;
      let isFading = false;
      let loadTimeout: ReturnType<typeof setTimeout> | null = null;
      
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
          if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
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
            if (shouldFade && !isFading) {
              // Fade out smoothly
              isFading = true;
              await fadeOutAudio(audio, fadeDuration);
            } else if (!shouldFade) {
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
      
      // Set up fade-out timer (will be set after audio starts playing)
      const setupFadeOut = () => {
        if (completed) return;
        fadeTimer = setTimeout(async () => {
          if (!completed && !audio.paused && !isFading) {
            isFading = true;
            await fadeOutAudio(audio, fadeDuration);
          }
        }, fadeStartTime);
      };
      
      // Set up stop timer (will be set after audio starts playing)
      const setupStopTimer = () => {
        if (completed) return;
        stopTimer = setTimeout(async () => {
          await cleanup(false);
          resolve();
        }, duration * 1000);
      };
      
      // Handle natural end of audio (if it's shorter than duration)
      audio.onended = async () => {
        // Apply fade-out even if audio ended naturally
        if (!isFading && !audio.paused) {
          isFading = true;
          await fadeOutAudio(audio, fadeDuration);
        }
        await cleanup(false);
        resolve();
      };
      
      // Safari-compatible playback function
      const startPlayback = () => {
        if (completed) return;
        
        // Safari fix: Reset currentTime before playing to ensure clean playback
        audio.currentTime = 0;
        
        setupFadeOut();
        setupStopTimer();
        
        // Start playback - Safari requires proper error handling
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(async (error) => {
            console.error(`Error playing audio: ${audioPath}`, error);
            await cleanup(false);
            reject(error);
          });
        }
      };
      
      // For Safari: explicitly load and wait for audio to be ready
      // Safari requires load() to be called and audio to be ready before play()
      const loadAudio = () => {
        // Check if audio is already loaded enough to play
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA = 2
          startPlayback();
          return;
        }
        
        // Set up timeout for loading
        loadTimeout = setTimeout(() => {
          // Safari sometimes works even if readyState isn't 2, so try anyway
          startPlayback();
        }, 100);
        
        // Listen for when audio is ready to play
        const onCanPlay = () => {
          if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
          }
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('loadeddata', onCanPlay);
          startPlayback();
        };
        
        // Try multiple events for better browser compatibility
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
        audio.addEventListener('loadeddata', onCanPlay, { once: true });
        
        // Explicitly call load() for Safari compatibility
        audio.load();
      };
      
      // Start loading audio
      loadAudio();
      
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
  onNoteEnd?: (note: PianoNote) => void,
  onTimeUpdate?: (time: number) => void
): Promise<void> => {
  // Stop any currently playing sounds
  await stopAllSounds();
  
  let currentTime = 0;
  const updateInterval = 50; // Update every 50ms for smooth progress indication
  
  // Set up interval to update progress
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  if (onTimeUpdate) {
    progressInterval = setInterval(() => {
      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
    }, updateInterval);
  }
  
  try {
    // Play notes sequentially
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (onNoteStart) {
        onNoteStart(note);
      }
      
      // Update time at the start of each note
      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
      
      await playNote(note, noteLength);
      currentTime += noteLength;
      
      // Update time after each note
      if (onTimeUpdate) {
        onTimeUpdate(currentTime);
      }
      
      if (onNoteEnd) {
        onNoteEnd(note);
      }
    }
  } finally {
    // Clear interval when done
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }
};

export const stopAllSounds = async (): Promise<void> => {
  // Stop and cleanup all active audio elements with fade-out
  const fadePromises: Promise<void>[] = [];
  activeAudioElements.forEach((audio) => {
    if (!audio.paused) {
      fadePromises.push(fadeOutAudio(audio, 250)); // Use same fade duration as playNote
    }
  });
  await Promise.all(fadePromises);
  activeAudioElements.length = 0;
};

