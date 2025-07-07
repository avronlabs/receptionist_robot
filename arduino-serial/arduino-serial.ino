// Pin definitions for left and right motors
const int LEFT_MOTOR_FORWARD = 2;
const int LEFT_MOTOR_BACKWARD = 3;
const int RIGHT_MOTOR_FORWARD = 4;
const int RIGHT_MOTOR_BACKWARD = 5;

void setup()
{
  Serial.begin(9600); // Baud rate matches your Python script
  Serial.println("Legs Serial Receiver Ready");
  pinMode(LEFT_MOTOR_FORWARD, OUTPUT);
  pinMode(LEFT_MOTOR_BACKWARD, OUTPUT);
  pinMode(RIGHT_MOTOR_FORWARD, OUTPUT);
  pinMode(RIGHT_MOTOR_BACKWARD, OUTPUT);
  stopMotors();
}

void stopMotors()
{
  digitalWrite(LEFT_MOTOR_FORWARD, LOW);
  digitalWrite(LEFT_MOTOR_BACKWARD, LOW);
  digitalWrite(RIGHT_MOTOR_FORWARD, LOW);
  digitalWrite(RIGHT_MOTOR_BACKWARD, LOW);
}

void moveForward()
{
  digitalWrite(LEFT_MOTOR_FORWARD, HIGH);
  digitalWrite(LEFT_MOTOR_BACKWARD, LOW);
  digitalWrite(RIGHT_MOTOR_FORWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_BACKWARD, LOW);
}

void moveBackward()
{
  digitalWrite(LEFT_MOTOR_FORWARD, LOW);
  digitalWrite(LEFT_MOTOR_BACKWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_FORWARD, LOW);
  digitalWrite(RIGHT_MOTOR_BACKWARD, HIGH);
}

void turnLeft()
{
  digitalWrite(LEFT_MOTOR_FORWARD, LOW);
  digitalWrite(LEFT_MOTOR_BACKWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_FORWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_BACKWARD, LOW);
}

void turnRight()
{
  digitalWrite(LEFT_MOTOR_FORWARD, HIGH);
  digitalWrite(LEFT_MOTOR_BACKWARD, LOW);
  digitalWrite(RIGHT_MOTOR_FORWARD, LOW);
  digitalWrite(RIGHT_MOTOR_BACKWARD, HIGH);
}

void rotateLeft()
{
  digitalWrite(LEFT_MOTOR_FORWARD, LOW);
  digitalWrite(LEFT_MOTOR_BACKWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_FORWARD, HIGH);
  digitalWrite(RIGHT_MOTOR_BACKWARD, LOW);
}

void rotateRight()
{
  digitalWrite(LEFT_MOTOR_FORWARD, HIGH);
  digitalWrite(LEFT_MOTOR_BACKWARD, LOW);
  digitalWrite(RIGHT_MOTOR_FORWARD, LOW);
  digitalWrite(RIGHT_MOTOR_BACKWARD, HIGH);
}

void loop()
{
  if (Serial.available())
  {
    String incoming = Serial.readStringUntil('\n'); // Read until newline
    incoming.trim();                                // Remove any trailing newline or spaces
    Serial.print("Received: ");
    Serial.println(incoming);
    if (incoming == "FORWARD")
      moveForward();
    else if (incoming == "BACKWARD")
      moveBackward();
    else if (incoming == "LEFT")
      turnLeft();
    else if (incoming == "RIGHT")
      turnRight();
    else if (incoming == "STOP")
      stopMotors();
    else if (incoming == "ROTATE_LEFT")
      rotateLeft();
    else if (incoming == "ROTATE_RIGHT")
      rotateRight();
    else
      stopMotors(); // Unknown command, stop for safety
  }
}
