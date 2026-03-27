import SwiftUI
import UniformTypeIdentifiers

enum GenerationMode: String, CaseIterable {
    case auto = "Auto Generate"
    case user = "User Generated"
}

@MainActor
final class MainViewModel: ObservableObject {
    // MARK: - Published State

    @Published var noteLength: Double = 0.3
    @Published var totalLength: Double = 7
    @Published var currentNotes: [PianoNote?] = []
    @Published var isGenerating = false
    @Published var generatingNoteIndex: Int?
    @Published var generationMode: GenerationMode = .auto

    // Range
    @Published var rangeMode = false
    @Published var minRangeNote: PianoNote?
    @Published var maxRangeNote: PianoNote?
    @Published var useSharps = true
    @Published var useFlats = true

    // Editing
    @Published var editingNoteIndex: Int?
    @Published var editingNoteValue = ""

    // CSV
    @Published var showExportSheet = false
    @Published var showImportPicker = false
    @Published var csvExportContent = ""

    // Alert
    @Published var alertMessage: String?
    @Published var showAlert = false

    let audioService: AudioService
    let databaseService: DatabaseService

    // MARK: - Computed

    var validNotes: [PianoNote] {
        currentNotes.compactMap { $0 }
    }

    var filledCount: Int { validNotes.count }
    var totalSlots: Int { currentNotes.count }

    var noteLengthOptions: [Double] {
        (1...20).map { Double($0) * 0.1 }
    }

    var totalLengthOptions: [Double] {
        (5...15).map { Double($0) }
    }

    // MARK: - Init

    init(audioService: AudioService, databaseService: DatabaseService) {
        self.audioService = audioService
        self.databaseService = databaseService
    }

    // MARK: - Generation

    func generate() async {
        let numNotes = Int(totalLength / noteLength)

        if generationMode == .user {
            currentNotes = Array(repeating: nil, count: numNotes)
            return
        }

        isGenerating = true
        generatingNoteIndex = nil
        audioService.stopAll()

        var available = PianoKeys.all

        if rangeMode, let min = minRangeNote, let max = maxRangeNote {
            available = available.filter { $0.frequency >= min.frequency && $0.frequency <= max.frequency }
        }

        if !useSharps || !useFlats {
            available = available.filter { note in
                if !useSharps && note.isSharp { return false }
                if !useFlats && note.isNatural { return false }
                return true
            }
        }

        if available.isEmpty { available = PianoKeys.all }

        // Progressive generation with animation
        currentNotes = []
        var notes: [PianoNote] = []

        for i in 0..<numNotes {
            generatingNoteIndex = i
            let note = available.randomElement()!
            notes.append(note)
            withAnimation(.easeOut(duration: 0.15)) {
                currentNotes = notes.map { Optional($0) }
            }
            try? await Task.sleep(for: .milliseconds(50))
        }

        generatingNoteIndex = nil
        isGenerating = false

        // Save to recent
        let sequence = NoteSequence(notes: notes, noteLength: noteLength, totalLength: totalLength)
        databaseService.addRecent(sequence)

        // Auto-play
        audioService.playSequence(notes, noteLength: noteLength)
    }

    func play() {
        guard !validNotes.isEmpty else {
            showAlertMessage("Please generate or fill in notes first")
            return
        }
        audioService.playSequence(validNotes, noteLength: noteLength)
    }

    func stop() {
        audioService.stopAll()
    }

    // MARK: - Keyboard Interaction

    func handleKeyPress(_ note: PianoNote) {
        if rangeMode {
            handleRangeSelection(note)
        } else if generationMode == .user {
            fillNextSlot(with: note)
        } else {
            audioService.playSingleNote(note)
        }
    }

    private func handleRangeSelection(_ note: PianoNote) {
        if minRangeNote == nil {
            minRangeNote = note
            maxRangeNote = nil
        } else if maxRangeNote == nil {
            if note.frequency > (minRangeNote?.frequency ?? 0) {
                maxRangeNote = note
            } else {
                showAlertMessage("Maximum key must be higher than minimum key")
            }
        } else {
            minRangeNote = note
            maxRangeNote = nil
        }
    }

