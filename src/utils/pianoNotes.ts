/**
 * Piano note frequency generator
 * Full 88-key piano range: A0 (27.5 Hz) to C8 (4186 Hz)
 */

export interface PianoNote {
  name: string;
  frequency: number;
  octave: number;
}

// Generate all 88 piano keys
export const generatePianoKeys = (): PianoNote[] => {
  const keys: PianoNote[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Piano starts at A0 (key 1) and goes to C8 (key 88)
  // Standard piano: A0, A#0, B0, then C1-C8, B7, C8
  // Key number 1 = A0 (27.5 Hz)
  // Key number 49 = A4 (440 Hz)
  
  // A0 is at index 9 in noteNames (A)
  let noteIndex = 9; // Start at A
  let octave = 0;
  
  for (let keyNumber = 1; keyNumber <= 88; keyNumber++) {
    const noteName = noteNames[noteIndex];
    const fullName = `${noteName}${octave}`;
    
    // Calculate frequency using the formula: f = 27.5 * 2^((n-1)/12)
    // Where n is the key number (1-88)
    // This gives A0 = 27.5 Hz when n=1
    const frequency = 27.5 * Math.pow(2, (keyNumber - 1) / 12);
    
    keys.push({
      name: fullName,
      frequency: frequency,
      octave: octave,
    });
    
    // Move to next note
    noteIndex = (noteIndex + 1) % 12;
    
    // When we cycle back to C, increment octave
    if (noteIndex === 0) {
      octave++;
    }
  }
  
  return keys;
};

// Get all piano keys
const ALL_PIANO_KEYS = generatePianoKeys();

/**
 * Compare two piano notes to determine their order
 * Returns negative if note1 < note2, positive if note1 > note2, 0 if equal
 */
export const compareNotes = (note1: PianoNote, note2: PianoNote): number => {
  return note1.frequency - note2.frequency;
};

/**
 * Check if a note is within the specified range (inclusive)
 */
export const isNoteInRange = (note: PianoNote, minNote: PianoNote, maxNote: PianoNote): boolean => {
  return note.frequency >= minNote.frequency && note.frequency <= maxNote.frequency;
};

/**
 * Generate random piano notes for the given duration
 * @param noteLength Length of each note in seconds
 * @param totalLength Total length of the sequence in seconds
 * @param minNote Optional minimum note for range filtering
 * @param maxNote Optional maximum note for range filtering
 * @returns Array of randomly selected piano notes
 */
export const generateRandomNotes = (
  noteLength: number,
  totalLength: number,
  minNote?: PianoNote,
  maxNote?: PianoNote
): PianoNote[] => {
  const numNotes = Math.floor(totalLength / noteLength);
  const notes: PianoNote[] = [];
  
  // Filter keys by range if provided
  let availableKeys = ALL_PIANO_KEYS;
  if (minNote && maxNote) {
    availableKeys = ALL_PIANO_KEYS.filter(key => 
      isNoteInRange(key, minNote, maxNote)
    );
  }
  
  if (availableKeys.length === 0) {
    // Fallback to all keys if range is invalid
    availableKeys = ALL_PIANO_KEYS;
  }
  
  for (let i = 0; i < numNotes; i++) {
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    notes.push(availableKeys[randomIndex]);
  }
  
  return notes;
};

/**
 * Convert notes array to JSON string for storage
 */
export const notesToString = (notes: PianoNote[]): string => {
  return JSON.stringify(notes);
};

/**
 * Convert JSON string back to notes array
 */
export const stringToNotes = (notesString: string): PianoNote[] => {
  return JSON.parse(notesString);
};

