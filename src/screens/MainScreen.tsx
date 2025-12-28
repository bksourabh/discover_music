import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
  const [noteLength, setNoteLength] = useState<string>('0.5');
  const [totalLength, setTotalLength] = useState<string>('15');
  const [currentNotes, setCurrentNotes] = useState<PianoNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentSequences, setRecentSequences] = useState<NoteSequence[]>([]);

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
      if (isWeb) {
        try {
          const {playNoteSequence} = require('../utils/audioPlayer.web');
          await playNoteSequence(notes, noteLengthNum);
          setIsPlaying(false);
        } catch (error) {
          console.error('Error playing notes:', error);
          setIsPlaying(false);
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
    stopAllSounds();
    
    // For web, play directly using Web Audio API
    if (isWeb) {
      try {
        const {playNoteSequence} = require('../utils/audioPlayer.web');
        await playNoteSequence(currentNotes, parseFloat(noteLength));
        setIsPlaying(false);
      } catch (error) {
        console.error('Error playing notes:', error);
        setIsPlaying(false);
      }
    }
    // For native, playback is handled by AudioPlayer component
  };

  const handlePlayComplete = () => {
    setIsPlaying(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Piano Note Generator</Text>
      <Text style={styles.userInfo}>Welcome, {user.name}!</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Note Length (seconds)</Text>
        <TextInput
          style={styles.input}
          value={noteLength}
          onChangeText={setNoteLength}
          keyboardType="numeric"
          placeholder="0.5"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Total Length (seconds)</Text>
        <TextInput
          style={styles.input}
          value={totalLength}
          onChangeText={setTotalLength}
          keyboardType="numeric"
          placeholder="15"
        />
      </View>

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
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Generated {currentNotes.length} notes
          </Text>
          <Text style={styles.infoText}>
            Notes: {currentNotes.slice(0, 5).map(n => n.name).join(', ')}
            {currentNotes.length > 5 ? '...' : ''}
          </Text>
        </View>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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

