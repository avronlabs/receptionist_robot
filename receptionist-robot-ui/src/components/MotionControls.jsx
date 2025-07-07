import { useState } from 'react';
import { ArrowUp, ArrowDown, RefreshCcw, RefreshCw, ArrowLeft, ArrowRight, Ban } from 'lucide-react';
import { sendMotionCommand } from '../lib/api';
import AudioPlayer from './AudioPlayer';

const motions = [
    [
        { label: <RefreshCcw size={72} strokeWidth={3} />, command: 'ROTATE_LEFT', aria: 'Rotate Counterclockwise' },
        { label: <ArrowUp size={72} strokeWidth={3} />, command: 'FORWARD', aria: 'Forward' },
        { label: <RefreshCw size={72} strokeWidth={3} />, command: 'ROTATE_RIGHT', aria: 'Rotate Clockwise' },
    ],
    [
        { label: <ArrowLeft size={72} strokeWidth={3} />, command: 'LEFT', aria: 'Left' },
        { label: <Ban size={72} strokeWidth={3} />, command: 'STOP', aria: 'Stop' },
        { label: <ArrowRight size={72} strokeWidth={3} />, command: 'RIGHT', aria: 'Right' },
    ],
    [
        { label: '', command: '', aria: '' },
        { label: <ArrowDown size={72} strokeWidth={3} />, command: 'BACKWARD', aria: 'Back' },
        { label: '', command: '', aria: '' },
    ],
];

export default function MotionControls() {
    const [audioSrc, setAudioSrc] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleMotion = async (command) => {
        const res = await sendMotionCommand(command);
        setStatusMsg(res.message || '');
        if (res.audio) {
            setAudioSrc(res.audio);
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 5000); // Hide after 5s
        } else {
            setAudioSrc(null);
            setShowPopup(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full relative">
            {motions.map((row, i) => (
                <div key={i} className="flex gap-2">
                    {row.map((btn, j) => (
                        <button
                            key={j}
                            onClick={() => btn.command && handleMotion(btn.command)}
                            aria-label={btn.aria}
                            className={`w-48 h-48 flex items-center justify-center rounded-lg shadow text-xl font-semibold
                            ${!btn.command ? 'opacity-0 pointer-events-none' : ''}
                            ${btn.command === 'STOP' ? 'bg-red-500 hover:bg-red-800' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            ))}
            {/* Popup for audio and status */}
            {showPopup && (
                <div className="fixed top-40 right-8 z-50 bg-white border border-gray-300 shadow-xl rounded-xl p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                    {statusMsg && ( 
                        <div className="mb-2 text-xl text-gray-800 text-center">{statusMsg}</div>
                    )}
                    {audioSrc && <AudioPlayer audioSrc={audioSrc} />}
                </div>
            )}
        </div>
    );
}
