import Foundation

struct PianoNote: Identifiable, Codable, Equatable, Hashable {
    var id: String { name }
    let name: String
    let frequency: Double
    let octave: Int

    var isSharp: Bool { name.contains("#") }
    var isNatural: Bool { !isSharp }

    /// Base note letter (e.g. "C" from "C#4" or "A" from "A0")
    var baseName: String {
        if name.count >= 2 && name.dropFirst().first == "#" {
            return String(name.prefix(2))
        }
        return String(name.prefix(1))
    }

    var displayName: String { name }
}

// MARK: - Piano Key Generation

enum PianoKeys {
    static let noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

    /// Generate all 88 piano keys (A0 to C8)
    static func generateAll() -> [PianoNote] {
        var keys: [PianoNote] = []
        var noteIndex = 9 // Start at A
        var octave = 0

        for keyNumber in 1...88 {
            let noteName = noteNames[noteIndex]
            let fullName = "\(noteName)\(octave)"
            let frequency = 27.5 * pow(2.0, Double(keyNumber - 1) / 12.0)

            keys.append(PianoNote(name: fullName, frequency: frequency, octave: octave))

            noteIndex = (noteIndex + 1) % 12
            if noteIndex == 0 {
                octave += 1
            }
        }

        return keys
    }

    /// All 88 keys cached
    static let all: [PianoNote] = generateAll()

    /// Generate random notes for a given duration
    static func generateRandom(
        noteLength: Double,
        totalLength: Double,
        minNote: PianoNote? = nil,
        maxNote: PianoNote? = nil,
        useSharps: Bool = true,
        useFlats: Bool = true
    ) -> [PianoNote] {
        let numNotes = Int(totalLength / noteLength)

        var available = all

        if let min = minNote, let max = maxNote {
            available = available.filter { $0.frequency >= min.frequency && $0.frequency <= max.frequency }
        }

        if !useSharps || !useFlats {
            available = available.filter { note in
                if !useSharps && note.isSharp { return false }
                if !useFlats && note.isNatural { return false }
                return true
            }
        }

        if available.isEmpty { available = all }

        return (0..<numNotes).map { _ in
            available[Int.random(in: 0..<available.count)]
        }
    }

    /// Validate a note string like "C#4"
    static func isValid(_ noteString: String) -> Bool {
        let pattern = #"^[CDEFGAB](#)?[0-8]$"#
        guard noteString.range(of: pattern, options: .regularExpression) != nil else { return false }
        return all.contains { $0.name == noteString }
    }

    /// Convert string to PianoNote
    static func fromString(_ noteString: String) -> PianoNote? {
        all.first { $0.name == noteString }
    }
}
