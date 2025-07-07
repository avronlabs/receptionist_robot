import serial
import time
from motion.command_mapper import map_voice_to_serial
from speech.stt import transcribe_audio_file

class ArduinoController:
    def __init__(self, port='/dev/ttyUSB0', baudrate=9600, timeout=2):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.ser = None
        self.open_port()

    def open_port(self):
        if self.ser is None or not (self.ser.is_open if self.ser else False):
            print(f"[ArduinoController] Trying to open serial port: {self.port} at {self.baudrate} baud.")
            try:
                self.ser = serial.Serial(self.port, self.baudrate, timeout=self.timeout)
                time.sleep(2)  # Allow Arduino to reset
                print(f"[ArduinoController] Serial port {self.port} opened successfully.")
            except Exception as e:
                print(f"[ArduinoController] Could not open serial port {self.port}: {e}")
                self.ser = None

    def send_command(self, command):
        self.open_port()
        if self.ser and self.ser.is_open:
            try:
                self.ser.write((command + '\n').encode())
                print(f"[ArduinoController] Sent: {command}")
            except Exception as e:
                print(f"[ArduinoController] Error sending command: {e}")
                raise  # Propagate error to caller
        else:
            print(f"[ArduinoController] Serial port not open on {self.port}. SERIAL NOT SENT.")
            raise RuntimeError(f"Serial port not open on {self.port}")
# Create a global Arduino controller instance
arduino = ArduinoController()

def handle_voice_command(text):
    mapped_command = map_voice_to_serial(text)
    if mapped_command:
        try:
            arduino.send_command(mapped_command)
            return mapped_command
        except Exception as e:
            print(f"[Serial Control] Error sending command: {e}")
            return "__SERIAL_ERROR__"
    else:
        print(f"[Serial Control] No valid command found for text: '{text}', mapped_command: '{mapped_command}'")
        return None
