import React, {useRef, useEffect} from 'react';
import {WebView} from 'react-native-webview';
import {PianoNote} from '../utils/pianoNotes';

interface AudioPlayerProps {
  notes: PianoNote[];
  noteLength: number;
  onPlayComplete?: () => void;
}

/**
 * AudioPlayer component using Web Audio API via WebView
 * This component generates and plays piano notes programmatically
 * Note: Uses sine wave oscillators for tone generation
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({notes, noteLength, onPlayComplete}) => {
  const webViewRef = useRef<WebView>(null);
  const frequencies = notes.map(note => note.frequency);

  useEffect(() => {
    if (notes.length > 0 && webViewRef.current) {
      // Small delay to ensure WebView is ready
      setTimeout(() => {
        playSequence();
      }, 100);
    }
  }, [notes, noteLength]);

  const playSequence = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <script>
            let audioContext;
            
            function initAudio() {
              audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            function playNote(frequency, duration) {
              return new Promise((resolve) => {
                if (!audioContext) {
                  initAudio();
                }
                
                if (audioContext.state === 'suspended') {
                  audioContext.resume();
                }
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                // Create envelope for natural sound decay
                const now = audioContext.currentTime;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.9);
                gainNode.gain.setValueAtTime(0, now + duration);
                
                oscillator.start(now);
                oscillator.stop(now + duration);
                
                oscillator.onended = () => {
                  resolve();
                };
              });
            }
            
            async function playSequence() {
              initAudio();
              
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }
              
              const frequencies = ${JSON.stringify(frequencies)};
              const noteLength = ${noteLength};
              
              for (let i = 0; i < frequencies.length; i++) {
                await playNote(frequencies[i], noteLength);
              }
              
              window.ReactNativeWebView.postMessage('playbackComplete');
            }
            
            // Start playback when page loads
            window.addEventListener('load', () => {
              playSequence();
            });
            
            // Also try immediately in case load event already fired
            if (document.readyState === 'complete') {
              playSequence();
            }
          </script>
        </body>
      </html>
    `;

    if (webViewRef.current) {
      // Inject the HTML content
      webViewRef.current.injectJavaScript(`
        (function() {
          document.open();
          document.write(\`${htmlContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
          document.close();
        })();
      `);
    }
  };

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'playbackComplete' && onPlayComplete) {
      onPlayComplete();
    }
  };

  if (notes.length === 0) {
    return null;
  }

  const initialHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          let audioContext;
          const frequencies = ${JSON.stringify(frequencies)};
          const noteLength = ${noteLength};
          
          function initAudio() {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          
          function playNote(frequency, duration) {
            return new Promise((resolve) => {
              if (!audioContext) {
                initAudio();
              }
              
              if (audioContext.state === 'suspended') {
                audioContext.resume();
              }
              
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = frequency;
              oscillator.type = 'sine';
              
              const now = audioContext.currentTime;
              gainNode.gain.setValueAtTime(0, now);
              gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
              gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.9);
              gainNode.gain.setValueAtTime(0, now + duration);
              
              oscillator.start(now);
              oscillator.stop(now + duration);
              
              oscillator.onended = () => resolve();
            });
          }
          
          async function playSequence() {
            initAudio();
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            for (const freq of frequencies) {
              await playNote(freq, noteLength);
            }
            window.ReactNativeWebView.postMessage('playbackComplete');
          }
          
          window.addEventListener('load', playSequence);
          if (document.readyState === 'complete') {
            playSequence();
          }
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      source={{html: initialHtml}}
      onMessage={handleMessage}
      style={{position: 'absolute', width: 1, height: 1, opacity: 0}}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
    />
  );
};

export default AudioPlayer;

