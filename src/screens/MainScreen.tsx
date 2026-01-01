import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
  TextInput,
  Pressable,
} from 'react-native';
import {
  generateRandomNotes,
  notesToString,
  stringToNotes,
  PianoNote,
  compareNotes,
  generatePianoKeys,
  isValidPianoNote,
  stringToPianoNote,
} from '../utils/pianoNotes';
import PianoKeyboard from '../components/PianoKeyboard';
import Dropdown from '../components/Dropdown';
import TimelineView from '../components/TimelineView';
// Use web-compatible modules for web, native for mobile
// @ts-ignore - window is available in web environments
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('ReactNative');
const audioPlayerModule = isWeb 
  ? require('../utils/audioPlayer.web')
  : require('../utils/audioPlayer');
const {stopAllSounds} = audioPlayerModule;

// Use web-compatible database for web, native SQLite for mobile
const databaseModule = isWeb
  ? require('../utils/database.web')
  : require('../utils/database');
const {addRecentSequence, getRecentSequences} = databaseModule;

// Only import AudioPlayer for native (WebView doesn't work well on web)
let AudioPlayer: any = null;
if (!isWeb) {
  AudioPlayer = require('../components/AudioPlayer').default;
}

// User type (defined locally to avoid importing from native modules)
interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple';
  photo?: string;
}

// NoteSequence type (defined locally, same in both web and native)
interface NoteSequence {
  id?: number;
  notes: string;
  noteLength: number;
  totalLength: number;
  createdAt: string;
}

interface MainScreenProps {
  user: User;
  onLogout?: () => void;
}

// Responsive styles function
const createResponsiveStyles = (isMobile: boolean, isTablet: boolean) => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: isMobile ? 0 : undefined,
    },
    content: {
      padding: isMobile ? 12 : isTablet ? 16 : 20,
    },
    title: {
      fontSize: isMobile ? 22 : isTablet ? 24 : 28,
      marginBottom: isMobile ? 8 : 10,
    },
    userInfo: {
      fontSize: isMobile ? 14 : 16,
      marginBottom: isMobile ? 20 : 30,
    },
    button: {
      padding: isMobile ? 12 : 15,
      marginBottom: isMobile ? 12 : 15,
      minHeight: isMobile ? 48 : 50,
    },
    buttonText: {
      fontSize: isMobile ? 14 : 16,
    },
    checkboxContainer: {
      padding: isMobile ? 8 : 10,
      marginBottom: isMobile ? 12 : 15,
    },
    checkboxLabel: {
      fontSize: isMobile ? 14 : 16,
      marginLeft: isMobile ? 8 : 10,
    },
    sectionTitle: {
      fontSize: isMobile ? 18 : 20,
      marginBottom: isMobile ? 12 : 15,
    },
    recentItem: {
      padding: isMobile ? 12 : 15,
      marginBottom: isMobile ? 8 : 10,
      flexDirection: isMobile ? 'column' : 'row',
    },
    recentItemText: {
      fontSize: isMobile ? 14 : 16,
    },
    recentItemDate: {
      fontSize: isMobile ? 11 : 12,
    },
    recentItemExportButton: {
      paddingHorizontal: isMobile ? 12 : 15,
      paddingVertical: isMobile ? 10 : 8,
      marginLeft: isMobile ? 0 : 10,
      marginTop: isMobile ? 8 : 0,
      minHeight: isMobile ? 44 : undefined,
    },
    recentItemExportButtonText: {
      fontSize: isMobile ? 13 : 14,
    },
    rangeInfoText: {
      fontSize: isMobile ? 12 : 14,
    },
  });
};

