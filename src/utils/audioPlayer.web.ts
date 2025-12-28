/**
 * Web-compatible audio player using HTML5 Audio with MP3 files
 */
import {PianoNote} from './pianoNotes';
import {getMp3Path} from './noteToMp3';

// Store active audio elements for cleanup
const activeAudioElements: HTMLAudioElement[] = [];

/**
 * Play a single note using HTML5 Audio with MP3 files
 */
export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audioPath = getMp3Path(note, true);
      const audio = new Audio(audioPath);
      
      // Handle audio loading errors
      audio.onerror = (error) => {
        console.error(`Error loading audio: ${audioPath}`, error);
        reject(new Error(`Failed to load audio: ${audioPath}`));
      };
      
      // Stop after specified duration
      const stopTimer = setTimeout(() => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
        const index = activeAudioElements.indexOf(audio);
        if (index > -1) {
          activeAudioElements.splice(index, 1);
        }
        resolve();
      }, duration * 1000);
      
      // Handle natural end of audio (if it's shorter than duration)
      audio.onended = () => {
        clearTimeout(stopTimer);
        const index = activeAudioElements.indexOf(audio);
        if (index > -1) {
          activeAudioElements.splice(index, 1);
        }
        resolve();
      };
      
      // Start playback
      audio.volume = 1.0;
      audio.play().catch((error) => {
        console.error(`Error playing audio: ${audioPath}`, error);
        clearTimeout(stopTimer);
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
  noteLength: number
): Promise<void> => {
  // Stop any currently playing sounds
  stopAllSounds();
  
  // Play notes sequentially
  for (const note of notes) {
    await playNote(note, noteLength);
  }
};

export const stopAllSounds = (): void => {
  // Stop and cleanup all active audio elements
  activeAudioElements.forEach((audio) => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  activeAudioElements.length = 0;
};

