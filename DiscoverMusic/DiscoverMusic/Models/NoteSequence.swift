import Foundation

struct NoteSequence: Identifiable, Codable, Equatable {
    let id: UUID
    let notes: [PianoNote]
    let noteLength: Double
    let totalLength: Double
    let createdAt: Date

    init(notes: [PianoNote], noteLength: Double, totalLength: Double, createdAt: Date = Date()) {
        self.id = UUID()
        self.notes = notes
        self.noteLength = noteLength
        self.totalLength = totalLength
        self.createdAt = createdAt
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: createdAt)
    }

    var summary: String {
        "\(noteLength)s notes, \(Int(totalLength))s total"
    }

    /// Export to CSV string
    func toCSV() -> String {
        var lines = ["Index,Note Name,Frequency (Hz),Octave,Note Length (s),Timestamp (s)"]
        var timestamp: Double = 0
        for (index, note) in notes.enumerated() {
            lines.append("\(index + 1),\(note.name),\(String(format: "%.2f", note.frequency)),\(note.octave),\(noteLength),\(String(format: "%.2f", timestamp))")
            timestamp += noteLength
        }
        return lines.joined(separator: "\n")
    }

    /// Parse from CSV string
    static func fromCSV(_ csv: String) -> (notes: [PianoNote], noteLength: Double)? {
        let lines = csv.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: "\n")
        guard lines.count >= 2 else { return nil }

        let header = lines[0].components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        guard let noteNameIdx = header.firstIndex(of: "Note Name"),
              let noteLengthIdx = header.firstIndex(of: "Note Length (s)") else { return nil }

        var notes: [PianoNote] = []
        var parsedNoteLength: Double?

        for i in 1..<lines.count {
            let values = lines[i].components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }
            guard values.count > max(noteNameIdx, noteLengthIdx) else { continue }

            let noteName = values[noteNameIdx]
            if let nl = Double(values[noteLengthIdx]), parsedNoteLength == nil {
                parsedNoteLength = nl
            }

            if let note = PianoKeys.fromString(noteName) {
                notes.append(note)
            }
        }

        guard !notes.isEmpty, let nl = parsedNoteLength else { return nil }
        return (notes, nl)
    }
}