const MainScreen: React.FC<MainScreenProps> = ({user, onLogout}) => {
  // Get screen dimensions for responsive design
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = screenData.width < 768;
  const isTablet = screenData.width >= 768 && screenData.width < 1024;
  const dynamicStyles = createResponsiveStyles(isMobile, isTablet);

  // Generate note length options: 0.1 to 2.0 in 0.1 increments
  const noteLengthOptions = Array.from({length: 20}, (_, i) => {
    const value = (0.1 + i * 0.1).toFixed(1);
    return {label: `${value}s`, value};
  });

  // Generate total length options: 5 to 15 seconds
  const totalLengthOptions = Array.from({length: 11}, (_, i) => {
    const value = (5 + i).toString();
    return {label: `${value}s`, value};
  });

  const [noteLength, setNoteLength] = useState<string>('0.3');
  const [totalLength, setTotalLength] = useState<string>('7');
  const [currentNotes, setCurrentNotes] = useState<(PianoNote | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentSequences, setRecentSequences] = useState<NoteSequence[]>([]);
  const [highlightedNote, setHighlightedNote] = useState<PianoNote | null>(null);
  const [hoveredNote, setHoveredNote] = useState<PianoNote | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [minRangeNote, setMinRangeNote] = useState<PianoNote | null>(null);
  const [maxRangeNote, setMaxRangeNote] = useState<PianoNote | null>(null);
  const [useSharps, setUseSharps] = useState(true);
  const [useFlats, setUseFlats] = useState(true);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState<string>('');
  const [originalNoteValue, setOriginalNoteValue] = useState<string>('');
  const [noteErrors, setNoteErrors] = useState<{[index: number]: boolean}>({});
  const [generationMode, setGenerationMode] = useState<'auto' | 'user'>('auto');
  const [generatingNoteIndex, setGeneratingNoteIndex] = useState<number | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);

  useEffect(() => {
    loadRecentSequences();
  }, []);

  // When switching to user-generated mode or changing note/total length, create placeholders
  useEffect(() => {
    if (generationMode === 'user') {
      // Disable range mode and reset range selection in user-generated mode
      if (rangeMode) {
        setRangeMode(false);
        setMinRangeNote(null);
        setMaxRangeNote(null);
      }
      
      const noteLengthNum = parseFloat(noteLength);
      const totalLengthNum = parseFloat(totalLength);
      
      if (!isNaN(noteLengthNum) && !isNaN(totalLengthNum) && noteLengthNum > 0 && totalLengthNum > 0) {
        const numNotes = Math.floor(totalLengthNum / noteLengthNum);
        // Create placeholders: array of null values
        const placeholders: (PianoNote | null)[] = new Array(numNotes).fill(null);
        setCurrentNotes(placeholders);
      }
    } else {
      // When switching to auto mode, clear notes (user needs to generate)
      setCurrentNotes([]);
    }
  }, [generationMode, noteLength, totalLength]);

  const loadRecentSequences = async () => {
    try {
      const sequences = await getRecentSequences();
      setRecentSequences(sequences);
    } catch (error) {
      console.error('Error loading recent sequences:', error);
    }
  };

  const handleGenerate = async () => {
    const noteLengthNum = parseFloat(noteLength);
    const totalLengthNum = parseFloat(totalLength);

    // Validation is simplified since dropdown ensures valid values
    // But we keep these checks as a safety measure
    if (isNaN(noteLengthNum) || noteLengthNum <= 0) {
      Alert.alert('Invalid Input', 'Note length must be a positive number');
      return;
    }

    if (isNaN(totalLengthNum) || totalLengthNum <= 0) {
      Alert.alert('Invalid Input', 'Total length must be a positive number');
      return;
    }

    if (totalLengthNum < noteLengthNum) {
      Alert.alert('Invalid Input', 'Total length must be greater than or equal to note length');
      return;
    }

    // In user-generated mode, just create placeholders (handled by useEffect)
    if (generationMode === 'user') {
      const numNotes = Math.floor(totalLengthNum / noteLengthNum);
      const placeholders: (PianoNote | null)[] = new Array(numNotes).fill(null);
      setCurrentNotes(placeholders);
      setGeneratingNoteIndex(null);
      return;
    }

    setIsGenerating(true);
    setGeneratingNoteIndex(null);
    await stopAllSounds();

    try {
      const numNotes = Math.floor(totalLengthNum / noteLengthNum);
      const notes: PianoNote[] = [];
      
      // Get available keys based on filters (same logic as generateRandomNotes)
      let availableKeys = generatePianoKeys();
      if (rangeMode && minRangeNote && maxRangeNote) {
        availableKeys = availableKeys.filter(key => 
          key.frequency >= minRangeNote.frequency && key.frequency <= maxRangeNote.frequency
        );
      }
      
      if (!useSharps || !useFlats) {
        availableKeys = availableKeys.filter(key => {
          const isSharp = key.name.includes('#');
          if (!useSharps && isSharp) return false;
          if (!useFlats && !isSharp) return false;
          return true;
        });
      }
      
      if (availableKeys.length === 0) {
        availableKeys = generatePianoKeys();
      }

      // Generate notes progressively with a small delay to show highlighting
      setCurrentNotes([]);
      for (let i = 0; i < numNotes; i++) {
        setGeneratingNoteIndex(i);
        const randomIndex = Math.floor(Math.random() * availableKeys.length);
        const newNote = availableKeys[randomIndex];
        notes.push(newNote);
        
        // Update currentNotes with the new note
        setCurrentNotes([...notes]);
        
        // Small delay to show the progressive generation (50ms per note)
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setGeneratingNoteIndex(null);

      // Save to recent sequences (filter out null placeholders)
      const validNotes = notes.filter((note): note is PianoNote => note !== null);
      const sequence: NoteSequence = {
        notes: notesToString(validNotes),
        noteLength: noteLengthNum,
        totalLength: totalLengthNum,
        createdAt: new Date().toISOString(),
      };

      await addRecentSequence(sequence);
      await loadRecentSequences();

      // Auto-play the generated sequence
      setIsPlaying(true);
      setHighlightedNote(null);
      setCurrentPlaybackTime(0);
      if (isWeb) {
        try {
          const {playNoteSequence} = require('../utils/audioPlayer.web');
          await playNoteSequence(
            notes,
            noteLengthNum,
            (note: PianoNote) => setHighlightedNote(note),
            () => {}, // onNoteEnd - no action needed
            (time: number) => setCurrentPlaybackTime(time) // onTimeUpdate - update progress
          );
          setIsPlaying(false);
          setHighlightedNote(null);
          setCurrentPlaybackTime(0);
        } catch (error) {
          console.error('Error playing notes:', error);
          setIsPlaying(false);
          setHighlightedNote(null);
          setCurrentPlaybackTime(0);
        }
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      Alert.alert('Error', 'Failed to generate notes');
      setGeneratingNoteIndex(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    if (currentNotes.length === 0) {
      Alert.alert('No Notes', 'Please generate notes first');
      return;
    }

    // Filter out null placeholders for playback
    const validNotes = currentNotes.filter((note): note is PianoNote => note !== null);
    if (validNotes.length === 0) {
      Alert.alert('No Notes', 'Please fill in some notes first');
      return;
    }

    setIsPlaying(true);
    setHighlightedNote(null);
    setCurrentPlaybackTime(0);
    await stopAllSounds();
    
    // For web, play directly using Web Audio API
    if (isWeb) {
      try {
        const {playNoteSequence} = require('../utils/audioPlayer.web');
        await playNoteSequence(
          validNotes,
          parseFloat(noteLength),
          (note: PianoNote) => setHighlightedNote(note),
          () => {}, // onNoteEnd - no action needed
          (time: number) => setCurrentPlaybackTime(time) // onTimeUpdate - update progress
        );
        setIsPlaying(false);
        setHighlightedNote(null);
        setCurrentPlaybackTime(0);
      } catch (error) {
        console.error('Error playing notes:', error);
        setIsPlaying(false);
        setHighlightedNote(null);
        setCurrentPlaybackTime(0);
      }
    }
    // For native, playback is handled by AudioPlayer component
  };

  const handlePlayComplete = () => {
    setIsPlaying(false);
    setHighlightedNote(null);
    setCurrentPlaybackTime(0);
  };

  const exportSequenceToCSV = (notes: (PianoNote | null)[], noteLengthValue: number, filename?: string) => {
    try {
      // Filter out null placeholders
      const validNotes = notes.filter((note): note is PianoNote => note !== null);
      if (validNotes.length === 0) {
        Alert.alert('No Notes', 'No notes to export');
        return;
      }

      // Create CSV content
      const headers = ['Index', 'Note Name', 'Frequency (Hz)', 'Octave', 'Note Length (s)', 'Timestamp (s)'];
      const rows: string[] = [headers.join(',')];
      
      let timestamp = 0;
      let validIndex = 0;
      
      notes.forEach((note, index) => {
        // Skip null placeholders in export
        if (note === null) {
          timestamp += noteLengthValue;
          return;
        }
        
        validIndex++;
        const row = [
          validIndex.toString(),
          note.name,
          note.frequency.toFixed(2),
          note.octave.toString(),
          noteLengthValue.toString(),
          timestamp.toFixed(2),
        ];
        rows.push(row.join(','));
        timestamp += noteLengthValue;
      });

      const csvContent = rows.join('\n');
      
      // Create blob and download (web)
      if (isWeb) {
        // @ts-ignore - window and document are available in web environment
        const win = typeof window !== 'undefined' ? window : null;
        if (win && win.document) {
          // @ts-ignore - Blob is available in web environment
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = win.document.createElement('a');
          // @ts-ignore - URL.createObjectURL is available in web environment
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename || `sequence_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          win.document.body.appendChild(link);
          link.click();
          win.document.body.removeChild(link);
        }
      } else {
        // For native, show an alert with instructions
        Alert.alert(
          'CSV Export',
          'CSV export is currently only available on web. The CSV content has been logged to the console.',
          [{ text: 'OK' }]
        );
        console.log('CSV Content:\n', csvContent);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleDownloadCSV = () => {
    if (currentNotes.length === 0) {
      Alert.alert('No Notes', 'Please generate notes first');
      return;
    }
    const validNotes = currentNotes.filter((note): note is PianoNote => note !== null);
    if (validNotes.length === 0) {
      Alert.alert('No Notes', 'Please fill in some notes first');
      return;
    }
    const noteLengthNum = parseFloat(noteLength);
    exportSequenceToCSV(currentNotes, noteLengthNum);
  };

  const parseCSV = (csvContent: string): {notes: PianoNote[], noteLength: number} => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    // Parse header to find column indices
    const header = lines[0].split(',').map(h => h.trim());
    const noteNameIndex = header.indexOf('Note Name');
    const noteLengthIndex = header.indexOf('Note Length (s)');
    const frequencyIndex = header.indexOf('Frequency (Hz)');
    const octaveIndex = header.indexOf('Octave');

    if (noteNameIndex === -1) {
      throw new Error('CSV must contain "Note Name" column');
    }
    if (noteLengthIndex === -1) {
      throw new Error('CSV must contain "Note Length (s)" column');
    }

    // Get all piano keys for lookup
    const allKeys = generatePianoKeys();
    const notes: PianoNote[] = [];
    let parsedNoteLength: number | null = null;

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map(v => v.trim());
      if (values.length <= Math.max(noteNameIndex, noteLengthIndex)) {
        continue; // Skip invalid rows
      }

      const noteName = values[noteNameIndex];
      const noteLengthValue = parseFloat(values[noteLengthIndex]);

      // Store note length (should be consistent across rows)
      if (parsedNoteLength === null) {
        parsedNoteLength = noteLengthValue;
      }

      // Find matching piano note by name
      const matchingNote = allKeys.find(key => key.name === noteName);
      if (matchingNote) {
        notes.push(matchingNote);
      } else {
        // Try to construct note from frequency and octave if available
        if (frequencyIndex !== -1 && octaveIndex !== -1 && 
            values[frequencyIndex] && values[octaveIndex]) {
          const frequency = parseFloat(values[frequencyIndex]);
          const octave = parseInt(values[octaveIndex]);
          // Find closest matching note by frequency
          const closestNote = allKeys.reduce((prev, curr) => {
            return Math.abs(curr.frequency - frequency) < Math.abs(prev.frequency - frequency)
              ? curr : prev;
          });
          if (Math.abs(closestNote.frequency - frequency) < 1) { // Within 1 Hz
            notes.push(closestNote);
          } else {
            console.warn(`Could not find matching note for ${noteName}, skipping`);
          }
        } else {
          console.warn(`Could not find matching note for ${noteName}, skipping`);
        }
      }
    }

    if (notes.length === 0) {
      throw new Error('No valid notes found in CSV file');
    }

    return {
      notes,
      noteLength: parsedNoteLength || parseFloat(noteLength), // Fallback to current noteLength
    };
  };

  const handleUploadCSV = () => {
    if (isWeb) {
      // Create a file input element for web
      // @ts-ignore - window and document are available in web environment
      const win = typeof window !== 'undefined' ? window : null;
      if (win && win.document) {
        const input = win.document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.style.display = 'none';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          // @ts-ignore - files property exists on HTMLInputElement in web environment
          const file = target.files?.[0];
          if (!file) return;

          try {
            const text = await file.text();
            const {notes: parsedNotes, noteLength: parsedNoteLength} = parseCSV(text);
            
            // Load the notes
            setCurrentNotes(parsedNotes);
            setNoteLength(parsedNoteLength.toString());
            
            // Calculate total length
            const totalLengthValue = parsedNotes.length * parsedNoteLength;
            setTotalLength(Math.ceil(totalLengthValue).toString());

            // Save to recent sequences
            const sequence: NoteSequence = {
              notes: notesToString(parsedNotes),
              noteLength: parsedNoteLength,
              totalLength: totalLengthValue,
              createdAt: new Date().toISOString(),
            };
            await addRecentSequence(sequence);
            await loadRecentSequences();

            // Auto-play the loaded sequence
            setIsPlaying(true);
            setHighlightedNote(null);
            setCurrentPlaybackTime(0);
            await stopAllSounds();
            
            try {
              const {playNoteSequence} = require('../utils/audioPlayer.web');
              await playNoteSequence(
                parsedNotes,
                parsedNoteLength,
                (note: PianoNote) => setHighlightedNote(note),
                () => {}, // onNoteEnd - no action needed
                (time: number) => setCurrentPlaybackTime(time) // onTimeUpdate - update progress
              );
              setIsPlaying(false);
              setHighlightedNote(null);
              setCurrentPlaybackTime(0);
            } catch (error) {
              console.error('Error playing notes:', error);
              setIsPlaying(false);
              setHighlightedNote(null);
              setCurrentPlaybackTime(0);
            }
          } catch (error) {
            console.error('Error parsing CSV:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to parse CSV file');
          }
          
          // Clean up
          win.document.body.removeChild(input);
        };
        
        win.document.body.appendChild(input);
        input.click();
      }
    } else {
      // For native, show an alert
      Alert.alert(
        'Upload CSV',
        'CSV upload is currently only available on web. Please use the web version to upload CSV files.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExportRecentSequence = (sequence: NoteSequence) => {
    try {
      const notes = stringToNotes(sequence.notes);
      const filename = `sequence_${new Date(sequence.createdAt).toISOString().split('T')[0]}.csv`;
      exportSequenceToCSV(notes, sequence.noteLength, filename);
    } catch (error) {
      console.error('Error exporting recent sequence:', error);
      Alert.alert('Error', 'Failed to export sequence');
    }
  };

  const handleLoadRecent = async (sequence: NoteSequence) => {
    try {
      const notes = stringToNotes(sequence.notes);
      setCurrentNotes(notes);
      setNoteLength(sequence.noteLength.toString());
      setTotalLength(sequence.totalLength.toString());
    } catch (error) {
      console.error('Error loading recent sequence:', error);
      Alert.alert('Error', 'Failed to load sequence');
    }
  };

  const handleKeyPress = async (note: PianoNote) => {
    if (rangeMode) {
      // Range selection mode
      if (!minRangeNote) {
        // Set minimum note
        setMinRangeNote(note);
        setMaxRangeNote(null);
      } else if (!maxRangeNote) {
        // Set maximum note - must be higher than minimum
        if (compareNotes(note, minRangeNote) > 0) {
          setMaxRangeNote(note);
        } else {
          Alert.alert('Invalid Range', 'Maximum key must be higher than minimum key');
        }
      } else {
        // Reset range selection
        setMinRangeNote(note);
        setMaxRangeNote(null);
      }
    } else if (generationMode === 'user') {
      // User-generated mode: fill the next empty placeholder
      const notesCopy = [...currentNotes];
      const emptyIndex = notesCopy.findIndex(n => n === null);
      
      if (emptyIndex !== -1) {
        notesCopy[emptyIndex] = note;
        setCurrentNotes(notesCopy);
        
        // Also play the note briefly
        try {
          setHighlightedNote(note);
          const noteDuration = 0.5;
          
          if (isWeb) {
            const {playNote} = require('../utils/audioPlayer.web');
            await playNote(note, noteDuration);
          } else {
            const {playNote} = require('../utils/audioPlayer');
            await playNote(note, noteDuration);
          }
          
          setHighlightedNote(null);
        } catch (error) {
          console.error('Error playing key:', error);
          setHighlightedNote(null);
        }
      } else {
        Alert.alert('All Slots Filled', 'All note slots are filled. Generate new placeholders or switch to auto mode.');
      }
    } else {
      // Normal play mode (auto generation mode)
      try {
        // Highlight the pressed key
        setHighlightedNote(note);
        
        // Play the note for a short duration (0.5 seconds)
        const noteDuration = 0.5;
        
        if (isWeb) {
          const {playNote} = require('../utils/audioPlayer.web');
          await playNote(note, noteDuration);
        } else {
          const {playNote} = require('../utils/audioPlayer');
          await playNote(note, noteDuration);
        }
        
        // Clear highlight after note finishes playing
        setHighlightedNote(null);
      } catch (error) {
        console.error('Error playing key:', error);
        setHighlightedNote(null);
      }
    }
  };

  const handleRangeModeToggle = (value: boolean) => {
    setRangeMode(value);
    if (!value) {
      // Clear range when disabling range mode
      setMinRangeNote(null);
      setMaxRangeNote(null);
    } else {
      // Clear range when enabling range mode (user needs to select new range)
      setMinRangeNote(null);
      setMaxRangeNote(null);
    }
  };

  const handleUseSharpsToggle = (value: boolean) => {
    // Prevent turning off sharps if flats is already off
    if (!value && !useFlats) {
      Alert.alert('Invalid Selection', 'At least one of "Use Sharps" or "Use Flats" must be enabled');
      return;
    }
    setUseSharps(value);
  };

  const handleUseFlatsToggle = (value: boolean) => {
    // Prevent turning off flats if sharps is already off
    if (!value && !useSharps) {
      Alert.alert('Invalid Selection', 'At least one of "Use Sharps" or "Use Flats" must be enabled');
      return;
    }
    setUseFlats(value);
  };

  const handleRestoreToDefault = async () => {
    // Stop any playing sounds
    await stopAllSounds();
    
    // Reset all state to default values
    setNoteLength('0.3');
    setTotalLength('7');
    setCurrentNotes([]);
    setIsPlaying(false);
    setHighlightedNote(null);
    setRangeMode(false);
    setMinRangeNote(null);
    setMaxRangeNote(null);
    setUseSharps(true);
    setUseFlats(true);
    setEditingNoteIndex(null);
    setEditingNoteValue('');
    setOriginalNoteValue('');
    setNoteErrors({});
    setGenerationMode('auto');
  };

  const handleNoteEditStart = (index: number, currentNote: PianoNote | null) => {
    if (currentNote === null) return; // Can't edit placeholders
    
    setEditingNoteIndex(index);
    setEditingNoteValue(currentNote.name);
    setOriginalNoteValue(currentNote.name);
    // Clear any previous error for this note
    const newErrors = {...noteErrors};
    delete newErrors[index];
    setNoteErrors(newErrors);
  };

  const handleNoteEditChange = (index: number, value: string) => {
    setEditingNoteValue(value);
    // Clear error while typing
    const newErrors = {...noteErrors};
    delete newErrors[index];
    setNoteErrors(newErrors);
  };

  const handleNoteEditEnd = (index: number) => {
    const trimmedValue = editingNoteValue.trim().toUpperCase();
    
    // Validate the note
    if (isValidPianoNote(trimmedValue)) {
      const newNote = stringToPianoNote(trimmedValue);
      if (newNote) {
        // Update the note in the array
        const updatedNotes = [...currentNotes];
        updatedNotes[index] = newNote;
        setCurrentNotes(updatedNotes);
        
        // Clear error
        const newErrors = {...noteErrors};
        delete newErrors[index];
        setNoteErrors(newErrors);
      } else {
        // Should not happen if isValidPianoNote returned true, but handle it
        handleNoteEditCancel(index);
      }
    } else {
      // Invalid note - show error and revert
      const newErrors = {...noteErrors};
      newErrors[index] = true;
      setNoteErrors(newErrors);
      
      // Revert to original note after a brief delay to show the error
      setTimeout(() => {
        handleNoteEditCancel(index);
      }, 1500);
    }
    
    setEditingNoteIndex(null);
    setEditingNoteValue('');
  };

  const handleNoteEditCancel = (index: number) => {
    // Revert to original note - the note in currentNotes is already correct
    // since we only update it when validation passes
    setEditingNoteIndex(null);
    setEditingNoteValue('');
    setOriginalNoteValue('');
    const newErrors = {...noteErrors};
    delete newErrors[index];
    setNoteErrors(newErrors);
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={[styles.content, dynamicStyles.content]}>
      <Text style={[styles.title, dynamicStyles.title]}>Piano Note Generator</Text>
      <Text style={[styles.userInfo, dynamicStyles.userInfo]}>Welcome, {user.name}!</Text>

      <Dropdown
        label="Note Length (seconds)"
        value={noteLength}
        options={noteLengthOptions}
        onValueChange={setNoteLength}
      />

      <Dropdown
        label="Total Length (seconds)"
        value={totalLength}
        options={totalLengthOptions}
        onValueChange={setTotalLength}
      />

      {/* Generation Mode Selector */}
      <View style={[styles.checkboxContainer, dynamicStyles.checkboxContainer]}>
        <Text style={[styles.checkboxLabel, dynamicStyles.checkboxLabel]}>
          Generation Mode:
        </Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              generationMode === 'auto' && styles.modeButtonActive,
            ]}
            onPress={() => setGenerationMode('auto')}>
            <Text
              style={[
                styles.modeButtonText,
                generationMode === 'auto' && styles.modeButtonTextActive,
              ]}>
              Auto Generate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              generationMode === 'user' && styles.modeButtonActive,
            ]}
            onPress={() => setGenerationMode('user')}>
            <Text
              style={[
                styles.modeButtonText,
                generationMode === 'user' && styles.modeButtonTextActive,
              ]}>
              User Generated
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {generationMode === 'user' && (
        <View style={styles.userModeInfo}>
          <Text style={[styles.userModeInfoText, dynamicStyles.rangeInfoText]}>
            Click piano keys to fill note slots. Generate creates empty placeholders based on note length and total length.
          </Text>
        </View>
      )}

      {/* Restore to Default Button */}
      <TouchableOpacity
        style={[styles.button, styles.restoreButton, dynamicStyles.button]}
        onPress={handleRestoreToDefault}>
        <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Restore to Default</Text>
      </TouchableOpacity>

      {/* Range Mode Checkbox */}
      <View style={[
        styles.checkboxContainer, 
        dynamicStyles.checkboxContainer,
        generationMode === 'user' && styles.checkboxContainerDisabled,
      ]}>
        <Switch
          value={rangeMode}
          onValueChange={handleRangeModeToggle}
          disabled={generationMode === 'user'}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={rangeMode ? '#fff' : '#f4f3f4'}
        />
        <Text style={[
          styles.checkboxLabel, 
          dynamicStyles.checkboxLabel,
          generationMode === 'user' && styles.checkboxLabelDisabled,
        ]}>
          Select Piano Generation Range Mode
          {generationMode === 'user' && ' (Disabled in User Generated Mode)'}
        </Text>
      </View>
      {rangeMode && generationMode === 'auto' && (
        <View style={styles.rangeInfo}>
          <Text style={[styles.rangeInfoText, dynamicStyles.rangeInfoText]}>
            {minRangeNote 
              ? `Min: ${minRangeNote.name}${maxRangeNote ? `, Max: ${maxRangeNote.name}` : ' (select max key)'}`
              : 'Select minimum key, then maximum key'}
          </Text>
        </View>
      )}

      {/* Use Sharps Checkbox */}
      <View style={[
        styles.checkboxContainer, 
        dynamicStyles.checkboxContainer,
        generationMode === 'user' && styles.checkboxContainerDisabled,
      ]}>
        <Switch
          value={useSharps}
          onValueChange={handleUseSharpsToggle}
          disabled={generationMode === 'user'}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={useSharps ? '#fff' : '#f4f3f4'}
        />
        <Text style={[
          styles.checkboxLabel, 
          dynamicStyles.checkboxLabel,
          generationMode === 'user' && styles.checkboxLabelDisabled,
        ]}>
          Use Sharps (Black Keys)
          {generationMode === 'user' && ' (Disabled in User Generated Mode)'}
        </Text>
      </View>

      {/* Use Flats Checkbox */}
      <View style={[
        styles.checkboxContainer, 
        dynamicStyles.checkboxContainer,
        generationMode === 'user' && styles.checkboxContainerDisabled,
      ]}>
        <Switch
          value={useFlats}
          onValueChange={handleUseFlatsToggle}
          disabled={generationMode === 'user'}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={useFlats ? '#fff' : '#f4f3f4'}
        />
        <Text style={[
          styles.checkboxLabel, 
          dynamicStyles.checkboxLabel,
          generationMode === 'user' && styles.checkboxLabelDisabled,
        ]}>
          Use Flats (White Keys)
          {generationMode === 'user' && ' (Disabled in User Generated Mode)'}
        </Text>
      </View>

      {/* Piano Keyboard - Full 88-key range (A0 to C8) */}
      <PianoKeyboard
        highlightedNote={hoveredNote || highlightedNote}
        startOctave={0}
        endOctave={8}
        onKeyPress={handleKeyPress}
        rangeMode={rangeMode}
        minRangeNote={minRangeNote}
        maxRangeNote={maxRangeNote}
      />

      <TouchableOpacity
        style={[styles.button, styles.generateButton, dynamicStyles.button, (isGenerating || isPlaying) && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating || isPlaying}>
        {isGenerating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Generate</Text>
        )}
      </TouchableOpacity>

      {currentNotes.length > 0 && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {generationMode === 'user' 
                ? `${currentNotes.filter(n => n !== null).length} of ${currentNotes.length} notes filled`
                : `Generated ${currentNotes.filter(n => n !== null).length} notes`}
            </Text>
            <Text style={styles.infoText}>
              {generationMode === 'user' 
                ? 'Click piano keys to fill empty slots. Click on filled notes to edit:'
                : 'Click on any note to edit it:'}
            </Text>
            <View style={styles.notesContainer}>
              {currentNotes.map((note, index) => {
                const isCurrentlyGenerating = generationMode === 'auto' && isGenerating && generatingNoteIndex === index;
                return (
                  <View key={index} style={styles.noteItem}>
                    {editingNoteIndex === index && note !== null ? (
                      <TextInput
                        style={[
                          styles.noteInput,
                          noteErrors[index] && styles.noteInputError,
                        ]}
                        value={editingNoteValue}
                        onChangeText={(value) => handleNoteEditChange(index, value)}
                        onBlur={() => handleNoteEditEnd(index)}
                        onSubmitEditing={() => handleNoteEditEnd(index)}
                        autoFocus
                        placeholder={note.name}
                        placeholderTextColor="#999"
                      />
                    ) : (
                      <Pressable
                        style={({pressed}) => [
                          styles.noteButton,
                          pressed && styles.noteButtonPressed,
                          note === null && styles.noteButtonPlaceholder,
                          isCurrentlyGenerating && styles.noteButtonGenerating,
                        ]}
                        onPress={() => note !== null && handleNoteEditStart(index, note)}
                        disabled={note === null}
                        // @ts-ignore - onMouseEnter/onMouseLeave are available in React Native Web
                        onMouseEnter={() => note && setHoveredNote(note)}
                        // @ts-ignore - onMouseEnter/onMouseLeave are available in React Native Web
                        onMouseLeave={() => setHoveredNote(null)}
                        onPressIn={() => note && setHoveredNote(note)}
                        onPressOut={() => setHoveredNote(null)}>
                        <Text style={[
                          styles.noteButtonText,
                          note === null && styles.noteButtonTextPlaceholder,
                          isCurrentlyGenerating && styles.noteButtonTextGenerating,
                        ]}>
                          {note === null ? '?' : note.name}
                        </Text>
                      </Pressable>
                    )}
                    {noteErrors[index] && (
                      <Text style={styles.noteErrorText}>Invalid note</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <TimelineView
            notes={currentNotes.filter((note): note is PianoNote => note !== null)}
            noteLength={parseFloat(noteLength)}
            totalLength={parseFloat(totalLength)}
            highlightedNote={highlightedNote}
            placeholders={generationMode === 'user' ? currentNotes : undefined}
            currentPlaybackTime={isPlaying ? currentPlaybackTime : undefined}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.playButton, dynamicStyles.button, (currentNotes.length === 0 || isPlaying || isGenerating) && styles.buttonDisabled]}
        onPress={handlePlay}
        disabled={currentNotes.length === 0 || isPlaying || isGenerating}>
        {isPlaying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Play</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.downloadButton, dynamicStyles.button, (currentNotes.length === 0 || isPlaying || isGenerating) && styles.buttonDisabled]}
        onPress={handleDownloadCSV}
        disabled={currentNotes.length === 0 || isPlaying || isGenerating}>
        <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Export Notes to CSV</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.uploadButton, dynamicStyles.button, (isPlaying || isGenerating) && styles.buttonDisabled]}
        onPress={handleUploadCSV}
        disabled={isPlaying || isGenerating}>
        <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Upload Notes CSV</Text>
      </TouchableOpacity>

      {/* Audio Player Component - Hidden, handles playback (native only) */}
      {!isWeb && isPlaying && currentNotes.length > 0 && AudioPlayer && (
        <AudioPlayer
          notes={currentNotes.filter((note): note is PianoNote => note !== null)}
          noteLength={parseFloat(noteLength)}
          onPlayComplete={handlePlayComplete}
          onNoteStart={(note: PianoNote) => setHighlightedNote(note)}
          onNoteEnd={() => {}}
        />
      )}

      {recentSequences.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recent Sequences</Text>
          {recentSequences.map((sequence, index) => (
            <View key={sequence.id || index} style={[styles.recentItem, dynamicStyles.recentItem]}>
              <TouchableOpacity
                style={styles.recentItemContent}
                onPress={() => handleLoadRecent(sequence)}>
                <Text style={[styles.recentItemText, dynamicStyles.recentItemText]}>
                  Sequence {index + 1} - {sequence.noteLength}s notes, {sequence.totalLength}s total
                </Text>
                <Text style={[styles.recentItemDate, dynamicStyles.recentItemDate]}>
                  {new Date(sequence.createdAt).toLocaleString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recentItemExportButton, dynamicStyles.recentItemExportButton]}
                onPress={() => handleExportRecentSequence(sequence)}>
                <Text style={[styles.recentItemExportButtonText, dynamicStyles.recentItemExportButtonText]}>Export to CSV</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {onLogout && (
        <TouchableOpacity
          style={[styles.button, styles.logoutButton, dynamicStyles.button]}
          onPress={onLogout}>
          <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Logout</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    minHeight: 50,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  downloadButton: {
    backgroundColor: '#FF9800',
  },
  uploadButton: {
    backgroundColor: '#9C27B0',
  },
  restoreButton: {
    backgroundColor: '#9E9E9E',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  recentContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  recentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemExportButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  recentItemExportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recentItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkboxContainerDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  checkboxLabelDisabled: {
    color: '#999',
  },
  rangeInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  rangeInfoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  noteItem: {
    marginRight: 8,
    marginBottom: 8,
  },
  noteButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  noteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noteButtonPressed: {
    opacity: 0.8,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 50,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  noteInputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  noteErrorText: {
    color: '#f44336',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 10,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  userModeInfo: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  userModeInfoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  noteButtonPlaceholder: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  noteButtonTextPlaceholder: {
    color: '#999',
  },
  noteButtonGenerating: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  noteButtonTextGenerating: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default MainScreen;

