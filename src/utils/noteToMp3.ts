/**
 * Utility to map piano note names to MP3 filenames
 * Note names use sharps (C#) but MP3 files use flats (Db)
 */

import {PianoNote} from './pianoNotes';

// Map sharp names to flat names for MP3 filenames
const sharpToFlat: {[key: string]: string} = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

/**
 * Convert a note name like "C#4" to MP3 filename like "Db4.mp3"
 */
export const noteNameToMp3Filename = (noteName: string): string => {
  // Extract the note and octave (e.g., "C#4" -> ["C#", "4"])
  let note = '';
  let octave = '';
  
  // Handle sharp/flat notes
  if (noteName.length >= 3 && (noteName[1] === '#' || noteName[1] === 'b')) {
    note = noteName.substring(0, 2);
    octave = noteName.substring(2);
  } else {
    note = noteName.substring(0, 1);
    octave = noteName.substring(1);
  }
  
  // Convert sharp to flat if needed
  const mp3Note = sharpToFlat[note] || note;
  
  return `${mp3Note}${octave}.mp3`;
};

/**
 * Get the MP3 filename for a PianoNote
 */
export const getMp3Filename = (note: PianoNote): string => {
  return noteNameToMp3Filename(note.name);
};

/**
 * Get the base path for web assets (handles GitHub Pages subdirectory)
 */
const getWebBasePath = (): string => {
  if (typeof window === 'undefined') {
    return '/';
  }
  // Get the pathname and extract the base path
  // For GitHub Pages: /repository-name/ -> /repository-name/
  // For root domain: / -> /
  const pathname = window.location.pathname;
  // Remove index.html if present
  const basePath = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
  return basePath === '/' ? '/' : `${basePath}/`;
};

/**
 * Get the path to the MP3 file for a note
 * For React Native, this returns the filename (files need to be in res/raw or bundled)
 * For Web, this returns the public path (handles GitHub Pages subdirectory)
 */
export const getMp3Path = (note: PianoNote, isWeb: boolean = false): string => {
  const filename = getMp3Filename(note);
  
  if (isWeb) {
    // For web, use base path to handle GitHub Pages subdirectory
    const basePath = getWebBasePath();
    return `${basePath}piano-mp3/${filename}`;
  }
  
  // For React Native (Android), react-native-sound will look in res/raw
  // For iOS, files need to be in the bundle
  // Return just the filename without extension for react-native-sound
  return filename.replace('.mp3', '');
};

