import { useState, useEffect, useRef } from 'react';

export default function AudioPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayFailed, setAutoPlayFailed] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    // Try to auto-play when src changes
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setAutoPlayFailed(false);
      })
      .catch(error => {
        setAutoPlayFailed(true);
        setIsPlaying(false);
        console.warn('Auto-play failed:', error);
      });
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setAutoPlayFailed(false);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={togglePlay}
        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <audio ref={audioRef} src={audioSrc} />
      {autoPlayFailed && (
        <span className="text-xs text-gray-500 ml-2">Tap play to hear the response</span>
      )}
    </div>
  );
}