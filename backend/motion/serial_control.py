import serial
import time
from motion.command_mapper import map_voice_to_serial
from speech.stt import transcribe_audio_file

class ArduinoController:
    def __init__(self, port='/dev/ttyACM0', baudrate=9600, timeout=2):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        try:
            self.ser = serial.Serial(port, baudrate, timeout=timeout)
            time.sleep(2)  # Wait for Arduino to reset
        except Exception as e:
            print(f"[ArduinoController] Could not open serial port: {e}")
            self.ser = None

    def send_command(self, command):
        if self.ser and self.ser.is_open:
            try:
                self.ser.write((command + '\n').encode())
                print(f"[ArduinoController] Sent: {command}")
            except Exception as e:
                print(f"[ArduinoController] Error sending command: {e}")
        else:
            print("[ArduinoController] Serial port not open.")

arduino = ArduinoController()

def handle_voice_command(text):
    mapped_command = map_voice_to_serial(text)
    if mapped_command:
        print(f"[Serial Control] Mapped command: {mapped_command}")
        arduino.send_command(mapped_command)
        return mapped_command
    else:
        print(f"[Serial Control] No valid command found for text: '{text}'")
        return None