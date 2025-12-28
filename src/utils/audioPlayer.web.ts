/**
 * Web-compatible audio player using Web Audio API directly
 */
import {PianoNote} from './pianoNotes';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playNote = async (note: PianoNote, duration: number): Promise<void> => {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = note.frequency;
    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.9);
    gainNode.gain.setValueAtTime(0, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    oscillator.onended = () => resolve();
  });
};

export const playNoteSequence = async (
  notes: PianoNote[],
  noteLength: number
): Promise<void> => {
  for (const note of notes) {
    await playNote(note, noteLength);
  }
};

export const stopAllSounds = (): void => {
  // Web Audio API handles this automatically when notes finish
  // For immediate stop, we'd need to track active oscillators
};

