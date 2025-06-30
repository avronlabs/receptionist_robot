import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { transcribeAudio } from '../lib/api';

const WS_URL = 'ws://127.0.1.1:8765'; // Change to backend IP if needed

const VoiceInput = forwardRef(function VoiceInput({ onResult, disabled, onListening, onTranscript }, ref) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const lastWakeTimeRef = useRef(0);
  // Track last audio sent time
  const lastAudioSentTimeRef = useRef(0);

  // Notify parent of listening state
  useEffect(() => {
    if (onListening) onListening(isListening);
  }, [isListening, onListening]);

  // Notify parent of transcript
  useEffect(() => {
    if (onTranscript) onTranscript(transcript);
  }, [transcript, onTranscript]);

  // WebSocket connection to backend for wake word
  useEffect(() => {
    wsRef.current = new window.WebSocket(WS_URL);
    wsRef.current.onopen = () => {
      console.log('WebSocket connected to wakeword backend');
    };
    wsRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      if (event.data === 'wakeword' && !disabled) {
        const now = Date.now();
        // Prevent starting a new recording if already listening
        if (!isListening && (now - lastWakeTimeRef.current > 3000)) { // 3 seconds debounce
          lastWakeTimeRef.current = now;
          setIsWakewordEnabled(false); // Disable wakeword while recording
          startMainRecognition();
        } else {
          console.log('Wakeword ignored due to debounce or already listening.');
        }
      }
    };
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
    };
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [disabled, isListening]);

  // Wakeword enable/disable state
  const [isWakewordEnabled, setIsWakewordEnabled] = useState(true);

  // Main recognition (after wake word or button)
  const startMainRecognition = useCallback(() => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastAudioSentTimeRef.current < 3000) {
      console.log('Audio send ignored due to 3s cooldown.');
      return;
    }
    lastAudioSentTimeRef.current = now;
    setIsListening(true);
    setTranscript('');
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
        mimeType = 'audio/ogg; codecs=opus';
      } else {
        mimeType = '';
      }
      const mediaRecorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          // Only send if 3s have passed since last send
          const nowSend = Date.now();
          if (nowSend - lastAudioSentTimeRef.current >= 3000) {
            lastAudioSentTimeRef.current = nowSend;
            const result = await transcribeAudio(audioBlob);
            setTranscript(result.text || '');
            setIsListening(false);
            setIsWakewordEnabled(true); // Re-enable wakeword after recording
            if (onResult) onResult(result.text || '');
          } else {
            setTranscript('Audio send skipped due to cooldown.');
            setIsListening(false);
            setIsWakewordEnabled(true);
          }
        } catch (err) {
          setTranscript('Transcription error');
          setIsListening(false);
          setIsWakewordEnabled(true); // Re-enable wakeword after error
        }
      };
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }, 3000); // Record for 3 seconds max
    }).catch(err => {
      setTranscript('Microphone error');
      setIsListening(false);
      setIsWakewordEnabled(true); // Re-enable wakeword after error
    });
  }, [disabled, onResult]);

  // Only process wakeword if enabled
  useEffect(() => {
    if (!isWakewordEnabled && wsRef.current) {
      wsRef.current.onmessage = null;
    }
    // Restore handler when enabled
    if (isWakewordEnabled && wsRef.current) {
      wsRef.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        if (event.data === 'wakeword' && !disabled) {
          const now = Date.now();
          if (!isListening && (now - lastWakeTimeRef.current > 3000)) {
            lastWakeTimeRef.current = now;
            setIsWakewordEnabled(false);
            startMainRecognition();
          } else {
            console.log('Wakeword ignored due to debounce or already listening.');
          }
        }
      };
    }
  }, [isWakewordEnabled, disabled, isListening]);

  // Expose startMainRecognition to parent via ref (for manual button)
  useImperativeHandle(ref, () => ({
    startMainRecognition,
  }));

  // Remove all UI rendering, just handle voice logic and callbacks
  return null;
});

export default VoiceInput;