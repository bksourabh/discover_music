import SQLite from 'react-native-sqlite-storage';
import type { NoteSequence, SavedSequence } from '../database';

// Mock SQLite
jest.mock('react-native-sqlite-storage');

// We need to reset the module's internal db cache between tests
const resetDatabaseModule = () => {
  delete require.cache[require.resolve('../database')];
};

// Import functions after mocks are set up
let getDBConnection: any;
let createTables: any;
let addRecentSequence: any;
let getRecentSequences: any;
let saveSequence: any;
let getSavedSequences: any;

describe('database', () => {
  let mockDb: any;
  let mockExecuteSql: jest.Mock;

  beforeEach(() => {
    // Reset the module cache to clear the internal db variable
    resetDatabaseModule();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh mock database object for each test
    mockExecuteSql = jest.fn();
    mockDb = {
      executeSql: mockExecuteSql,
    };
    
    // Mock openDatabase to always return our mock database
    (SQLite.openDatabase as jest.Mock).mockResolvedValue(mockDb);
    
    // Re-import the module to get fresh functions
    const databaseModule = require('../database');
    getDBConnection = databaseModule.getDBConnection;
    createTables = databaseModule.createTables;
    addRecentSequence = databaseModule.addRecentSequence;
    getRecentSequences = databaseModule.getRecentSequences;
    saveSequence = databaseModule.saveSequence;
    getSavedSequences = databaseModule.getSavedSequences;
  });

  describe('getDBConnection', () => {
    it('should open database connection', async () => {
      const db = await getDBConnection();
      expect(SQLite.openDatabase).toHaveBeenCalledWith({
        name: 'DiscoverMusic.db',
        location: 'default',
      });
      expect(db).toBe(mockDb);
    });

    it('should return same connection on subsequent calls', async () => {
      const db1 = await getDBConnection();
      const db2 = await getDBConnection();
      expect(db1).toBe(db2);
      expect(SQLite.openDatabase).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTables', () => {
    it('should create recent_sequences table', async () => {
      mockExecuteSql.mockResolvedValueOnce([{}]);
      
      await createTables();
      
      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS recent_sequences')
      );
    });

    it('should create saved_sequences table', async () => {
      mockExecuteSql.mockResolvedValueOnce([{}]);
      
      await createTables();
      
      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS saved_sequences')
      );
    });

    it('should create both tables', async () => {
      mockExecuteSql.mockResolvedValueOnce([{}]);
      mockExecuteSql.mockResolvedValueOnce([{}]);
      
      await createTables();
      
      expect(mockExecuteSql).toHaveBeenCalledTimes(2);
    });
  });

  describe('addRecentSequence', () => {
    it('should insert a new sequence', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([{}]) // Insert
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: jest.fn((index: number) => ({ id: 1 })),
            },
          },
        ]); // Select

      const sequence: NoteSequence = {
        notes: '[{"name":"C4","frequency":261.63,"octave":4}]',
        noteLength: 0.5,
        totalLength: 2.0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      await addRecentSequence(sequence);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recent_sequences'),
        [sequence.notes, sequence.noteLength, sequence.totalLength, sequence.createdAt]
      );
    });

    it('should keep only last 3 sequences', async () => {
      const sequence: NoteSequence = {
        notes: '[{"name":"C4"}]',
        noteLength: 0.5,
        totalLength: 2.0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Mock insert
      mockExecuteSql.mockResolvedValueOnce([{}]);
      
      // Mock select returning 4 sequences
      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: 4,
            item: jest.fn((index: number) => ({ id: index + 1 })),
          },
        },
      ]);
      
      // Mock delete call
      mockExecuteSql.mockResolvedValueOnce([{}]);

      await addRecentSequence(sequence);

      // Should delete the 4th sequence (index 3)
      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recent_sequences'),
        [4]
      );
    });

    it('should not delete sequences when there are 3 or fewer', async () => {
      const sequence: NoteSequence = {
        notes: '[{"name":"C4"}]',
        noteLength: 0.5,
        totalLength: 2.0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Mock insert
      mockExecuteSql.mockResolvedValueOnce([{}]);
      
      // Mock select returning 2 sequences
      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: 2,
            item: jest.fn((index: number) => ({ id: index + 1 })),
          },
        },
      ]);

      await addRecentSequence(sequence);

      // Should not have any DELETE calls
      const deleteCalls = mockExecuteSql.mock.calls.filter(call =>
        call[0]?.includes('DELETE')
      );
      expect(deleteCalls).toHaveLength(0);
    });
  });

  describe('getRecentSequences', () => {
    it('should return recent sequences ordered by created_at DESC', async () => {
      const mockRows = [
        {
          id: 1,
          notes: '[{"name":"C4"}]',
          note_length: 0.5,
          total_length: 2.0,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 2,
          notes: '[{"name":"D4"}]',
          note_length: 0.5,
          total_length: 1.5,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      // executeSql returns a Promise that resolves to an array
      // The array contains result objects with a 'rows' property
      const mockResult = {
        rows: {
          length: mockRows.length,
          item: jest.fn((index: number) => mockRows[index]),
        },
      };
      
      mockExecuteSql.mockResolvedValueOnce([mockResult]);

      const sequences = await getRecentSequences();

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recent_sequences'),
        []
      );
      expect(sequences).toHaveLength(2);
      expect(sequences[0].id).toBe(1);
      expect(sequences[0].notes).toBe('[{"name":"C4"}]');
      expect(sequences[0].noteLength).toBe(0.5);
      expect(sequences[0].totalLength).toBe(2.0);
      expect(sequences[0].createdAt).toBe('2024-01-02T00:00:00Z');
    });

    it('should return empty array when no sequences exist', async () => {
      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: jest.fn(),
          },
        },
      ]);

      const sequences = await getRecentSequences();
      expect(sequences).toHaveLength(0);
    });

    it('should limit results to 3 sequences', async () => {
      const mockRows = Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        notes: `[{"name":"C${i}"}]`,
        note_length: 0.5,
        total_length: 2.0,
        created_at: `2024-01-0${i + 1}T00:00:00Z`,
      }));

      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: mockRows.length,
            item: jest.fn((index: number) => mockRows[index]),
          },
        },
      ]);

      const sequences = await getRecentSequences();
      expect(sequences).toHaveLength(3);
    });
  });

  describe('saveSequence', () => {
    it('should save a sequence with user_id', async () => {
      const sequence: SavedSequence = {
        notes: '[{"name":"C4"}]',
        noteLength: 0.5,
        totalLength: 2.0,
        createdAt: '2024-01-01T00:00:00Z',
        userId: 'user123',
      };

      mockExecuteSql.mockResolvedValueOnce([{}]);

      await saveSequence(sequence);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO saved_sequences'),
        [
          sequence.notes,
          sequence.noteLength,
          sequence.totalLength,
          sequence.createdAt,
          sequence.userId,
        ]
      );
    });
  });

  describe('getSavedSequences', () => {
    it('should return saved sequences for a user', async () => {
      const mockRows = [
        {
          id: 1,
          notes: '[{"name":"C4"}]',
          note_length: 0.5,
          total_length: 2.0,
          created_at: '2024-01-02T00:00:00Z',
          user_id: 'user123',
        },
        {
          id: 2,
          notes: '[{"name":"D4"}]',
          note_length: 0.5,
          total_length: 1.5,
          created_at: '2024-01-01T00:00:00Z',
          user_id: 'user123',
        },
      ];

      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: mockRows.length,
            item: jest.fn((index: number) => mockRows[index]),
          },
        },
      ]);

      const sequences = await getSavedSequences('user123');

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM saved_sequences'),
        ['user123']
      );
      expect(sequences).toHaveLength(2);
      expect(sequences[0].userId).toBe('user123');
      expect(sequences[1].userId).toBe('user123');
    });

    it('should return empty array when no sequences exist for user', async () => {
      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: jest.fn(),
          },
        },
      ]);

      const sequences = await getSavedSequences('user123');
      expect(sequences).toHaveLength(0);
    });

    it('should filter sequences by user_id', async () => {
      const mockRows = [
        {
          id: 1,
          notes: '[{"name":"C4"}]',
          note_length: 0.5,
          total_length: 2.0,
          created_at: '2024-01-01T00:00:00Z',
          user_id: 'user123',
        },
      ];

      mockExecuteSql.mockResolvedValueOnce([
        {
          rows: {
            length: mockRows.length,
            item: jest.fn((index: number) => mockRows[index]),
          },
        },
      ]);

      const sequences = await getSavedSequences('user123');
      
      // Verify the query includes WHERE user_id = ?
      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = ?'),
        ['user123']
      );
      expect(sequences.every(s => s.userId === 'user123')).toBe(true);
    });
  });
});
