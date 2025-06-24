import { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../lib/api';
import VoiceInput from './VoiceInput';
import AudioPlayer from './AudioPlayer';
import { Mic,  } from 'lucide-react';

function ListeningWave({ active, idle }) {
  // Animate dots for both listening and idle (wakeup detection) states
  return (
    <div className="flex flex-col items-center mb-2">
      <div className="flex items-end justify-center gap-1 h-8 mt-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 rounded bg-blue-500 transition-all duration-300 ${active ? `animate-wave${i}` : idle ? `animate-idle${i}` : 'h-2'}`}
            style={{ height: active || idle ? undefined : '8px' }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes wave0 { 0%,100%{height:8px;} 50%{height:32px;} }
        @keyframes wave1 { 0%,100%{height:12px;} 50%{height:28px;} }
        @keyframes wave2 { 0%,100%{height:16px;} 50%{height:36px;} }
        @keyframes wave3 { 0%,100%{height:12px;} 50%{height:28px;} }
        @keyframes wave4 { 0%,100%{height:8px;} 50%{height:32px;} }
        .animate-wave0 { animation: wave0 1s infinite; }
        .animate-wave1 { animation: wave1 1s infinite; }
        .animate-wave2 { animation: wave2 1s infinite; }
        .animate-wave3 { animation: wave3 1s infinite; }
        .animate-wave4 { animation: wave4 1s infinite; }
        // Idle animation for wakeup detection (slower, subtle)
        @keyframes idle0 { 0%,100%{height:8px;} 50%{height:18px;} }
        @keyframes idle1 { 0%,100%{height:10px;} 50%{height:16px;} }
        @keyframes idle2 { 0%,100%{height:12px;} 50%{height:20px;} }
        @keyframes idle3 { 0%,100%{height:10px;} 50%{height:16px;} }
        @keyframes idle4 { 0%,100%{height:8px;} 50%{height:18px;} }
        .animate-idle0 { animation: idle0 2s infinite; }
        .animate-idle1 { animation: idle1 2s infinite; }
        .animate-idle2 { animation: idle2 2s infinite; }
        .animate-idle3 { animation: idle3 2s infinite; }
        .animate-idle4 { animation: idle4 2s infinite; }
      `}</style>
    </div>
  );
}

export default function ChatBox() {
  const [userMessage, setUserMessage] = useState('');
  const [botMessage, setBotMessage] = useState({ text: '', audio: '' });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const clearTimeoutRef = useRef();

  // Listen for VoiceInput events
  const handleVoiceResult = (text) => {
    setIsListening(false);
    setLiveTranscript('');
    handleSendMessage(text);
  };
  const handleVoiceListening = (listening) => setIsListening(listening);
  const handleVoiceTranscript = (t) => setLiveTranscript(t);

  // Auto-clear after 10s, but reset listening state immediately after bot response
  useEffect(() => {
    if (userMessage || botMessage.text) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = setTimeout(() => {
        setUserMessage('');
        setBotMessage({ text: '', audio: '' });
        setIsListening(false); // Reset listening state immediately after clear
        setLiveTranscript('');
      }, 10000);
    }
    return () => clearTimeout(clearTimeoutRef.current);
  }, [userMessage, botMessage]);

  // Reset listening state as soon as bot finishes responding
  useEffect(() => {
    if (botMessage.text) {
      setIsListening(false);
      setLiveTranscript('');
    }
  }, [botMessage.text]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setUserMessage(text);
    setBotMessage({ text: '', audio: '' });
    setInputText('');
    setIsLoading(true);
    try {
      const response = await askAssistant(text);
      setBotMessage({ text: response.answer, audio: response.audio });
    } catch (error) {
      setBotMessage({ text: 'Sorry, I encountered an error. Please try again.', audio: '' });
    }
    setIsLoading(false);
  };

  // Center dots/mic, move up when text is shown
  // Only show the center state if not listening and not after wakeup
  const showCenter = !userMessage && !botMessage.text && !isLoading && !isListening;
  const showListeningUI = showCenter || isListening || liveTranscript;

  // Always show the mic and listening UI at the center, but only animate/listen when isListening or liveTranscript is active
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-none shadow-none p-0" style={{ maxWidth: '100vw', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Mic/listening UI: center when showCenter, move up when not */}
      <div className={`flex flex-col items-center w-full transition-all duration-500 ${showCenter ? 'justify-center flex-1' : 'justify-start mt-2'}`} style={{ minHeight: showCenter ? '75vh' : 'auto' }}>
        <ListeningWave active={isListening} idle={!isListening && showCenter} />
        <button
          onClick={() => {
            if (!isListening && !isLoading) setIsListening(true);
          }}
          className={`mt-2 mb-2 p-4 rounded-full bg-blue-100 text-blue-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${isListening ? 'animate-pulse' : ''}`}
          style={{ pointerEvents: isLoading ? 'none' : 'auto', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          tabIndex={-1}
          aria-label="Mic"
        >
          <Mic size={40} />
        </button>
        {isListening && (
          <div className="text-blue-600 font-semibold mb-2 animate-pulse text-2xl">Listening...</div>
        )}
        {isListening && liveTranscript && (
          <div className="text-gray-700 text-2xl mb-2 w-full text-center bg-gray-100 rounded px-4 py-2">
            {liveTranscript}
          </div>
        )}
        <VoiceInput
          onResult={handleVoiceResult}
          disabled={isLoading}
          onListening={handleVoiceListening}
          onTranscript={handleVoiceTranscript}
        />
      </div>
      {/* Message area, scrollable if needed */}
      <div className="w-full px-4 flex flex-col flex-1 items-center justify-end pointer-events-none overflow-y-auto" style={{ maxWidth: '100vw', minHeight: 0 }}>
        {userMessage && (
          <div className="flex justify-end w-full mb-2">
            <div className="max-w-[80vw] rounded-2xl px-6 py-4 shadow-md text-2xl bg-blue-500 text-white">
              <p className="whitespace-pre-wrap break-words">{userMessage}</p>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-start w-full mb-2">
            <div className="bg-gray-100 text-gray-800 rounded-2xl px-6 py-4 shadow-md text-2xl">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        {botMessage.text && (
          <div className="flex justify-start w-full mb-2">
            <div className="max-w-[80vw] rounded-2xl px-6 py-4 shadow-md text-2xl bg-gray-100 text-gray-900">
              <p className="whitespace-pre-wrap break-words">{botMessage.text}</p>
              {botMessage.audio && <AudioPlayer audioSrc={botMessage.audio} />}
            </div>
          </div>
        )}
      </div>
      {/* Input bar always pinned to bottom */}
      <div className="w-full flex items-center gap-4 px-4 py-2 bg-white z-20" style={{ maxWidth: '100vw', borderTop: '1px solid #eee' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputText);
            }
          }}
          placeholder="Type your message..."
          className="text-gray-600 flex-1 p-5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl bg-white shadow"
          disabled={isLoading}
          style={{ minWidth: 0 }}
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={isLoading || !inputText.trim()}
          className="px-10 py-5 bg-blue-500 text-white rounded-2xl text-2xl font-semibold shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}