    private func fillNextSlot(with note: PianoNote) {
        guard let emptyIndex = currentNotes.firstIndex(where: { $0 == nil }) else {
            showAlertMessage("All slots are filled")
            return
        }
        withAnimation(.spring(response: 0.3)) {
            currentNotes[emptyIndex] = note
        }
        audioService.playSingleNote(note)
    }

    // MARK: - Note Editing

    func startEditing(at index: Int) {
        guard let note = currentNotes[index] else { return }
        editingNoteIndex = index
        editingNoteValue = note.name
    }

    func commitEdit(at index: Int) {
        let value = editingNoteValue.trimmingCharacters(in: .whitespaces).uppercased()
        if PianoKeys.isValid(value), let note = PianoKeys.fromString(value) {
            withAnimation { currentNotes[index] = note }
        }
        editingNoteIndex = nil
        editingNoteValue = ""
    }

    // MARK: - Toggles

    func toggleRangeMode(_ enabled: Bool) {
        rangeMode = enabled
        minRangeNote = nil
        maxRangeNote = nil
    }

    func toggleSharps(_ enabled: Bool) {
        if !enabled && !useFlats {
            showAlertMessage("At least one key type must be enabled")
            return
        }
        useSharps = enabled
    }

    func toggleFlats(_ enabled: Bool) {
        if !enabled && !useSharps {
            showAlertMessage("At least one key type must be enabled")
            return
        }
        useFlats = enabled
    }

    // MARK: - Mode Change

    func setGenerationMode(_ mode: GenerationMode) {
        generationMode = mode
        if mode == .user {
            rangeMode = false
            minRangeNote = nil
            maxRangeNote = nil
            let numNotes = Int(totalLength / noteLength)
            currentNotes = Array(repeating: nil, count: numNotes)
        } else {
            currentNotes = []
        }
    }

    // MARK: - Restore Defaults

    func restoreDefaults() {
        audioService.stopAll()
        noteLength = 0.3
        totalLength = 7
        currentNotes = []
        rangeMode = false
        minRangeNote = nil
        maxRangeNote = nil
        useSharps = true
        useFlats = true
        editingNoteIndex = nil
        editingNoteValue = ""
        generationMode = .auto
    }

    // MARK: - CSV

    func exportCSV() {
        guard !validNotes.isEmpty else {
            showAlertMessage("No notes to export")
            return
        }
        let sequence = NoteSequence(notes: validNotes, noteLength: noteLength, totalLength: totalLength)
        csvExportContent = sequence.toCSV()
        showExportSheet = true
    }

    func importCSV(from url: URL) {
        guard url.startAccessingSecurityScopedResource() else { return }
        defer { url.stopAccessingSecurityScopedResource() }

        do {
            let content = try String(contentsOf: url, encoding: .utf8)
            guard let parsed = NoteSequence.fromCSV(content) else {
                showAlertMessage("Invalid CSV format")
                return
            }

            withAnimation {
                currentNotes = parsed.notes.map { Optional($0) }
                noteLength = parsed.noteLength
                totalLength = Double(Int(Double(parsed.notes.count) * parsed.noteLength) + 1)
            }

            let sequence = NoteSequence(notes: parsed.notes, noteLength: parsed.noteLength, totalLength: totalLength)
            databaseService.addRecent(sequence)
            audioService.playSequence(parsed.notes, noteLength: parsed.noteLength)
        } catch {
            showAlertMessage("Failed to read CSV file")
        }
    }

    func loadRecent(_ sequence: NoteSequence) {
        withAnimation {
            currentNotes = sequence.notes.map { Optional($0) }
            noteLength = sequence.noteLength
            totalLength = sequence.totalLength
        }
    }

    func exportRecent(_ sequence: NoteSequence) {
        csvExportContent = sequence.toCSV()
        showExportSheet = true
    }

    // MARK: - Alert

    private func showAlertMessage(_ message: String) {
        alertMessage = message
        showAlert = true
    }
}
