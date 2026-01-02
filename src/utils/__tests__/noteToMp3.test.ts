import { noteNameToMp3Filename, getMp3Filename, getMp3Path } from '../noteToMp3';
import { PianoNote } from '../pianoNotes';

describe('noteToMp3', () => {
  describe('noteNameToMp3Filename', () => {
    it('should convert natural notes correctly', () => {
      expect(noteNameToMp3Filename('C4')).toBe('C4.mp3');
      expect(noteNameToMp3Filename('A0')).toBe('A0.mp3');
      expect(noteNameToMp3Filename('B7')).toBe('B7.mp3');
    });

    it('should convert sharp notes to flat names', () => {
      expect(noteNameToMp3Filename('C#4')).toBe('Db4.mp3');
      expect(noteNameToMp3Filename('D#4')).toBe('Eb4.mp3');
      expect(noteNameToMp3Filename('F#4')).toBe('Gb4.mp3');
      expect(noteNameToMp3Filename('G#4')).toBe('Ab4.mp3');
      expect(noteNameToMp3Filename('A#4')).toBe('Bb4.mp3');
    });

    it('should handle single digit octaves', () => {
      expect(noteNameToMp3Filename('C1')).toBe('C1.mp3');
      expect(noteNameToMp3Filename('C#1')).toBe('Db1.mp3');
    });

    it('should handle multi-digit octaves', () => {
      expect(noteNameToMp3Filename('C10')).toBe('C10.mp3');
      expect(noteNameToMp3Filename('C#10')).toBe('Db10.mp3');
    });

    it('should handle notes without sharps or flats', () => {
      expect(noteNameToMp3Filename('C4')).toBe('C4.mp3');
      expect(noteNameToMp3Filename('D4')).toBe('D4.mp3');
      expect(noteNameToMp3Filename('E4')).toBe('E4.mp3');
      expect(noteNameToMp3Filename('F4')).toBe('F4.mp3');
      expect(noteNameToMp3Filename('G4')).toBe('G4.mp3');
      expect(noteNameToMp3Filename('A4')).toBe('A4.mp3');
      expect(noteNameToMp3Filename('B4')).toBe('B4.mp3');
    });

    it('should handle all sharp to flat conversions', () => {
      const conversions = [
        { sharp: 'C#', flat: 'Db' },
        { sharp: 'D#', flat: 'Eb' },
        { sharp: 'F#', flat: 'Gb' },
        { sharp: 'G#', flat: 'Ab' },
        { sharp: 'A#', flat: 'Bb' },
      ];

      conversions.forEach(({ sharp, flat }) => {
        expect(noteNameToMp3Filename(`${sharp}4`)).toBe(`${flat}4.mp3`);
      });
    });
  });

  describe('getMp3Filename', () => {
    it('should get MP3 filename from PianoNote object', () => {
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      expect(getMp3Filename(note)).toBe('C4.mp3');
    });

    it('should convert sharp notes to flat names', () => {
      const note: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      expect(getMp3Filename(note)).toBe('Db4.mp3');
    });

    it('should handle all note types', () => {
      const naturalNote: PianoNote = { name: 'A4', frequency: 440, octave: 4 };
      const sharpNote: PianoNote = { name: 'F#4', frequency: 369.99, octave: 4 };
      
      expect(getMp3Filename(naturalNote)).toBe('A4.mp3');
      expect(getMp3Filename(sharpNote)).toBe('Gb4.mp3');
    });
  });

  describe('getMp3Path', () => {
    beforeEach(() => {
      // Reset window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });
    });

    it('should return filename without extension for React Native', () => {
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const path = getMp3Path(note, false);
      expect(path).toBe('C4');
    });

    it('should return full path for web with root pathname', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });
      
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const path = getMp3Path(note, true);
      expect(path).toBe('/piano-mp3/C4.mp3');
    });

    it('should return full path for web with GitHub Pages subdirectory', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/discover_music/' },
        writable: true,
      });
      
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const path = getMp3Path(note, true);
      expect(path).toBe('/discover_music/piano-mp3/C4.mp3');
    });

    it('should handle GitHub Pages path without trailing slash', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/discover_music' },
        writable: true,
      });
      
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const path = getMp3Path(note, true);
      expect(path).toBe('/discover_music/piano-mp3/C4.mp3');
    });

    it('should handle index.html in pathname', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/discover_music/index.html' },
        writable: true,
      });
      
      const note: PianoNote = { name: 'C4', frequency: 261.63, octave: 4 };
      const path = getMp3Path(note, true);
      expect(path).toBe('/discover_music/piano-mp3/C4.mp3');
    });

    it('should convert sharp notes to flat in web path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });
      
      const note: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      const path = getMp3Path(note, true);
      expect(path).toBe('/piano-mp3/Db4.mp3');
    });

    it('should handle React Native path for sharp notes', () => {
      const note: PianoNote = { name: 'C#4', frequency: 277.18, octave: 4 };
      const path = getMp3Path(note, false);
      expect(path).toBe('Db4');
    });
  });
});

