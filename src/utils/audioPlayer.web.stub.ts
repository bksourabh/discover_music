/**
 * Stub for react-native-sound on web
 * This prevents import errors when webpack processes the code
 * The web version uses audioPlayer.web.ts instead
 */
class SoundStub {
  setCategory() {}
  enable() {}
  disable() {}
  play() {}
  stop() {}
  release() {}
  pause() {}
  resume() {}
  getDuration() { return 0; }
  getCurrentTime() { return 0; }
  setVolume() {}
  setPan() {}
  setNumberOfLoops() {}
  setSpeed() {}
  setPitch() {}
  isPlaying() { return false; }
  isLoaded() { return false; }
}

export default SoundStub;
