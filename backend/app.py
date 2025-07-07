from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
import re
from speech import tts  # ✅ Assuming tts.py is inside /speech

from speech.stt import transcribe_audio_file
from motion.serial_control import handle_voice_command
import warnings
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

app = Flask(__name__)
CORS(app)

QNA_PATH = os.path.join(os.path.dirname(__file__), '../backend/qna_store.json')
MOTION_RES_PATH = os.path.join(os.path.dirname(__file__), '../backend/motion_res.json')

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'static/audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load QnA store
with open(QNA_PATH, 'r') as f:
    qna_store = json.load(f)

# Load motion response
with open(MOTION_RES_PATH, 'r') as f:
    MOTION_RES = json.load(f)

def preprocess_message(message):
    # Remove wake word (alexa) if present at the start
    message = message.strip().lower()
    message = re.sub(r'^alexa[\s,]+', '', message)
    # Remove punctuation at the end
    message = message.rstrip(' .!?')
    return message

@app.route('/api/ask', methods=['POST'])
def ask():
    data = request.get_json()
    message = data.get('message', '').strip().lower()
    processed_message = preprocess_message(message)
    serial_result = handle_voice_command(processed_message)
    if serial_result == "__SERIAL_ERROR__":
        # Generate TTS for error
        answer = "Sorry, I couldn't talk to my legs."
    elif serial_result:
        answer = MOTION_RES.get(serial_result, "Sorry, I don't know the answer to that.")
        print(f"/ask: Processed message: {processed_message}, Serial command result: {serial_result}")
    else:
        answer = qna_store.get(processed_message, "Sorry, I don't know the answer to that.")

    # Generate unique filename for each response
    audio_filename = f"response_{uuid.uuid4().hex}.mp3"
    audio_path = os.path.join(AUDIO_DIR, audio_filename)

    # Use TTS to generate audio
    tts.text_to_speech(answer, audio_path)  # Assumes tts.py has text_to_speech(text, out_path)

    audio_url = f"http://localhost:5050/static/audio/{audio_filename}"
    return jsonify({"answer": answer, "audio": audio_url, "serial_result": serial_result})

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        print("No audio file in request.files")
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']
    print("Received audio file:", audio_file.filename, audio_file.content_type)
    audio_bytes = audio_file.read()
    result = transcribe_audio_file(audio_bytes, input_ext='.webm')
    if 'error' in result:
        print("Transcription error:", result['error'])
        return jsonify({'error': result['error']}), 400
    text = result['text']
    print(f"/api/transcribe: Transcribed text: {text}")
    return jsonify({'text': text})

@app.route('/api/motion', methods=['POST'])
def motion_command():
    data = request.get_json()
    command = data.get('command', '').strip().upper()
    if not command:
        return jsonify({'status': 'error', 'message': 'No command provided'}), 400

    # Handle the motion command
    serial_result = handle_voice_command(command)
    if serial_result == "__SERIAL_ERROR__":
        # Generate TTS for error
        error_text = "Sorry, I couldn't talk to my legs."
        audio_filename = f"response_{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        tts.text_to_speech(error_text, audio_path)
        audio_url = f"http://localhost:5050/static/audio/{audio_filename}"
        return jsonify({'status': 'error', 'message': error_text, 'audio': audio_url}), 500
    elif serial_result:
        response = MOTION_RES.get(serial_result, "Unknown command")
        audio_filename = f"response_{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        tts.text_to_speech(response, audio_path)
        audio_url = f"http://localhost:5050/static/audio/{audio_filename}"
        print(f"/api/motion: Command: {command}, Serial result: {serial_result}")
        return jsonify({'status': 'success', 'message': response, 'audio': audio_url}), 200
    else:
        # Generate TTS for error
        error_text = "Sorry, I couldn't talk to my legs."
        audio_filename = f"response_{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        tts.text_to_speech(error_text, audio_path)
        audio_url = f"http://localhost:5050/static/audio/{audio_filename}"
        return jsonify({'status': 'error', 'message': error_text, 'audio': audio_url}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)