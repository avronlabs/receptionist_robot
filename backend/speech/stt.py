import tempfile
import os
import whisper

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
    # Save uploaded audio to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=input_ext) as tmp_in:
        tmp_in.write(audio_bytes)
        tmp_in.flush()
        tmp_in_path = tmp_in.name
    try:
        model = whisper.load_model(model_size)
        result = model.transcribe(tmp_in_path)
        text = result.get('text', '').strip()
        os.remove(tmp_in_path)
        return {'text': text}
    except Exception as e:
        return {'error': f'Whisper transcription failed: {e}'}
