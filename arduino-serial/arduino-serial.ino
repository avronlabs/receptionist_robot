void setup() {
  Serial.begin(9600);  // Baud rate matches your Python script
  Serial.println("NodeMCU Serial Receiver Ready");
}

void loop() {
  if (Serial.available()) {
    String incoming = Serial.readStringUntil('\n');  // Read until newline
    incoming.trim();  // Remove any trailing newline or spaces
    Serial.print("Received: ");
    Serial.println(incoming);
    // If you want to act on commands, you can add logic here:
    // if (incoming == "TURN_LEFT") { ... }
  }
}
