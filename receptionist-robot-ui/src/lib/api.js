export async function askAssistant(message) {
  const res = await fetch("http://192.168.29.200:5000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json(); // { answer, audio }
}
