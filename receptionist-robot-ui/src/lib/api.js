export async function askAssistant(message) {
  const res = await fetch("http://localhost:5050/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json(); // { answer, audio }
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');
  const res = await fetch('http://localhost:5050/api/transcribe', {
    method: 'POST',
    body: formData,
  });
  return await res.json(); // { text }
}
