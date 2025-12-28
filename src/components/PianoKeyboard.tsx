import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable} from 'react-native';
import {PianoNote, generatePianoKeys} from '../utils/pianoNotes';

interface PianoKeyboardProps {
  highlightedNote?: PianoNote | null;
  startOctave?: number; // Starting octave
  endOctave?: number; // Ending octave
  onKeyPress?: (note: PianoNote) => void; // Callback when a key is pressed
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
}) => {
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

  // Check if a note is currently highlighted
  const isHighlighted = (note: PianoNote): boolean => {
    return highlightedNote?.name === note.name;
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

  // Calculate white key width - slightly smaller for full keyboard
  // With 88 keys, we'll use a reasonable width that allows horizontal scrolling
  const WHITE_KEY_WIDTH = 35;
  const BLACK_KEY_WIDTH = 22;
  const BLACK_KEY_OFFSET = 25; // Position from left edge of white key

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Piano Keyboard</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.keyboardContainer}>
          {/* White keys */}
          <View style={styles.whiteKeysContainer}>
          {whiteKeys.map((key) => (
            <TouchableOpacity
              key={key.name}
              activeOpacity={0.7}
              onPress={() => onKeyPress && onKeyPress(key)}
              style={[
                styles.whiteKey,
                {width: WHITE_KEY_WIDTH},
                isHighlighted(key) && styles.whiteKeyHighlighted,
              ]}>
              <Text
                style={[
                  styles.whiteKeyText,
                  isHighlighted(key) && styles.whiteKeyTextHighlighted,
                ]}>
                {key.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Black keys overlay */}
        <View style={styles.blackKeysOverlay} pointerEvents="box-none">
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
                  },
                  isHighlighted(blackKey) && styles.blackKeyHighlighted,
                ]}>
                <Text
                  style={[
                    styles.blackKeyText,
                    isHighlighted(blackKey) && styles.blackKeyTextHighlighted,
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 180,
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  keyboardContainer: {
    position: 'relative',
    height: 160,
    overflow: 'visible',
    minWidth: 280, // Minimum width for at least a few keys
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
  blackKeyTextHighlighted: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 9,
  },
});

export default PianoKeyboard;
