# command_mapper.py

COMMAND_MAP = {
    "forward": "FORWARD",
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
valid_commands = [
        "FORWARD", "BACKWARD", "LEFT", "RIGHT", "STOP",
        "LED_ON", "LED_OFF", "ROTATE_LEFT", "ROTATE_RIGHT", "RESET"
    ]
    
def map_voice_to_serial(text):
    cleaned = text.lower().strip()
    if text in valid_commands:
        return text
    # print(f"[Command Mapper] Processing text: '{cleaned}'")
    # Only process if a movement-related word is present
    if any(move_word in cleaned for move_word in ["move", "go", "turn", "stop"]):
        for phrase, command in COMMAND_MAP.items():
            if phrase in cleaned:
                # print(f"[Command Mapper] Matched phrase: '{phrase}' to command: '{command}'")
                return command
    return None
