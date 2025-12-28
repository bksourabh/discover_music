import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  generateRandomNotes,
  notesToString,
  stringToNotes,
  PianoNote,
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
const {addRecentSequence, getRecentSequences, saveSequence} = databaseModule;

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

const MainScreen: React.FC<MainScreenProps> = ({user, onLogout}) => {
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

  const [noteLength, setNoteLength] = useState<string>('0.5');
  const [totalLength, setTotalLength] = useState<string>('15');
  const [currentNotes, setCurrentNotes] = useState<PianoNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentSequences, setRecentSequences] = useState<NoteSequence[]>([]);
  const [highlightedNote, setHighlightedNote] = useState<PianoNote | null>(null);

  useEffect(() => {
    loadRecentSequences();
  }, []);

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

    setIsGenerating(true);
    stopAllSounds();

    try {
      // Generate random notes
      const notes = generateRandomNotes(noteLengthNum, totalLengthNum);
      setCurrentNotes(notes);

      // Save to recent sequences
      const sequence: NoteSequence = {
        notes: notesToString(notes),
        noteLength: noteLengthNum,
        totalLength: totalLengthNum,
        createdAt: new Date().toISOString(),
      };

      await addRecentSequence(sequence);
      await loadRecentSequences();

      // Auto-play the generated sequence
      setIsPlaying(true);
      setHighlightedNote(null);
      if (isWeb) {
        try {
          const {playNoteSequence} = require('../utils/audioPlayer.web');
          await playNoteSequence(
            notes,
            noteLengthNum,
            (note: PianoNote) => setHighlightedNote(note),
            () => {} // onNoteEnd - no action needed
          );
          setIsPlaying(false);
          setHighlightedNote(null);
        } catch (error) {
          console.error('Error playing notes:', error);
          setIsPlaying(false);
          setHighlightedNote(null);
        }
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      Alert.alert('Error', 'Failed to generate notes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    if (currentNotes.length === 0) {
      Alert.alert('No Notes', 'Please generate notes first');
      return;
    }

    setIsPlaying(true);
    setHighlightedNote(null);
    stopAllSounds();
    
    // For web, play directly using Web Audio API
    if (isWeb) {
      try {
        const {playNoteSequence} = require('../utils/audioPlayer.web');
        await playNoteSequence(
          currentNotes,
          parseFloat(noteLength),
          (note: PianoNote) => setHighlightedNote(note),
          () => {} // onNoteEnd - no action needed
        );
        setIsPlaying(false);
        setHighlightedNote(null);
      } catch (error) {
        console.error('Error playing notes:', error);
        setIsPlaying(false);
        setHighlightedNote(null);
      }
    }
    // For native, playback is handled by AudioPlayer component
  };

  const handlePlayComplete = () => {
    setIsPlaying(false);
    setHighlightedNote(null);
  };

  const handleSave = async () => {
    if (currentNotes.length === 0) {
      Alert.alert('No Notes', 'Please generate notes first');
      return;
    }

    try {
      await saveSequence({
        notes: notesToString(currentNotes),
        noteLength: parseFloat(noteLength),
        totalLength: parseFloat(totalLength),
        createdAt: new Date().toISOString(),
        userId: user.id,
      });

      Alert.alert('Success', 'Sequence saved successfully!');
    } catch (error) {
      console.error('Error saving sequence:', error);
      Alert.alert('Error', 'Failed to save sequence');
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
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Piano Note Generator</Text>
      <Text style={styles.userInfo}>Welcome, {user.name}!</Text>

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

      {/* Piano Keyboard - Full 88-key range (A0 to C8) */}
      <PianoKeyboard
        highlightedNote={highlightedNote}
        startOctave={0}
        endOctave={8}
        onKeyPress={handleKeyPress}
      />

      <TouchableOpacity
        style={[styles.button, styles.generateButton, (isGenerating || isPlaying) && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating || isPlaying}>
        {isGenerating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate</Text>
        )}
      </TouchableOpacity>

      {currentNotes.length > 0 && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Generated {currentNotes.length} notes
            </Text>
            <Text style={styles.infoText}>
              Notes: {currentNotes.slice(0, 5).map(n => n.name).join(', ')}
              {currentNotes.length > 5 ? '...' : ''}
            </Text>
          </View>
          <TimelineView
            notes={currentNotes}
            noteLength={parseFloat(noteLength)}
            totalLength={parseFloat(totalLength)}
            highlightedNote={highlightedNote}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.playButton, (currentNotes.length === 0 || isPlaying || isGenerating) && styles.buttonDisabled]}
        onPress={handlePlay}
        disabled={currentNotes.length === 0 || isPlaying || isGenerating}>
        {isPlaying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Play</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.saveButton, (currentNotes.length === 0 || isPlaying || isGenerating) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={currentNotes.length === 0 || isPlaying || isGenerating}>
        <Text style={styles.buttonText}>Save Sequence</Text>
      </TouchableOpacity>

      {/* Audio Player Component - Hidden, handles playback (native only) */}
      {!isWeb && isPlaying && currentNotes.length > 0 && AudioPlayer && (
        <AudioPlayer
          notes={currentNotes}
          noteLength={parseFloat(noteLength)}
          onPlayComplete={handlePlayComplete}
          onNoteStart={(note: PianoNote) => setHighlightedNote(note)}
          onNoteEnd={() => {}}
        />
      )}

      {recentSequences.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Sequences</Text>
          {recentSequences.map((sequence, index) => (
            <TouchableOpacity
              key={sequence.id || index}
              style={styles.recentItem}
              onPress={() => handleLoadRecent(sequence)}>
              <Text style={styles.recentItemText}>
                Sequence {index + 1} - {sequence.noteLength}s notes, {sequence.totalLength}s total
              </Text>
              <Text style={styles.recentItemDate}>
                {new Date(sequence.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {onLogout && (
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={onLogout}>
          <Text style={styles.buttonText}>Logout</Text>
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
  saveButton: {
    backgroundColor: '#FF9800',
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
});

export default MainScreen;

