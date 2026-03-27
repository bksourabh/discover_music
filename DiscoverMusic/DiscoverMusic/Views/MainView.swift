import SwiftUI
import UniformTypeIdentifiers

struct MainView: View {
    @EnvironmentObject var audioService: AudioService
    @EnvironmentObject var databaseService: DatabaseService
    @StateObject private var viewModel: MainViewModel

    init() {
        // Temporary init — real injection happens in .onAppear
        let audio = AudioService()
        let db = DatabaseService()
        _viewModel = StateObject(wrappedValue: MainViewModel(audioService: audio, databaseService: db))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    controlsSection
                    modeSection
                    filtersSection
                    pianoSection
                    actionButtons
                    if !viewModel.currentNotes.isEmpty {
                        notesDisplaySection
                        timelineSection
                    }
                    playbackButtons
                    recentSection
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .alert("Notice", isPresented: $viewModel.showAlert) {
                Button("OK") { }
            } message: {
                Text(viewModel.alertMessage ?? "")
            }
            .sheet(isPresented: $viewModel.showExportSheet) {
                csvExportSheet
            }
            .fileImporter(
                isPresented: $viewModel.showImportPicker,
                allowedContentTypes: [UTType.commaSeparatedText],
                allowsMultipleSelection: false
            ) { result in
                if case .success(let urls) = result, let url = urls.first {
                    viewModel.importCSV(from: url)
                }
            }
        }
        .onAppear {
            viewModel.audioService.stopAll()
        }
        .environmentObject(viewModel)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 6) {
            Text("Discover Music")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.green, .blue],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .padding(.top, 16)

            Text("Piano Note Generator")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }

    // MARK: - Controls

    private var controlsSection: some View {
        VStack(spacing: 12) {
            SettingCard(title: "Note Length", icon: "metronome") {
                Picker("", selection: $viewModel.noteLength) {
                    ForEach(viewModel.noteLengthOptions, id: \.self) { val in
                        Text(String(format: "%.1fs", val)).tag(val)
                    }
                }
                .pickerStyle(.menu)
                .tint(.primary)
            }

            SettingCard(title: "Total Length", icon: "clock") {
                Picker("", selection: $viewModel.totalLength) {
                    ForEach(viewModel.totalLengthOptions, id: \.self) { val in
                        Text("\(Int(val))s").tag(val)
                    }
                }
                .pickerStyle(.menu)
                .tint(.primary)
            }
        }
    }

    // MARK: - Mode

    private var modeSection: some View {
        VStack(spacing: 8) {
            SettingCard(title: "Generation Mode", icon: "wand.and.stars") {
                Picker("", selection: Binding(
                    get: { viewModel.generationMode },
                    set: { viewModel.setGenerationMode($0) }
                )) {
                    ForEach(GenerationMode.allCases, id: \.self) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
            }

            if viewModel.generationMode == .user {
                HintBanner(
                    text: "Tap piano keys to fill note slots. Tap Generate to create empty placeholders.",
                    color: .orange
                )
            }
        }
    }

    // MARK: - Filters

    private var filtersSection: some View {
        VStack(spacing: 12) {
            SettingCard(title: "Range Selection", icon: "slider.horizontal.2.rectangle.and.arrow.triangle.2.circlepath") {
                Toggle("", isOn: Binding(
                    get: { viewModel.rangeMode },
                    set: { viewModel.toggleRangeMode($0) }
                ))
                .disabled(viewModel.generationMode == .user)
            }
            .opacity(viewModel.generationMode == .user ? 0.5 : 1)

            if viewModel.rangeMode && viewModel.generationMode == .auto {
                HintBanner(
                    text: viewModel.minRangeNote != nil
                        ? "Min: \(viewModel.minRangeNote!.name)\(viewModel.maxRangeNote != nil ? ", Max: \(viewModel.maxRangeNote!.name)" : " — select max key")"
                        : "Select minimum key, then maximum key",
                    color: .blue
                )
            }

            HStack(spacing: 12) {
                FilterToggle(
                    title: "Sharps",
                    subtitle: "Black Keys",
                    isOn: Binding(
                        get: { viewModel.useSharps },
                        set: { viewModel.toggleSharps($0) }
                    ),
                    icon: "number",
                    disabled: viewModel.generationMode == .user
                )

                FilterToggle(
                    title: "Naturals",
                    subtitle: "White Keys",
                    isOn: Binding(
                        get: { viewModel.useFlats },
                        set: { viewModel.toggleFlats($0) }
                    ),
                    icon: "music.note",
                    disabled: viewModel.generationMode == .user
                )
            }
        }
    }

    // MARK: - Piano

    private var pianoSection: some View {
        PianoKeyboardView(
            highlightedNote: audioService.currentNote,
            onKeyPress: { viewModel.handleKeyPress($0) },
            rangeMode: viewModel.rangeMode,
            minRangeNote: viewModel.minRangeNote,
            maxRangeNote: viewModel.maxRangeNote
        )
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: 12) {
            ActionButton(
                title: "Generate",
                icon: "waveform",
                color: .green,
                isLoading: viewModel.isGenerating,
                disabled: viewModel.isGenerating || audioService.isPlaying
            ) {
                Task { await viewModel.generate() }
            }

            ActionButton(
                title: "Reset",
                icon: "arrow.counterclockwise",
                color: Color(.systemGray4),
                foregroundColor: .primary
            ) {
                withAnimation { viewModel.restoreDefaults() }
            }
        }
    }

    // MARK: - Notes Display

    private var notesDisplaySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            let statusText = viewModel.generationMode == .user
                ? "\(viewModel.filledCount) of \(viewModel.totalSlots) notes filled"
                : "Generated \(viewModel.filledCount) notes"

            Label(statusText, systemImage: "music.note.list")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.secondary)

            NotesGridView(
                notes: viewModel.currentNotes,
                generatingIndex: viewModel.generatingNoteIndex,
                editingIndex: viewModel.editingNoteIndex,
                editingValue: $viewModel.editingNoteValue,
                highlightedNote: audioService.currentNote,
                onTap: { viewModel.startEditing(at: $0) },
                onCommit: { viewModel.commitEdit(at: $0) }
            )
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Timeline

    private var timelineSection: some View {
        TimelineView(
            notes: viewModel.currentNotes,
            noteLength: viewModel.noteLength,
            totalLength: viewModel.totalLength,
            highlightedNote: audioService.currentNote,
            currentPlaybackTime: audioService.isPlaying ? audioService.currentPlaybackTime : nil
        )
    }

    // MARK: - Playback Buttons

    private var playbackButtons: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                ActionButton(
                    title: audioService.isPlaying ? "Playing..." : "Play",
                    icon: audioService.isPlaying ? "pause.fill" : "play.fill",
                    color: .blue,
                    isLoading: audioService.isPlaying,
                    disabled: viewModel.validNotes.isEmpty || viewModel.isGenerating
                ) {
                    if audioService.isPlaying {
                        viewModel.stop()
                    } else {
                        viewModel.play()
                    }
                }

                ActionButton(
                    title: "Stop",
                    icon: "stop.fill",
                    color: .red,
                    disabled: !audioService.isPlaying
                ) {
                    viewModel.stop()
                }
            }

            HStack(spacing: 12) {
                ActionButton(
                    title: "Export CSV",
                    icon: "square.and.arrow.up",
                    color: .orange,
                    disabled: viewModel.validNotes.isEmpty
                ) {
                    viewModel.exportCSV()
                }

                ActionButton(
                    title: "Import CSV",
                    icon: "square.and.arrow.down",
                    color: .purple,
                    disabled: audioService.isPlaying || viewModel.isGenerating
                ) {
                    viewModel.showImportPicker = true
                }
            }
        }
    }

    // MARK: - Recent

    private var recentSection: some View {
        Group {
            if !databaseService.recentSequences.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Label("Recent Sequences", systemImage: "clock.arrow.circlepath")
                        .font(.headline)

                    ForEach(Array(databaseService.recentSequences.enumerated()), id: \.element.id) { index, sequence in
                        RecentSequenceRow(
                            sequence: sequence,
                            index: index + 1,
                            onLoad: { viewModel.loadRecent(sequence) },
                            onExport: { viewModel.exportRecent(sequence) }
                        )
                    }
                }
                .padding(.top, 8)
            }
        }
    }

    // MARK: - CSV Export Sheet

    private var csvExportSheet: some View {
        NavigationStack {
            ScrollView {
                Text(viewModel.csvExportContent)
                    .font(.system(.caption, design: .monospaced))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle("CSV Export")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { viewModel.showExportSheet = false }
                }
                ToolbarItem(placement: .primaryAction) {
                    ShareLink(
                        item: viewModel.csvExportContent,
                        subject: Text("Piano Sequence"),
                        message: Text("Exported from Discover Music")
                    )
                }
            }
        }
    }
}
