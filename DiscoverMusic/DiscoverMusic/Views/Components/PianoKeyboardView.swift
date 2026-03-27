import SwiftUI

struct PianoKeyboardView: View {
    let highlightedNote: PianoNote?
    let onKeyPress: (PianoNote) -> Void
    var rangeMode: Bool = false
    var minRangeNote: PianoNote?
    var maxRangeNote: PianoNote?

    private let allKeys = PianoKeys.all
    private let whiteKeyWidth: CGFloat = 36
    private let blackKeyWidth: CGFloat = 24
    private let keyboardHeight: CGFloat = 160
    private let blackKeyHeight: CGFloat = 100

    private var whiteKeys: [PianoNote] {
        let noteOrder = ["C", "D", "E", "F", "G", "A", "B"]
        return allKeys.filter { !$0.isSharp }.sorted { a, b in
            if a.octave != b.octave { return a.octave < b.octave }
            let aNote = String(a.name.prefix(1))
            let bNote = String(b.name.prefix(1))
            return (noteOrder.firstIndex(of: aNote) ?? 0) < (noteOrder.firstIndex(of: bNote) ?? 0)
        }
    }

    private var blackKeys: [PianoNote] {
        allKeys.filter { $0.isSharp }
    }

    var body: some View {
        VStack(spacing: 8) {
            Label("Piano Keyboard", systemImage: "pianokeys")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.secondary)

            ScrollView(.horizontal, showsIndicators: true) {
                ZStack(alignment: .topLeading) {
                    // White keys
                    HStack(spacing: 0) {
                        ForEach(whiteKeys) { key in
                            WhiteKeyView(
                                note: key,
                                width: whiteKeyWidth,
                                height: keyboardHeight,
                                state: keyState(for: key),
                                onTap: { onKeyPress(key) }
                            )
                        }
                    }

                    // Black keys overlay
                    ForEach(blackKeys) { key in
                        let xPos = blackKeyPosition(for: key)
                        BlackKeyView(
                            note: key,
                            width: blackKeyWidth,
                            height: blackKeyHeight,
                            state: keyState(for: key),
                            onTap: { onKeyPress(key) }
                        )
                        .offset(x: xPos)
                    }
                }
                .frame(height: keyboardHeight)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Key State

    enum KeyState {
        case normal, highlighted, minRange, maxRange, inRange
    }

    private func keyState(for note: PianoNote) -> KeyState {
        if highlightedNote?.name == note.name { return .highlighted }
        if rangeMode {
            if minRangeNote?.name == note.name { return .minRange }
            if maxRangeNote?.name == note.name { return .maxRange }
            if let min = minRangeNote, let max = maxRangeNote,
               note.frequency >= min.frequency && note.frequency <= max.frequency {
                return .inRange
            }
        }
        return .normal
    }

    // MARK: - Black Key Position

    private func blackKeyPosition(for blackKey: PianoNote) -> CGFloat {
        let whiteKeyMap: [String: String] = [
            "C#": "C", "D#": "D", "F#": "F", "G#": "G", "A#": "A"
        ]

        let notePart = String(blackKey.name.prefix(2))
        guard let whiteName = whiteKeyMap[notePart] else { return 0 }

        let targetName = "\(whiteName)\(blackKey.octave)"
        guard let whiteIndex = whiteKeys.firstIndex(where: { $0.name == targetName }) else { return 0 }

        return CGFloat(whiteIndex) * whiteKeyWidth + whiteKeyWidth * 0.7
    }
}

// MARK: - White Key

private struct WhiteKeyView: View {
    let note: PianoNote
    let width: CGFloat
    let height: CGFloat
    let state: PianoKeyboardView.KeyState
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack {
                Spacer()
                Text(note.name)
                    .font(.system(size: 9, weight: .medium, design: .rounded))
                    .foregroundColor(state == .highlighted ? .black : .secondary)
                    .padding(.bottom, 8)
            }
            .frame(width: width, height: height)
            .background(backgroundColor)
            .overlay(
                Rectangle()
                    .fill(Color(.separator))
                    .frame(width: 1),
                alignment: .trailing
            )
            .overlay(
                state == .highlighted
                    ? RoundedRectangle(cornerRadius: 2)
                        .stroke(Color.orange, lineWidth: 2)
                    : nil
            )
        }
        .buttonStyle(.plain)
    }

    private var backgroundColor: Color {
        switch state {
        case .normal: return .white
        case .highlighted: return Color(.systemYellow)
        case .minRange: return .green
        case .maxRange: return .blue
        case .inRange: return Color.blue.opacity(0.12)
        }
    }
}

// MARK: - Black Key

private struct BlackKeyView: View {
    let note: PianoNote
    let width: CGFloat
    let height: CGFloat
    let state: PianoKeyboardView.KeyState
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack {
                Spacer()
                Text(note.name)
                    .font(.system(size: 7, weight: .semibold, design: .rounded))
                    .foregroundColor(state == .highlighted ? .black : .white.opacity(0.8))
                    .padding(.bottom, 6)
            }
            .frame(width: width, height: height)
            .background(backgroundColor)
            .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 4, bottomTrailingRadius: 4))
            .shadow(color: .black.opacity(0.3), radius: 2, y: 2)
        }
        .buttonStyle(.plain)
        .zIndex(10)
    }

    private var backgroundColor: Color {
        switch state {
        case .normal: return Color(.darkGray)
        case .highlighted: return Color(.systemYellow)
        case .minRange: return .green
        case .maxRange: return .blue
        case .inRange: return Color.blue.opacity(0.6)
        }
    }
}
