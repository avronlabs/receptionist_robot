import vosk
import pyaudio
import asyncio
import websockets
import threading
import socket
import json
import os
import time  # <-- Added import

WAKE_WORD = "alexa"
VOSK_MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model")

clients = set()

async def ws_handler(websocket):
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)

def start_ws_server():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"[WakeWord] WebSocket server running at ws://{local_ip}:8765/")
    async def ws_main():
        async with websockets.serve(ws_handler, "0.0.0.0", 8765):
            await asyncio.Future()
    asyncio.run(ws_main())

ws_thread = threading.Thread(target=start_ws_server, daemon=True)
ws_thread.start()

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
    frames_per_buffer=512  # Lower buffer for faster response
)

print("[WakeWord] Listening for wake word using Vosk...")

loop = asyncio.new_event_loop()

async def notify_clients_async():
    if clients:
        await asyncio.gather(*[client.send("wakeword") for client in clients])

def notify_clients():
    asyncio.run_coroutine_threadsafe(notify_clients_async(), loop)

loop_thread = threading.Thread(target=loop.run_forever, daemon=True)
loop_thread.start()

last_trigger_time = 0
DEBOUNCE_SECONDS = 2  # Only trigger once every 2 seconds

try:
    while True:
        data = stream.read(512, exception_on_overflow=False)
        now = time.time()
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text = result.get("text", "").lower()
            if WAKE_WORD in text and now - last_trigger_time > DEBOUNCE_SECONDS:
                print("Wake word detected!")
                notify_clients()
                last_trigger_time = now
        else:
            partial = json.loads(rec.PartialResult())
            partial_text = partial.get("partial", "").lower()
            if WAKE_WORD in partial_text and now - last_trigger_time > DEBOUNCE_SECONDS:
                print("Wake word (partial) detected!")
                notify_clients()
                last_trigger_time = now
except KeyboardInterrupt:
    print("Stopping wake word listener.")
finally:
    stream.stop_stream()
    stream.close()
    pa.terminate()
    loop.call_soon_threadsafe(loop.stop)