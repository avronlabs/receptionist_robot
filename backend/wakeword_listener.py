import vosk
import pyaudio
import asyncio
import websockets
import threading
import socket
import json
import os

WAKE_WORD = "alexa"
VOSK_MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model")

# WebSocket server globals
clients = set()

async def ws_handler(websocket):
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)

def start_ws_server():
    # Log the local IP address for WebSocket connection
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"[WakeWord] WebSocket server running at ws://{local_ip}:8765/")
    async def ws_main():
        async with websockets.serve(ws_handler, "0.0.0.0", 8765):
            await asyncio.Future()  # run forever
    asyncio.run(ws_main())

# Start WebSocket server in a background thread
ws_thread = threading.Thread(target=start_ws_server, daemon=True)
ws_thread.start()

# Wake word detection using Vosk
if not os.path.exists(VOSK_MODEL_PATH):
    raise FileNotFoundError(f"Vosk model not found at {VOSK_MODEL_PATH}")
model = vosk.Model(VOSK_MODEL_PATH)
rec = vosk.KaldiRecognizer(model, 16000)
pa = pyaudio.PyAudio()
stream = pa.open(
    rate=16000,
    channels=1,
    format=pyaudio.paInt16,
    input=True,
    frames_per_buffer=1024
)

print("[WakeWord] Listening for wake word using Vosk...")
try:
    while True:
        data = stream.read(1024, exception_on_overflow=False)
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text = result.get("text", "").lower()
            if WAKE_WORD in text:
                print("Wake word detected!")
                # Notify all connected WebSocket clients
                async def notify_clients():
                    await asyncio.gather(*[client.send("wakeword") for client in clients])
                asyncio.run(notify_clients())
except KeyboardInterrupt:
    print("Stopping wake word listener.")
finally:
    stream.stop_stream()
    stream.close()
    pa.terminate()
    # No explicit delete needed for vosk.Model
