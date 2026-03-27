import AVFoundation

@MainActor
final class AudioService: ObservableObject {
    @Published var isPlaying = false
    @Published var currentNote: PianoNote?
    @Published var currentPlaybackTime: Double = 0

    private var players: [String: AVAudioPlayer] = [:]
    private var playbackTask: Task<Void, Never>?
    private var progressTimer: Timer?

    private static let sharpToFlat: [String: String] = [
        "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb"
    ]

    init() {
        configureAudioSession()
    }

    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio session error: \(error)")
        }
    }

    /// Convert note name to MP3 filename (e.g. "C#4" -> "Db4")
    private func mp3Name(for note: PianoNote) -> String {
        let name = note.name
        if name.count >= 3, String(name[name.index(name.startIndex, offsetBy: 1)]) == "#" {
            let sharpNote = String(name.prefix(2))
            let octave = String(name.dropFirst(2))
            let flat = Self.sharpToFlat[sharpNote] ?? sharpNote
            return "\(flat)\(octave)"
        }
        // Remove octave number for lookup
        return String(name)
    }

    /// Play a single note for a given duration
    func playNote(_ note: PianoNote, duration: Double) async {
        let filename = mp3Name(for: note)

        guard let url = Bundle.main.url(forResource: filename, withExtension: "mp3") else {
            print("MP3 not found: \(filename).mp3")
            return
        }

        do {
            let player = try AVAudioPlayer(contentsOf: url)
            player.volume = 1.0
            player.prepareToPlay()
            players[note.name] = player
            player.play()

            // Fade out near the end
            let fadeDuration = min(0.25, duration * 0.3)
            let playDuration = duration - fadeDuration

            try await Task.sleep(for: .seconds(playDuration))

            // Fade out
            let steps = 15
            let stepDuration = fadeDuration / Double(steps)
            for i in 1...steps {
                let progress = Double(i) / Double(steps)
                let volume = Float(max(0, 1.0 - progress * progress))
                player.volume = volume
                try await Task.sleep(for: .seconds(stepDuration))
            }

            player.stop()
            players.removeValue(forKey: note.name)
        } catch {
            if !(error is CancellationError) {
                print("Playback error: \(error)")
            }
        }
    }

    /// Play a sequence of notes
    func playSequence(_ notes: [PianoNote], noteLength: Double) {
        stopAll()

        isPlaying = true
        currentPlaybackTime = 0

        // Start progress timer
        let startTime = Date()
        progressTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.currentPlaybackTime = Date().timeIntervalSince(startTime)
            }
        }

        playbackTask = Task { [weak self] in
            guard let self else { return }

            for note in notes {
                if Task.isCancelled { break }

                self.currentNote = note
                await self.playNote(note, duration: noteLength)

                if Task.isCancelled { break }
            }

            self.currentNote = nil
            self.isPlaying = false
            self.currentPlaybackTime = 0
            self.progressTimer?.invalidate()
            self.progressTimer = nil
        }
    }

    /// Play a single note briefly (for keyboard tap)
    func playSingleNote(_ note: PianoNote) {
        Task {
            currentNote = note
            await playNote(note, duration: 0.5)
            currentNote = nil
        }
    }

    func stopAll() {
        playbackTask?.cancel()
        playbackTask = nil
        progressTimer?.invalidate()
        progressTimer = nil

        for (_, player) in players {
            player.stop()
        }
        players.removeAll()

        isPlaying = false
        currentNote = nil
        currentPlaybackTime = 0
    }
}
