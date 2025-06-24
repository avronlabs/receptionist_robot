import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const WAKE_WORD = 'alexa';

const VoiceInput = forwardRef(function VoiceInput({ onResult, disabled, onListening, onTranscript }, ref) {
  const [isListening, setIsListening] = useState(false);
  const [wakeActive, setWakeActive] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [wakeDetected, setWakeDetected] = useState(false);
  const wakeRecognizerRef = useRef(null);
  const wakeRecognizerRunning = useRef(false);
  const mainRecognizerRef = useRef(null);

  // Notify parent of listening state
  useEffect(() => {
    if (onListening) onListening(isListening);
  }, [isListening, onListening]);

  // Notify parent of transcript
  useEffect(() => {
    if (onTranscript) onTranscript(transcript);
  }, [transcript, onTranscript]);

  // Wake word background listener
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    if (!wakeActive || disabled) return;

    setWakeDetected(false);
    setTranscript('');

    const WakeRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wakeRecognizer = new WakeRecognition();
    wakeRecognizer.continuous = true;
    wakeRecognizer.interimResults = true;
    wakeRecognizer.lang = 'en-US';

    wakeRecognizer.onstart = () => {
      wakeRecognizerRunning.current = true;
    };
    wakeRecognizer.onend = () => {
      wakeRecognizerRunning.current = false;
      if (wakeActive && !disabled) {
        try {
          if (!wakeRecognizerRunning.current) wakeRecognizer.start();
        } catch (e) {}
      }
    };
    wakeRecognizer.onerror = (e) => {
      wakeRecognizerRunning.current = false;
      // Restart on error
      wakeRecognizer.stop();
      setTimeout(() => {
        if (wakeActive && !disabled && !wakeRecognizerRunning.current) {
          try { wakeRecognizer.start(); } catch (e) {}
        }
      }, 1000);
    };
    wakeRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPiece = event.results[i][0].transcript;
        interim += transcriptPiece + ' ';
        if (transcriptPiece.toLowerCase().includes(WAKE_WORD)) {
          setWakeDetected(true);
          wakeRecognizer.stop();
          setWakeActive(false);
          startMainRecognition();
          break;
        }
      }
      setTranscript(interim.trim());
    };
    try {
      if (!wakeRecognizerRunning.current) wakeRecognizer.start();
    } catch (e) {}
    wakeRecognizerRef.current = wakeRecognizer;
    return () => {
      wakeRecognizer.onstart = null;
      wakeRecognizer.onend = null;
      wakeRecognizer.onerror = null;
      wakeRecognizer.onresult = null;
      wakeRecognizer.stop();
      wakeRecognizerRunning.current = false;
    };
  }, [wakeActive, disabled]);

  // Main recognition (after wake word or button)
  const startMainRecognition = useCallback(() => {
    if (disabled) return;
    setIsListening(true);
    setTranscript('');
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPiece = event.results[i][0].transcript;
        interim += transcriptPiece + ' ';
      }
      setTranscript(interim.trim());
      // Only send final result
      if (event.results[event.results.length - 1].isFinal) {
        const finalTranscript = event.results[event.results.length - 1][0].transcript;
        setTranscript('');
        onResult(finalTranscript);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Optionally, you could call a callback or set a state to show a user-friendly message
        // For now, just ignore or log a friendlier message
        console.info('No speech detected. Please try again.');
      } else {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
      setWakeActive(true);
      setTranscript('');
    };
    recognition.onend = () => {
      setIsListening(false);
      setWakeActive(true);
      setTranscript('');
    };
    recognition.start();
    mainRecognizerRef.current = recognition;
  }, [disabled, onResult]);

  // Expose startMainRecognition to parent via ref
  useImperativeHandle(ref, () => ({
    startMainRecognition,
  }));

  // Button click handler
  const handleButton = useCallback(() => {
    if (disabled || isListening) return;
    setWakeActive(false);
    setWakeDetected(false);
    setTranscript('');
    if (wakeRecognizerRef.current) wakeRecognizerRef.current.stop();
    startMainRecognition();
  }, [disabled, isListening, startMainRecognition]);

  // Remove all UI rendering, just handle voice logic and callbacks
  return null;
});

export default VoiceInput;