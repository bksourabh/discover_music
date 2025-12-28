/**
 * Web-compatible database implementation using localStorage
 * This is a fallback for web since SQLite doesn't work in browsers
 */

export interface NoteSequence {
  id?: number;
  notes: string;
  noteLength: number;
  totalLength: number;
  createdAt: string;
}

export interface SavedSequence {
  id?: number;
  notes: string;
  noteLength: number;
  totalLength: number;
  createdAt: string;
  userId: string;
}

const RECENT_STORAGE_KEY = 'discover_music_recent_sequences';
const SAVED_STORAGE_KEY = 'discover_music_saved_sequences';

export const createTables = async (): Promise<void> => {
  // No-op for web - localStorage doesn't need tables
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!localStorage.getItem(RECENT_STORAGE_KEY)) {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify([]));
      }
      if (!localStorage.getItem(SAVED_STORAGE_KEY)) {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error('Error initializing localStorage:', error);
    // Don't throw - just log the error
  }
};

export const addRecentSequence = async (sequence: NoteSequence): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const recent = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || '[]');
    recent.unshift({
      ...sequence,
      id: Date.now(),
    });
    
    // Keep only last 3
    const trimmed = recent.slice(0, 3);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding recent sequence:', error);
  }
};

export const getRecentSequences = async (): Promise<NoteSequence[]> => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error getting recent sequences:', error);
    return [];
  }
};

export const saveSequence = async (sequence: SavedSequence): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const saved = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
    saved.unshift({
      ...sequence,
      id: Date.now(),
    });
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Error saving sequence:', error);
    throw error;
  }
};

export const getSavedSequences = async (userId: string): Promise<SavedSequence[]> => {
  const saved = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
  return saved.filter((s: SavedSequence) => s.userId === userId);
};

