import tempfile
import subprocess
import soundfile as sf
from vosk import Model, KaldiRecognizer
import numpy as np
import json as _json
import os

# Load Vosk model once at import
VOSK_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../vosk-model')
vosk_model = Model(VOSK_MODEL_PATH)

def transcribe_audio_file(audio_bytes, input_ext='.webm'):
    """
    Accepts audio bytes (webm/ogg/wav), converts to wav, and returns transcript using Vosk.
    """
    # Save uploaded audio to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=input_ext) as tmp_in:
        tmp_in.write(audio_bytes)
        tmp_in.flush()
        tmp_in_path = tmp_in.name
    # Convert to WAV using ffmpeg
    tmp_out_path = tmp_in_path.replace(input_ext, '.wav')
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', tmp_in_path,
            '-ar', '16000', '-ac', '1', '-f', 'wav', tmp_out_path
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception as e:
        return {'error': f'ffmpeg conversion failed: {e}'}
    # Now read the WAV file with soundfile
    try:
        data, samplerate = sf.read(tmp_out_path)
    except Exception as e:
        return {'error': f'Could not read audio: {e}'}
    # Vosk expects mono PCM 16kHz
    if len(data.shape) > 1:
        data = data[:,0]  # Take first channel if stereo
    rec = KaldiRecognizer(vosk_model, samplerate)
    rec.AcceptWaveform((data * 32767).astype(np.int16).tobytes())
    result = rec.Result()
    text = _json.loads(result).get('text', '')
    return {'text': text}
