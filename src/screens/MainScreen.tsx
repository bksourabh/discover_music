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
} from 'react-native';
import {
  generateRandomNotes,
  notesToString,
  stringToNotes,
  PianoNote,
  compareNotes,
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

  const [noteLength, setNoteLength] = useState<string>('0.5');
  const [totalLength, setTotalLength] = useState<string>('15');
  const [currentNotes, setCurrentNotes] = useState<PianoNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentSequences, setRecentSequences] = useState<NoteSequence[]>([]);
  const [highlightedNote, setHighlightedNote] = useState<PianoNote | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [minRangeNote, setMinRangeNote] = useState<PianoNote | null>(null);
  const [maxRangeNote, setMaxRangeNote] = useState<PianoNote | null>(null);
  const [useSharps, setUseSharps] = useState(true);
  const [useFlats, setUseFlats] = useState(true);

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
    await stopAllSounds();

    try {
      // Generate random notes with optional range and sharp/flat filters
      const notes = generateRandomNotes(
        noteLengthNum, 
        totalLengthNum,
        rangeMode && minRangeNote && maxRangeNote ? minRangeNote : undefined,
        rangeMode && minRangeNote && maxRangeNote ? maxRangeNote : undefined,
        useSharps,
        useFlats
      );
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
    await stopAllSounds();
    
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

  const exportSequenceToCSV = (notes: PianoNote[], noteLengthValue: number, filename?: string) => {
    try {
      if (notes.length === 0) {
        Alert.alert('No Notes', 'No notes to export');
        return;
      }

      // Create CSV content
      const headers = ['Index', 'Note Name', 'Frequency (Hz)', 'Octave', 'Note Length (s)', 'Timestamp (s)'];
      const rows: string[] = [headers.join(',')];
      
      let timestamp = 0;
      
      notes.forEach((note, index) => {
        const row = [
          (index + 1).toString(),
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
    const noteLengthNum = parseFloat(noteLength);
    exportSequenceToCSV(currentNotes, noteLengthNum);
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
    } else {
      // Normal play mode
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
    setNoteLength('0.5');
    setTotalLength('15');
    setCurrentNotes([]);
    setIsPlaying(false);
    setHighlightedNote(null);
    setRangeMode(false);
    setMinRangeNote(null);
    setMaxRangeNote(null);
    setUseSharps(true);
    setUseFlats(true);
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

      {/* Restore to Default Button */}
      <TouchableOpacity
        style={[styles.button, styles.restoreButton, dynamicStyles.button]}
        onPress={handleRestoreToDefault}>
        <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Restore to Default</Text>
      </TouchableOpacity>

      {/* Range Mode Checkbox */}
      <View style={[styles.checkboxContainer, dynamicStyles.checkboxContainer]}>
        <Switch
          value={rangeMode}
          onValueChange={handleRangeModeToggle}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={rangeMode ? '#fff' : '#f4f3f4'}
        />
        <Text style={[styles.checkboxLabel, dynamicStyles.checkboxLabel]}>
          Select Piano Generation Range Mode
        </Text>
      </View>
      {rangeMode && (
        <View style={styles.rangeInfo}>
          <Text style={[styles.rangeInfoText, dynamicStyles.rangeInfoText]}>
            {minRangeNote 
              ? `Min: ${minRangeNote.name}${maxRangeNote ? `, Max: ${maxRangeNote.name}` : ' (select max key)'}`
              : 'Select minimum key, then maximum key'}
          </Text>
        </View>
      )}

      {/* Use Sharps Checkbox */}
      <View style={[styles.checkboxContainer, dynamicStyles.checkboxContainer]}>
        <Switch
          value={useSharps}
          onValueChange={handleUseSharpsToggle}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={useSharps ? '#fff' : '#f4f3f4'}
        />
        <Text style={[styles.checkboxLabel, dynamicStyles.checkboxLabel]}>
          Use Sharps (Black Keys)
        </Text>
      </View>

      {/* Use Flats Checkbox */}
      <View style={[styles.checkboxContainer, dynamicStyles.checkboxContainer]}>
        <Switch
          value={useFlats}
          onValueChange={handleUseFlatsToggle}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={useFlats ? '#fff' : '#f4f3f4'}
        />
        <Text style={[styles.checkboxLabel, dynamicStyles.checkboxLabel]}>
          Use Flats (White Keys)
        </Text>
      </View>

      {/* Piano Keyboard - Full 88-key range (A0 to C8) */}
      <PianoKeyboard
        highlightedNote={highlightedNote}
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
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
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
});

export default MainScreen;

