import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Dimensions} from 'react-native';
import {PianoNote, generatePianoKeys} from '../utils/pianoNotes';

interface PianoKeyboardProps {
  highlightedNote?: PianoNote | null;
  startOctave?: number; // Starting octave
  endOctave?: number; // Ending octave
  onKeyPress?: (note: PianoNote) => void; // Callback when a key is pressed
  rangeMode?: boolean; // Whether range selection mode is active
  minRangeNote?: PianoNote | null; // Minimum note in range
  maxRangeNote?: PianoNote | null; // Maximum note in range
}

/**
 * Piano Keyboard Component
 * Displays a visual piano keyboard with white and black keys
 * Highlights the currently playing note
 */
const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightedNote,
  startOctave = 0,
  endOctave = 8,
  onKeyPress,
  rangeMode = false,
  minRangeNote = null,
  maxRangeNote = null,
}) => {
  // Get screen dimensions for responsive design
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = screenData.width < 768;
  
  // Calculate key widths based on screen size
  const WHITE_KEY_WIDTH = isMobile ? 20 : 35;
  const BLACK_KEY_WIDTH = isMobile ? 14 : 22;
  const BLACK_KEY_OFFSET = isMobile ? 15 : 25;
  const KEYBOARD_HEIGHT = isMobile ? 120 : 160;
  const BLACK_KEY_HEIGHT = isMobile ? 70 : 100;

  // Get all piano keys
  const allKeys = generatePianoKeys();

  // Filter keys to display (default: octaves 0-8 for full 88-key piano)
  const keysToDisplay = allKeys.filter(
    key => key.octave >= startOctave && key.octave <= endOctave
  );

  // Separate white and black keys, and sort them properly
  const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const whiteKeys = keysToDisplay
    .filter(key => !key.name.includes('#'))
    .sort((a, b) => {
      if (a.octave !== b.octave) return a.octave - b.octave;
      const aNote = a.name[0];
      const bNote = b.name[0];
      return noteOrder.indexOf(aNote) - noteOrder.indexOf(bNote);
    });
  
  const blackKeys = keysToDisplay.filter(key => key.name.includes('#'));

  // Calculate total keyboard width based on number of white keys
  const totalKeyboardWidth = whiteKeys.length * WHITE_KEY_WIDTH;

  // Check if a note is currently highlighted
  const isHighlighted = (note: PianoNote): boolean => {
    return highlightedNote?.name === note.name;
  };

  // Check if a note is the minimum range note
  const isMinRangeNote = (note: PianoNote): boolean => {
    return rangeMode && minRangeNote?.name === note.name;
  };

  // Check if a note is the maximum range note
  const isMaxRangeNote = (note: PianoNote): boolean => {
    return rangeMode && maxRangeNote?.name === note.name;
  };

  // Check if a note is within the selected range
  const isInRange = (note: PianoNote): boolean => {
    if (!rangeMode || !minRangeNote || !maxRangeNote) return false;
    return note.frequency >= minRangeNote.frequency && note.frequency <= maxRangeNote.frequency;
  };

  // Get position for black key relative to white keys
  // Black keys: C# after C, D# after D, F# after F, G# after G, A# after A
  const getBlackKeyPosition = (blackKey: PianoNote): number => {
    const blackKeyName = blackKey.name.substring(0, 2);
    const octave = blackKey.octave;

    // Map black keys to their corresponding white keys
    const whiteKeyNameMap: {[key: string]: string} = {
      'C#': 'C',
      'D#': 'D',
      'F#': 'F',
      'G#': 'G',
      'A#': 'A',
    };

    const correspondingWhiteKeyName = whiteKeyNameMap[blackKeyName];
    if (!correspondingWhiteKeyName) return 0;

    // Find the white key that this black key should be positioned after
    const whiteKeyIndex = whiteKeys.findIndex(
      wk => wk.name === `${correspondingWhiteKeyName}${octave}`
    );

    return whiteKeyIndex >= 0 ? whiteKeyIndex : 0;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isMobile && styles.titleMobile]}>Piano Keyboard</Text>
      <View style={styles.scrollViewWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={[styles.scrollView, isMobile && styles.scrollViewMobile]}
          contentContainerStyle={styles.scrollViewContent}
          nestedScrollEnabled={true}>
          <View style={[
            styles.keyboardContainer,
            {
              height: KEYBOARD_HEIGHT,
              width: totalKeyboardWidth,
            }
          ]}>
          {/* White keys */}
          <View style={[styles.whiteKeysContainer, {height: KEYBOARD_HEIGHT}]}>
          {whiteKeys.map((key) => (
            <TouchableOpacity
              key={key.name}
              activeOpacity={0.7}
              onPress={() => onKeyPress && onKeyPress(key)}
              style={[
                styles.whiteKey,
                {width: WHITE_KEY_WIDTH, height: KEYBOARD_HEIGHT},
                isHighlighted(key) && styles.whiteKeyHighlighted,
                isMinRangeNote(key) && styles.whiteKeyMinRange,
                isMaxRangeNote(key) && styles.whiteKeyMaxRange,
                rangeMode && isInRange(key) && !isMinRangeNote(key) && !isMaxRangeNote(key) && styles.whiteKeyInRange,
                isMobile && styles.whiteKeyMobile,
              ]}>
              <Text
                style={[
                  styles.whiteKeyText,
                  isMobile && styles.whiteKeyTextMobile,
                  isHighlighted(key) && styles.whiteKeyTextHighlighted,
                  (isMinRangeNote(key) || isMaxRangeNote(key)) && styles.whiteKeyTextRange,
                ]}>
                {key.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Black keys overlay */}
        <View style={[styles.blackKeysOverlay, {height: BLACK_KEY_HEIGHT}]} pointerEvents="box-none">
          {blackKeys.map(blackKey => {
            const whiteKeyIndex = getBlackKeyPosition(blackKey);
            if (whiteKeyIndex < 0) return null;

            return (
              <Pressable
                key={blackKey.name}
                onPress={() => onKeyPress && onKeyPress(blackKey)}
                style={[
                  styles.blackKeyAbsolute,
                  {
                    left: whiteKeyIndex * WHITE_KEY_WIDTH + BLACK_KEY_OFFSET,
                    width: BLACK_KEY_WIDTH,
                    height: BLACK_KEY_HEIGHT,
                  },
                  isHighlighted(blackKey) && styles.blackKeyHighlighted,
                  isMinRangeNote(blackKey) && styles.blackKeyMinRange,
                  isMaxRangeNote(blackKey) && styles.blackKeyMaxRange,
                  rangeMode && isInRange(blackKey) && !isMinRangeNote(blackKey) && !isMaxRangeNote(blackKey) && styles.blackKeyInRange,
                  isMobile && styles.blackKeyMobile,
                ]}>
                <Text
                  style={[
                    styles.blackKeyText,
                    isMobile && styles.blackKeyTextMobile,
                    isHighlighted(blackKey) && styles.blackKeyTextHighlighted,
                    (isMinRangeNote(blackKey) || isMaxRangeNote(blackKey)) && styles.blackKeyTextRange,
                  ]}>
                  {blackKey.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensure container doesn't overflow
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  scrollViewWrapper: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 180,
    width: '100%',
  },
  scrollViewMobile: {
    maxHeight: 140,
  },
  scrollViewContent: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 0,
  },
  keyboardContainer: {
    position: 'relative',
    height: 160,
    overflow: 'visible',
  },
  whiteKeysContainer: {
    flexDirection: 'row',
    height: 160,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  whiteKey: {
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  whiteKeyMobile: {
    paddingBottom: 6,
  },
  whiteKeyHighlighted: {
    backgroundColor: '#FFD700', // Gold highlight
    borderRightColor: '#FFA500',
    borderRightWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  whiteKeyText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  whiteKeyTextMobile: {
    fontSize: 8,
  },
  titleMobile: {
    fontSize: 16,
    marginBottom: 10,
  },
  whiteKeyTextHighlighted: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 11,
  },
  blackKeysOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  blackKeyAbsolute: {
    position: 'absolute',
    height: 100,
    backgroundColor: '#222',
    borderRadius: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
    zIndex: 10,
  },
  blackKeyMobile: {
    paddingBottom: 4,
  },
  blackKeyHighlighted: {
    backgroundColor: '#FFD700', // Gold highlight
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  blackKeyText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
  },
  blackKeyTextMobile: {
    fontSize: 7,
  },
  blackKeyTextHighlighted: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 9,
  },
  whiteKeyMinRange: {
    backgroundColor: '#4CAF50', // Green for minimum
    borderRightColor: '#2E7D32',
    borderRightWidth: 3,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  whiteKeyMaxRange: {
    backgroundColor: '#2196F3', // Blue for maximum
    borderRightColor: '#1565C0',
    borderRightWidth: 3,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  whiteKeyInRange: {
    backgroundColor: '#E3F2FD', // Light blue for keys in range
    borderRightColor: '#90CAF9',
  },
  whiteKeyTextRange: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  blackKeyMinRange: {
    backgroundColor: '#4CAF50', // Green for minimum
    borderWidth: 3,
    borderColor: '#2E7D32',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  blackKeyMaxRange: {
    backgroundColor: '#2196F3', // Blue for maximum
    borderWidth: 3,
    borderColor: '#1565C0',
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  blackKeyInRange: {
    backgroundColor: '#90CAF9', // Light blue for keys in range
    borderWidth: 2,
    borderColor: '#64B5F6',
  },
  blackKeyTextRange: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
  },
});

export default PianoKeyboard;
