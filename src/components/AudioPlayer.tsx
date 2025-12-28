import React, {useEffect} from 'react';
import {PianoNote} from '../utils/pianoNotes';
import {playNoteSequence, releaseAllSounds} from '../utils/audioPlayer';

interface AudioPlayerProps {
  notes: PianoNote[];
  noteLength: number;
  onPlayComplete?: () => void;
  onNoteStart?: (note: PianoNote) => void;
  onNoteEnd?: (note: PianoNote) => void;
}

/**
 * AudioPlayer component using react-native-sound with MP3 files
 * This component plays actual piano note MP3 files from the piano-mp3 folder
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  notes,
  noteLength,
  onPlayComplete,
  onNoteStart,
  onNoteEnd,
}) => {
  useEffect(() => {
    if (notes.length > 0) {
      playSequence();
    }
    
    // Cleanup on unmount
    return () => {
      releaseAllSounds();
    };
  }, [notes, noteLength]);

  const playSequence = async () => {
    try {
      await playNoteSequence(notes, noteLength, onNoteStart, onNoteEnd);
      if (onPlayComplete) {
        onPlayComplete();
      }
    } catch (error) {
      console.error('Error playing note sequence:', error);
      if (onPlayComplete) {
        onPlayComplete();
      }
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default AudioPlayer;

