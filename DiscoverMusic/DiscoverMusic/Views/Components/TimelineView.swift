import SwiftUI

struct TimelineView: View {
    let notes: [PianoNote?]
    let noteLength: Double
    let totalLength: Double
    let highlightedNote: PianoNote?
    let currentPlaybackTime: Double?

    private let pixelsPerSecond: CGFloat = 80
    private let laneHeight: CGFloat = 50

    private var timelineWidth: CGFloat { CGFloat(totalLength) * pixelsPerSecond }
    private var noteWidth: CGFloat { CGFloat(noteLength) * pixelsPerSecond }
    private let laneCount = 3

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Timeline", systemImage: "waveform.path")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.secondary)

            ScrollView(.horizontal, showsIndicators: true) {
                VStack(spacing: 0) {
                    // Time scale
                    timeScale

                    // Swim lanes
                    ZStack(alignment: .topLeading) {
                        // Lane backgrounds
                        VStack(spacing: 0) {
                            ForEach(0..<laneCount, id: \.self) { i in
                                HStack {
                                    Text(i == 0 ? "Piano 1" : "Piano \(i + 1)")
                                        .font(.system(size: 10, weight: .medium))
                                        .foregroundColor(.secondary)
                                        .frame(width: 50, alignment: .leading)

                                    Rectangle()
                                        .fill(i % 2 == 0 ? Color(.systemGray6) : Color(.systemGray5).opacity(0.5))
                                        .frame(width: timelineWidth)
                                }
                                .frame(height: laneHeight)
                                .overlay(alignment: .bottom) {
                                    Divider()
                                }
                            }
                        }

                        // Note blocks (first lane only)
                        ForEach(Array(notes.enumerated()), id: \.offset) { index, note in
                            let xPos = CGFloat(index) * noteWidth + 50 // offset for label
                            let isHighlighted = note != nil && highlightedNote?.name == note?.name

                            if let note {
                                noteBlock(note: note, at: xPos, highlighted: isHighlighted)
                            } else {
                                placeholderBlock(at: xPos)
                            }
                        }

                        // Progress indicator
                        if let time = currentPlaybackTime, time > 0 {
                            let xPos = CGFloat(time) * pixelsPerSecond + 50
                            Rectangle()
                                .fill(Color.red)
                                .frame(width: 2, height: CGFloat(laneCount) * laneHeight)
                                .offset(x: xPos)
                                .animation(.linear(duration: 0.05), value: time)
                        }
                    }
                }
                .frame(width: timelineWidth + 60)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Time Scale

    private var timeScale: some View {
        HStack(spacing: 0) {
            Color.clear.frame(width: 50) // label offset
            ZStack(alignment: .leading) {
                Rectangle()
                    .fill(Color(.separator))
                    .frame(height: 1)
                    .frame(width: timelineWidth)

                ForEach(0...Int(ceil(totalLength)), id: \.self) { second in
                    VStack(spacing: 2) {
                        Rectangle()
                            .fill(Color.primary)
                            .frame(width: 1, height: 8)
                        Text("\(second)s")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                    .offset(x: CGFloat(second) * pixelsPerSecond)
                }
            }
            .frame(height: 28)
        }
    }

    // MARK: - Note Block

    private func noteBlock(note: PianoNote, at xPos: CGFloat, highlighted: Bool) -> some View {
        Text(note.name)
            .font(.system(size: 10, weight: .bold, design: .rounded))
            .foregroundColor(.white)
            .frame(width: max(noteWidth - 2, 0), height: laneHeight - 12)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(highlighted ? Color.yellow : noteColor(for: note.name))
            )
            .overlay(
                highlighted
                    ? RoundedRectangle(cornerRadius: 6)
                        .stroke(Color.orange, lineWidth: 2)
                    : nil
            )
            .shadow(color: highlighted ? .yellow.opacity(0.6) : .clear, radius: 4)
            .offset(x: xPos, y: 6)
    }

    private func placeholderBlock(at xPos: CGFloat) -> some View {
        Text("?")
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(.secondary)
            .frame(width: max(noteWidth - 2, 0), height: laneHeight - 12)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [4]))
                    .foregroundColor(.secondary.opacity(0.4))
            )
            .offset(x: xPos, y: 6)
    }

    // MARK: - Note Color

    private func noteColor(for name: String) -> Color {
        let hash = name.unicodeScalars.reduce(0) { $0 + Int($1.value) }
        let hue = Double(hash % 360) / 360.0
        return Color(hue: hue, saturation: 0.65, brightness: 0.7)
    }
}
