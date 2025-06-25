import tempfile
import os
import whisper
from pydub import AudioSegment, effects
import io

def preprocess_audio(audio_bytes, input_ext='.webm'):
    # Load audio from bytes
    fmt = input_ext.replace('.', '')
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=fmt)
    # Convert to mono
    audio = audio.set_channels(1)
    # Set frame rate (sample rate)
    audio = audio.set_frame_rate(16000)
    # Normalize volume
    audio = effects.normalize(audio)
    # Trim silence (optional, can adjust silence_thresh)
    audio = audio.strip_silence(silence_len=300, silence_thresh=-40)
    # Export back to bytes (wav is best for Whisper)
    out_io = io.BytesIO()
    audio.export(out_io, format='wav')
    return out_io.getvalue()

def transcribe_audio_file(audio_bytes, input_ext='.webm', model_size='base'):
    """
    Accepts audio bytes (webm/ogg/wav), saves to temp file, and returns transcript using Whisper.
    Args:
        audio_bytes: Raw audio file bytes
        input_ext: File extension (default .webm)
        model_size: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
    Returns:
        dict: {'text': transcript}
    """
    # Preprocess audio
    audio_bytes = preprocess_audio(audio_bytes, input_ext)
    # Save preprocessed audio to a temp wav file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_in:
        tmp_in.write(audio_bytes)
        tmp_in.flush()
        tmp_in_path = tmp_in.name
    try:
        model = whisper.load_model(model_size)
        result = model.transcribe(tmp_in_path, language='en')
        text = result.get('text', '').strip()
        os.remove(tmp_in_path)
        return {'text': text}
    except Exception as e:
        return {'error': f'Whisper transcription failed: {e}'}
