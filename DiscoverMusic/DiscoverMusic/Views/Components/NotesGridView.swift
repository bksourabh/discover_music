import SwiftUI

struct NotesGridView: View {
    let notes: [PianoNote?]
    let generatingIndex: Int?
    let editingIndex: Int?
    @Binding var editingValue: String
    let highlightedNote: PianoNote?
    let onTap: (Int) -> Void
    let onCommit: (Int) -> Void

    private let columns = [GridItem(.adaptive(minimum: 56, maximum: 70), spacing: 8)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            ForEach(Array(notes.enumerated()), id: \.offset) { index, note in
                if editingIndex == index, note != nil {
                    TextField("", text: $editingValue)
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .multilineTextAlignment(.center)
                        .frame(height: 38)
                        .background(Color(.systemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.blue, lineWidth: 2)
                        )
                        .onSubmit { onCommit(index) }
                        .submitLabel(.done)
                } else {
                    NoteChip(
                        note: note,
                        isGenerating: generatingIndex == index,
                        isHighlighted: note != nil && highlightedNote?.name == note?.name
                    )
                    .onTapGesture { if note != nil { onTap(index) } }
                }
            }
        }
    }
}

// MARK: - Note Chip

private struct NoteChip: View {
    let note: PianoNote?
    let isGenerating: Bool
    let isHighlighted: Bool

    var body: some View {
        Text(note?.name ?? "?")
            .font(.system(size: 13, weight: .bold, design: .rounded))
            .foregroundColor(foregroundColor)
            .frame(height: 38)
            .frame(maxWidth: .infinity)
            .background(backgroundColor, in: RoundedRectangle(cornerRadius: 8))
            .overlay(overlayBorder)
            .shadow(color: shadowColor, radius: isGenerating ? 6 : 0)
            .scaleEffect(isGenerating ? 1.05 : 1)
            .animation(.spring(response: 0.3), value: isGenerating)
    }

    private var foregroundColor: Color {
        if note == nil { return .secondary }
        if isHighlighted { return .black }
        if isGenerating { return .black }
        return .white
    }

    private var backgroundColor: Color {
        if note == nil { return Color(.systemGray5) }
        if isHighlighted { return .yellow }
        if isGenerating { return .yellow }
        return .blue
    }

    @ViewBuilder
    private var overlayBorder: some View {
        if note == nil {
            RoundedRectangle(cornerRadius: 8)
                .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [4]))
                .foregroundColor(.secondary.opacity(0.4))
        } else if isHighlighted || isGenerating {
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.orange, lineWidth: 2)
        }
    }

    private var shadowColor: Color {
        isGenerating ? .yellow.opacity(0.6) : .clear
    }
}
