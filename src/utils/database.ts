import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'DiscoverMusic.db';
const database_version = '1.0';
const database_displayname = 'Discover Music Database';
const database_size = 200000;

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

let db: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabase({
    name: database_name,
    location: 'default',
  });

  return db;
};

export const createTables = async (): Promise<void> => {
  const database = await getDBConnection();
  
  // Table for recent sequences (last 3)
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS recent_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notes TEXT NOT NULL,
      note_length REAL NOT NULL,
      total_length REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Table for saved sequences
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS saved_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notes TEXT NOT NULL,
      note_length REAL NOT NULL,
      total_length REAL NOT NULL,
      created_at TEXT NOT NULL,
      user_id TEXT NOT NULL
    );
  `);
};

export const addRecentSequence = async (sequence: NoteSequence): Promise<void> => {
  const database = await getDBConnection();
  
  // Insert new sequence
  await database.executeSql(
    `INSERT INTO recent_sequences (notes, note_length, total_length, created_at) 
     VALUES (?, ?, ?, ?)`,
    [sequence.notes, sequence.noteLength, sequence.totalLength, sequence.createdAt]
  );

  // Get all sequences ordered by created_at desc
  const [results] = await database.executeSql(
    `SELECT id FROM recent_sequences ORDER BY created_at DESC`
  );

  // Keep only the last 3
  if (results.rows.length > 3) {
    const idsToDelete: number[] = [];
    for (let i = 3; i < results.rows.length; i++) {
      idsToDelete.push(results.rows.item(i).id);
    }

    for (const id of idsToDelete) {
      await database.executeSql(`DELETE FROM recent_sequences WHERE id = ?`, [id]);
    }
  }
};

export const getRecentSequences = async (): Promise<NoteSequence[]> => {
  const database = await getDBConnection();
  const [results] = await database.executeSql(
    `SELECT * FROM recent_sequences ORDER BY created_at DESC LIMIT 3`
  );

  const sequences: NoteSequence[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    sequences.push({
      id: row.id,
      notes: row.notes,
      noteLength: row.note_length,
      totalLength: row.total_length,
      createdAt: row.created_at,
    });
  }
  return sequences;
};

export const saveSequence = async (sequence: SavedSequence): Promise<void> => {
  const database = await getDBConnection();
  await database.executeSql(
    `INSERT INTO saved_sequences (notes, note_length, total_length, created_at, user_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [sequence.notes, sequence.noteLength, sequence.totalLength, sequence.createdAt, sequence.userId]
  );
};

export const getSavedSequences = async (userId: string): Promise<SavedSequence[]> => {
  const database = await getDBConnection();
  const [results] = await database.executeSql(
    `SELECT * FROM saved_sequences WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  const sequences: SavedSequence[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    sequences.push({
      id: row.id,
      notes: row.notes,
      noteLength: row.note_length,
      totalLength: row.total_length,
      createdAt: row.created_at,
      userId: row.user_id,
    });
  }
  return sequences;
};

