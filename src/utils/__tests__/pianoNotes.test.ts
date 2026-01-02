import {
  generatePianoKeys,
  PianoNote,
  compareNotes,
  isNoteInRange,
  isSharp,
  isNatural,
  generateRandomNotes,
  notesToString,
  stringToNotes,
  isValidPianoNote,
  stringToPianoNote,
} from '../pianoNotes';

describe('pianoNotes', () => {
  describe('generatePianoKeys', () => {
    it('should generate exactly 88 keys', () => {
      const keys = generatePianoKeys();
      expect(keys).toHaveLength(88);
    });

    it('should start with A0', () => {
      const keys = generatePianoKeys();
      expect(keys[0].name).toBe('A0');
    });

    it('should end with C8', () => {
      const keys = generatePianoKeys();
      expect(keys[87].name).toBe('C8');
    });

    it('should have A0 frequency of 27.5 Hz', () => {
      const keys = generatePianoKeys();
      expect(keys[0].frequency).toBeCloseTo(27.5, 1);
    });

    it('should have A4 (key 49) frequency of 440 Hz', () => {
      const keys = generatePianoKeys();
      expect(keys[48].name).toBe('A4');
      expect(keys[48].frequency).toBeCloseTo(440, 1);
    });

    it('should have correct octave values', () => {
      const keys = generatePianoKeys();
      expect(keys[0].octave).toBe(0); // A0
      expect(keys[2].octave).toBe(0); // B0
      expect(keys[3].octave).toBe(1); // C1
      expect(keys[48].octave).toBe(4); // A4
      expect(keys[87].octave).toBe(8); // C8
    });

    it('should have increasing frequencies', () => {
      const keys = generatePianoKeys();
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i].frequency).toBeGreaterThan(keys[i - 1].frequency);
      }
    });

    it('should have correct note sequence', () => {
      const keys = generatePianoKeys();
      // First few notes: A0, A#0, B0, C1, C#1, D1...
      expect(keys[0].name).toBe('A0');
      expect(keys[1].name).toBe('A#0');
      expect(keys[2].name).toBe('B0');
      expect(keys[3].name).toBe('C1');
      expect(keys[4].name).toBe('C#1');
      expect(keys[5].name).toBe('D1');
    });
  });

  describe('compareNotes', () => {
    it('should return negative when first note has lower frequency', () => {
      const note1: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const note2: PianoNote = { name: 'D4', frequency: 293.66, octave: 4 };
      expect(compareNotes(note1, note2)).toBeLessThan(0);
    });

    it('should return positive when first note has higher frequency', () => {
      const note1: PianoNote = { name: 'D4', frequency: 293.66, octave: 4 };
      const note2: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      expect(compareNotes(note1, note2)).toBeGreaterThan(0);
    });

    it('should return zero when notes have same frequency', () => {
      const note1: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const note2: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      expect(compareNotes(note1, note2)).toBe(0);
    });
  });

  describe('isNoteInRange', () => {
    const minNote: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
    const maxNote: PianoNote = { name: 'E4', frequency: 329.63, octave: 4 };

    it('should return true for note within range', () => {
      const note: PianoNote = { name: 'D4', frequency: 293.66, octave: 4 };
      expect(isNoteInRange(note, minNote, maxNote)).toBe(true);
    });

    it('should return true for note at minimum boundary', () => {
      expect(isNoteInRange(minNote, minNote, maxNote)).toBe(true);
    });

    it('should return true for note at maximum boundary', () => {
      expect(isNoteInRange(maxNote, minNote, maxNote)).toBe(true);
    });

    it('should return false for note below range', () => {
      const note: PianoNote = { name: 'B3', frequency: 246.94, octave: 3 };
      expect(isNoteInRange(note, minNote, maxNote)).toBe(false);
    });

    it('should return false for note above range', () => {
      const note: PianoNote = { name: 'F4', frequency: 349.23, octave: 4 };
      expect(isNoteInRange(note, minNote, maxNote)).toBe(false);
    });
  });

  describe('isSharp', () => {
    it('should return true for sharp notes', () => {
      const note: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      expect(isSharp(note)).toBe(true);
    });

    it('should return false for natural notes', () => {
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      expect(isSharp(note)).toBe(false);
    });
  });

  describe('isNatural', () => {
    it('should return true for natural notes', () => {
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      expect(isNatural(note)).toBe(true);
    });

    it('should return false for sharp notes', () => {
      const note: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      expect(isNatural(note)).toBe(false);
    });
  });

  describe('generateRandomNotes', () => {
    beforeEach(() => {
      // Seed Math.random for predictable tests
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should generate correct number of notes', () => {
      const notes = generateRandomNotes(0.5, 2.0);
      expect(notes).toHaveLength(4); // 2.0 / 0.5 = 4
    });

    it('should generate notes from all available keys when no range specified', () => {
      const notes = generateRandomNotes(0.5, 1.0);
      expect(notes.length).toBeGreaterThan(0);
      // All notes should be valid piano notes
      notes.forEach(note => {
        expect(note.name).toBeDefined();
        expect(note.frequency).toBeGreaterThan(0);
      });
    });

    it('should filter notes by range when min and max provided', () => {
      const minNote: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const maxNote: PianoNote = { name: 'E4', frequency: 329.63, octave: 4 };
      const notes = generateRandomNotes(0.5, 2.0, minNote, maxNote);
      
      notes.forEach(note => {
        expect(isNoteInRange(note, minNote, maxNote)).toBe(true);
      });
    });

    it('should exclude sharps when useSharps is false', () => {
      const notes = generateRandomNotes(0.5, 2.0, undefined, undefined, false, true);
      notes.forEach(note => {
        expect(isSharp(note)).toBe(false);
      });
    });

    it('should exclude naturals when useFlats is false', () => {
      const notes = generateRandomNotes(0.5, 2.0, undefined, undefined, true, false);
      notes.forEach(note => {
        expect(isNatural(note)).toBe(false);
      });
    });

    it('should fallback to all keys if filters result in empty set', () => {
      const minNote: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const maxNote: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      // Request only naturals in a range that only has sharps
      const notes = generateRandomNotes(0.5, 1.0, minNote, maxNote, false, true);
      // Should fallback to all keys, so we should get some notes
      expect(notes.length).toBeGreaterThan(0);
    });

    it('should handle zero total length', () => {
      const notes = generateRandomNotes(0.5, 0);
      expect(notes).toHaveLength(0);
    });

    it('should handle note length greater than total length', () => {
      const notes = generateRandomNotes(2.0, 1.0);
      expect(notes).toHaveLength(0);
    });
  });

  describe('notesToString and stringToNotes', () => {
    it('should convert notes array to JSON string and back', () => {
      const originalNotes: PianoNote[] = [
        { name: 'C4', frequency: 261.63, octave: 4 },
        { name: 'D4', frequency: 293.66, octave: 4 },
        { name: 'E4', frequency: 329.63, octave: 4 },
      ];
      
      const jsonString = notesToString(originalNotes);
      expect(typeof jsonString).toBe('string');
      
      const convertedNotes = stringToNotes(jsonString);
      expect(convertedNotes).toHaveLength(3);
      expect(convertedNotes[0].name).toBe('C4');
      expect(convertedNotes[1].name).toBe('D4');
      expect(convertedNotes[2].name).toBe('E4');
    });

    it('should handle empty array', () => {
      const originalNotes: PianoNote[] = [];
      const jsonString = notesToString(originalNotes);
      const convertedNotes = stringToNotes(jsonString);
      expect(convertedNotes).toHaveLength(0);
    });

    it('should preserve all note properties', () => {
      const originalNotes: PianoNote[] = [
        { name: 'C#4', frequency: 277.18, octave: 4 },
      ];
      
      const jsonString = notesToString(originalNotes);
      const convertedNotes = stringToNotes(jsonString);
      
      expect(convertedNotes[0].name).toBe('C#4');
      expect(convertedNotes[0].frequency).toBe(277.18);
      expect(convertedNotes[0].octave).toBe(4);
    });
  });

  describe('isValidPianoNote', () => {
    it('should return true for valid natural notes', () => {
      expect(isValidPianoNote('C4')).toBe(true);
      expect(isValidPianoNote('A0')).toBe(true);
      expect(isValidPianoNote('B7')).toBe(true);
    });

    it('should return true for valid sharp notes', () => {
      expect(isValidPianoNote('C#4')).toBe(true);
      expect(isValidPianoNote('F#5')).toBe(true);
    });

    it('should return false for invalid note names', () => {
      expect(isValidPianoNote('H4')).toBe(false); // H is not a valid note
      expect(isValidPianoNote('C')).toBe(false); // Missing octave
      expect(isValidPianoNote('4')).toBe(false); // Missing note name
    });

    it('should return false for invalid octaves', () => {
      expect(isValidPianoNote('C9')).toBe(false); // Octave 9 doesn't exist
      expect(isValidPianoNote('C-1')).toBe(false); // Negative octave
    });

    it('should return false for notes that do not exist in piano range', () => {
      // A0 exists, but let's check edge cases
      expect(isValidPianoNote('C0')).toBe(false); // C0 doesn't exist in 88-key piano
    });

    it('should return false for empty string', () => {
      expect(isValidPianoNote('')).toBe(false);
    });

    it('should return false for malformed strings', () => {
      expect(isValidPianoNote('C#')).toBe(false);
      expect(isValidPianoNote('#4')).toBe(false);
      expect(isValidPianoNote('C##4')).toBe(false);
    });
  });

  describe('stringToPianoNote', () => {
    it('should convert valid note string to PianoNote', () => {
      const note = stringToPianoNote('C4');
      expect(note).not.toBeNull();
      expect(note?.name).toBe('C4');
      expect(note?.frequency).toBeCloseTo(261.63, 1);
      expect(note?.octave).toBe(4);
    });

    it('should convert valid sharp note string to PianoNote', () => {
      const note = stringToPianoNote('C#4');
      expect(note).not.toBeNull();
      expect(note?.name).toBe('C#4');
      expect(note?.frequency).toBeCloseTo(277.18, 1);
    });

    it('should return null for invalid note string', () => {
      expect(stringToPianoNote('H4')).toBeNull();
      expect(stringToPianoNote('C9')).toBeNull();
      expect(stringToPianoNote('')).toBeNull();
    });

    it('should return null for notes outside piano range', () => {
      expect(stringToPianoNote('C0')).toBeNull();
    });
  });
});

