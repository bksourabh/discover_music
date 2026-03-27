import SwiftUI

// MARK: - Setting Card

struct SettingCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        HStack {
            Label(title, systemImage: icon)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.primary)
            Spacer()
            content()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Action Button

struct ActionButton: View {
    let title: String
    let icon: String
    let color: Color
    var foregroundColor: Color = .white
    var isLoading: Bool = false
    var disabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if isLoading {
                    ProgressView()
                        .tint(foregroundColor)
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
            }
            .foregroundColor(disabled ? .secondary : foregroundColor)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(disabled ? Color(.systemGray5) : color, in: RoundedRectangle(cornerRadius: 12))
        }
        .disabled(disabled)
        .animation(.easeOut(duration: 0.15), value: disabled)
    }
}

// MARK: - Filter Toggle

struct FilterToggle: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool
    let icon: String
    var disabled: Bool = false

    var body: some View {
        Button {
            guard !disabled else { return }
            isOn.toggle()
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                Text(title)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                Text(subtitle)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                isOn && !disabled ? Color.green.opacity(0.15) : Color(.systemGray6),
                in: RoundedRectangle(cornerRadius: 12)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isOn && !disabled ? Color.green : Color.clear, lineWidth: 2)
            )
            .foregroundColor(disabled ? .secondary : .primary)
        }
        .buttonStyle(.plain)
        .opacity(disabled ? 0.5 : 1)
    }
}

// MARK: - Hint Banner

struct HintBanner: View {
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(color)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(color.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Recent Sequence Row

struct RecentSequenceRow: View {
    let sequence: NoteSequence
    let index: Int
    let onLoad: () -> Void
    let onExport: () -> Void

    var body: some View {
        HStack {
            Button(action: onLoad) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Sequence \(index)")
                        .font(.subheadline.weight(.semibold))
                    Text(sequence.summary)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(sequence.formattedDate)
                        .font(.caption2)
                        .foregroundColor(.tertiary)
                }
            }
            .buttonStyle(.plain)

            Spacer()

            Button(action: onExport) {
                Label("Export", systemImage: "square.and.arrow.up")
                    .font(.caption.weight(.medium))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.orange, in: RoundedRectangle(cornerRadius: 8))
                    .foregroundColor(.white)
            }
            .buttonStyle(.plain)
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
