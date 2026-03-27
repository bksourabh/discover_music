import Foundation

@MainActor
final class DatabaseService: ObservableObject {
    @Published var recentSequences: [NoteSequence] = []

    private let maxRecent = 3
    private let recentKey = "discover_music_recent_sequences"

    init() {
        loadRecent()
    }

    func addRecent(_ sequence: NoteSequence) {
        recentSequences.insert(sequence, at: 0)
        if recentSequences.count > maxRecent {
            recentSequences = Array(recentSequences.prefix(maxRecent))
        }
        saveRecent()
    }

    private func loadRecent() {
        guard let data = UserDefaults.standard.data(forKey: recentKey),
              let sequences = try? JSONDecoder().decode([NoteSequence].self, from: data) else { return }
        recentSequences = sequences
    }

    private func saveRecent() {
        if let data = try? JSONEncoder().encode(recentSequences) {
            UserDefaults.standard.set(data, forKey: recentKey)
        }
    }
}
