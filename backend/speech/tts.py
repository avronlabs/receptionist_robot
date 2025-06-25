import os
from TTS.api import TTS
from pydub import AudioSegment

# Download and load the default English TTS model (first time only)
tts = TTS(model_name="tts_models/en/ljspeech/vits", progress_bar=False, gpu=False)

def text_to_speech(text, filename, keep_last_n=10):
    """
    Convert text to speech using Coqui TTS and save as an MP3 file.
    Keeps only the last `keep_last_n` audio files in the output directory.
    Args:
        text (str): The text to convert.
        filename (str): The output MP3 file path.
        keep_last_n (int): Number of audio files to keep in the output directory.
    """
    # Synthesize speech to a temporary WAV file
    tmp_wav = filename.replace('.mp3', '.wav')
    tts.tts_to_file(text=text, file_path=tmp_wav)
    # Convert WAV to MP3
    sound = AudioSegment.from_wav(tmp_wav)
    sound.export(filename, format="mp3")
    os.remove(tmp_wav)

    # --- Cleanup: keep only the last N audio files in the output directory ---
    out_dir = os.path.dirname(filename)
    audio_files = [f for f in os.listdir(out_dir) if f.endswith('.mp3')]
    audio_files_full = [os.path.join(out_dir, f) for f in audio_files]
    audio_files_full.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    for old_file in audio_files_full[keep_last_n:]:
        try:
            os.remove(old_file)
        except Exception as e:
            print(f"Warning: Could not delete old audio file {old_file}: {e}")

if __name__ == "__main__":
    # Test
    text_to_speech("Hello, this is Coqui TTS speaking!", "test_output.mp3")
    print("Test audio saved as test_output.mp3")