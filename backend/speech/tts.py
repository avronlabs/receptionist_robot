import os
import subprocess
from pydub import AudioSegment

# Set the path to the Piper executable and model
PIPER_PATH = os.environ.get(
    "PIPER_PATH",
    os.path.join(os.path.dirname(__file__), "piper-desktop/piper")
)  # Looks for piper_bin in the same directory as this script
PIPER_MODEL = os.environ.get(
    "PIPER_MODEL",
    # os.path.join(os.path.dirname(__file__), "piper-desktop/en_US-ljspeech-high.onnx")
    os.path.join(os.path.dirname(__file__), "piper-models/en_US-lessac-medium.onnx")
)


def text_to_speech(text, filename, keep_last_n=10):
    """
    Convert text to speech using Piper and save as an MP3 file.
    Keeps only the last `keep_last_n` audio files in the output directory.
    Args:
        text (str): The text to convert.
        filename (str): The output MP3 file path.
        keep_last_n (int): Number of audio files to keep in the output directory.
    """
    tmp_wav = filename.replace('.mp3', '.wav')
    command = [
        PIPER_PATH,
        "--model", PIPER_MODEL,
        "--output_file", tmp_wav
    ]
    subprocess.run(command, input=text.strip() + '\n', text=True, check=True)
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
    text_to_speech("Hello, this is Piper TTS speaking!", "test_output.mp3")
    print("Test audio saved as test_output.mp3")