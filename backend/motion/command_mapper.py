# command_mapper.py

COMMAND_MAP = {
    "move forward": "FORWARD",
    "go forward": "FORWARD",
    "move backward": "BACKWARD",
    "go back": "BACKWARD",
    "turn left": "LEFT",
    "turn right": "RIGHT",
    "stop": "STOP",
    "lights on": "LED_ON",
    "lights off": "LED_OFF"
}

def map_voice_to_serial(text):
    cleaned = text.lower().strip()
    return COMMAND_MAP.get(cleaned, None)
