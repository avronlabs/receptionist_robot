import pyttsx3
import tempfile
import os
from pydub import AudioSegment

def text_to_speech(text, filename, voice_index=3, rate=150, volume=1.0):
    """
    Convert text to speech and save as an MP3 file with improved clarity.
    Args:
        text (str): The text to convert.
        filename (str): The output MP3 file path.
        voice_index (int): Index of the voice to use (default 0).
        rate (int): Speech rate (default 150).
        volume (float): Volume (0.0 to 1.0, default 1.0).
    """
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    if 0 <= voice_index < len(voices):
        engine.setProperty('voice', voices[voice_index].id)
    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)

    # Save to a temporary WAV file first
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_wav:
        tmp_wav_path = tmp_wav.name
    engine.save_to_file(text, tmp_wav_path)
    engine.runAndWait()
    # Convert WAV to MP3
    sound = AudioSegment.from_wav(tmp_wav_path)
    sound.export(filename, format="mp3")
    os.remove(tmp_wav_path)

# Helper to list available voices
if __name__ == "__main__":
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    for idx, voice in enumerate(voices):
        print(f"{idx}: {voice.name} ({voice.languages})")