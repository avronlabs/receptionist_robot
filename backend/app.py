from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
from speech import tts  # ✅ Assuming tts.py is inside /speech

app = Flask(__name__)
CORS(app)

QNA_PATH = os.path.join(os.path.dirname(__file__), '../backend/qna_store.json')
AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'static/audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load QnA store
with open(QNA_PATH, 'r') as f:
    qna_store = json.load(f)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    message = data.get('message', '').strip().lower()
    answer = qna_store.get(message, "Sorry, I don't know the answer to that.")

    # Generate unique filename for each response
    audio_filename = f"response_{uuid.uuid4().hex}.mp3"
    audio_path = os.path.join(AUDIO_DIR, audio_filename)

    # Use TTS to generate audio
    tts.text_to_speech(answer, audio_path)  # Assumes tts.py has text_to_speech(text, out_path)

    audio_url = f"http://localhost:5000/static/audio/{audio_filename}"
    return jsonify({"answer": answer, "audio": audio_url})

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)