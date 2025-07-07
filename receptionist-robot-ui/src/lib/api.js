export async function askAssistant(message) {
  const res = await fetch("http://localhost:5050/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json(); // { answer, audio }
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  // Use the correct extension based on the blob type
  let ext = 'webm';
  if (audioBlob.type === 'audio/wav') ext = 'wav';
  else if (audioBlob.type === 'audio/ogg') ext = 'ogg';
  formData.append('audio', audioBlob, `audio.${ext}`);
  const res = await fetch('http://localhost:5050/api/transcribe', {
    method: 'POST',
    body: formData,
  });
  // Now returns { text, serial_result } or { error }
  return await res.json();
}

export async function sendMotionCommand(command) {
  if (!command) return;
  const res = await fetch('http://localhost:5050/api/motion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  return await res.json(); // { status, message }
}
