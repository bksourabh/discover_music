import SwiftUI

@main
struct DiscoverMusicApp: App {
    @StateObject private var audioService = AudioService()
    @StateObject private var databaseService = DatabaseService()

    var body: some Scene {
        WindowGroup {
            MainView()
                .environmentObject(audioService)
                .environmentObject(databaseService)
        }
    }
}
