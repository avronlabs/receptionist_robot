import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { transcribeAudio } from '../lib/api';

const WAKE_WORD = 'alexa'; // Change as needed

const VoiceInput = forwardRef(function VoiceInput({ onResult, disabled, onListening, onTranscript, useWakeWord = false }, ref) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wakeActive, setWakeActive] = useState(useWakeWord);
  const [wakeDetected, setWakeDetected] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecRef = useRef(null);
  const wakeRecognizerRef = useRef(null);

  // Notify parent of listening state
  useEffect(() => {
    if (onListening) onListening(isListening);
  }, [isListening, onListening]);

  // Notify parent of transcript
  useEffect(() => {
    if (onTranscript) onTranscript(transcript);
  }, [transcript, onTranscript]);

  // Wake word background listener (browser only)
  useEffect(() => {
    if (!useWakeWord) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    if (!wakeActive || disabled) return;
    setWakeDetected(false);
    setTranscript('');
    const WakeRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wakeRecognizer = new WakeRecognition();
    wakeRecognizer.continuous = true;
    wakeRecognizer.interimResults = true;
    wakeRecognizer.lang = 'en-US';
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
    wakeRecognizer.onend = () => {
      if (wakeActive && !disabled) {
        try { wakeRecognizer.start(); } catch (e) {}
      }
    };
    wakeRecognizer.onerror = () => {
      setTimeout(() => {
        if (wakeActive && !disabled) {
          try { wakeRecognizer.start(); } catch (e) {}
        }
      }, 1000);
    };
    try { wakeRecognizer.start(); } catch (e) {}
    wakeRecognizerRef.current = wakeRecognizer;
    return () => {
      wakeRecognizer.onresult = null;
      wakeRecognizer.onend = null;
      wakeRecognizer.onerror = null;
      wakeRecognizer.stop();
    };
  }, [wakeActive, disabled, useWakeWord]);

  // Main recognition (after wake word or button)
  const startMainRecognition = useCallback(() => {
    if (disabled) return;
    setIsListening(true);
    setTranscript('');
    audioChunksRef.current = [];
    // --- Start SpeechRecognition for live transcript ---
    let recognition;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript + ' ';
        }
        setTranscript(interim.trim());
      };
      recognition.onerror = (e) => {};
      recognition.start();
      speechRecRef.current = recognition;
    }
    // --- Start MediaRecorder for Vosk backend ---
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
        if (recognition) {
          try { recognition.stop(); } catch (e) {}
        }
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const result = await transcribeAudio(audioBlob);
          setTranscript(result.text || '');
          setIsListening(false);
          setWakeActive(useWakeWord); // Reactivate wake word after recognition
          if (onResult) onResult(result.text || '');
        } catch (err) {
          setTranscript('Transcription error');
          setIsListening(false);
          setWakeActive(useWakeWord);
        }
      };
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }, 3000); // Record for 3 seconds max
    }).catch(err => {
      setTranscript('Microphone error');
      setIsListening(false);
      setWakeActive(useWakeWord);
    });
  }, [disabled, onResult, useWakeWord]);

  // Expose startMainRecognition to parent via ref
  useImperativeHandle(ref, () => ({
    startMainRecognition,
  }));

  // Remove all UI rendering, just handle voice logic and callbacks
  return null;
});

export default VoiceInput;