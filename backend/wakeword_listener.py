import pvporcupine
import pyaudio
import struct
import asyncio
import websockets
import threading
import socket

ACCESS_KEY = "mRUsrLGLMuHdFfA+AKleyeVe4eukNFSzVrl4/zL1OrSMUn8TwxaJCg=="  # Replace with your actual key

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

# Wake word detection
porcupine = pvporcupine.create(access_key=ACCESS_KEY, keywords=["alexa"], sensitivities=[0.7])
pa = pyaudio.PyAudio()
stream = pa.open(
    rate=porcupine.sample_rate,
    channels=1,
    format=pyaudio.paInt16,
    input=True,
    frames_per_buffer=porcupine.frame_length
)

print("[WakeWord] Listening for wake word...")
try:
    while True:
        pcm = stream.read(porcupine.frame_length, exception_on_overflow=False)
        pcm = struct.unpack_from("h" * porcupine.frame_length, pcm)
        keyword_index = porcupine.process(pcm)
        if keyword_index >= 0:
            print("Wake word detected!")
            # Notify all connected WebSocket clients
            async def notify_clients():
                await asyncio.gather(*[client.send("wakeword") for client in clients])
            asyncio.run(notify_clients())
            # Here you can trigger your STT pipeline or send a signal to your backend/frontend
except KeyboardInterrupt:
    print("Stopping wake word listener.")
finally:
    stream.stop_stream()
    stream.close()
    pa.terminate()
    porcupine.delete()
