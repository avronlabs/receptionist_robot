# Receptionist Robot – Project Description

## Overview
Receptionist Robot is a full-stack, voice-enabled assistant and robot control system for smart reception and front-desk environments. It features speech recognition, wake word detection, text-to-speech, Q&A, and manual robot control via a modern web interface. The system is modular, hardware-agnostic, and supports both desktop Linux and Raspberry Pi deployments.

---

## Features
- **Wake Word Detection:** Real-time wake word listening using Vosk and a WebSocket backend.
- **Speech-to-Text (STT):** Local, privacy-preserving speech recognition using Whisper.
- **Text-to-Speech (TTS):** High-quality voice responses using Piper, with support for multiple models and platforms.
- **Q&A and Command Handling:** JSON-based knowledge base for common questions and mapped robot commands.
- **Manual Motion Control:** Web UI with a 3x3 grid of intuitive buttons for direct robot control (forward, back, left, right, rotate, stop, etc.).
- **Audio Feedback:** All responses, including errors, are played back to the user in both chat and control interfaces.
- **Error Handling:** Friendly error messages and audio feedback if the robot is unreachable or a command fails.
- **Extensible UI:** Built with Next.js and React, featuring a dashboard, controls page, and settings page.
- **Arduino/NodeMCU Integration:** Serial communication for controlling a differential drive robot base.
- **Modular Backend:** Flask API with endpoints for chat, motion, transcription, and static audio serving.

---

## File Structure

```
receptionist_robot/
├── PROJECT_DESCRIPTION.md      # This file
├── README.md                   # Installation and usage instructions
├── requirements.txt            # Python dependencies for backend
├── start_receptionist_robot.sh # Script to launch all services
├── arduino-serial/
│   └── arduino-serial.ino      # Arduino/NodeMCU firmware for diff drive base
├── backend/
│   ├── app.py                  # Main Flask API server
│   ├── qna_store.json          # Q&A pairs for the assistant
│   ├── motion_res.json         # Motion command responses
│   ├── wakeword_listener.py    # Wake word WebSocket server
│   ├── motion/
│   │   ├── serial_control.py   # Serial communication and command handler
│   │   ├── command_mapper.py   # Maps voice/UI commands to serial commands
│   │   └── __init__.py
│   ├── speech/
│   │   ├── stt.py              # Speech-to-text logic (Whisper)
│   │   ├── tts.py              # Text-to-speech logic (Piper)
│   │   ├── piper-desktop/      # Piper binaries for desktop Linux
│   │   ├── piper-rpi/          # Piper binaries for Raspberry Pi
│   │   └── piper-models/       # Downloaded Piper voice models
│   ├── static/
│   │   └── audio/              # Generated audio files
│   └── vosk-model/             # Vosk speech recognition models
├── receptionist-robot-ui/
│   ├── public/                 # Static assets (SVGs, audio, etc.)
│   └── src/
│       ├── components/
│       │   ├── AudioPlayer.jsx
│       │   ├── ChatBox.jsx
│       │   ├── MotionControls.jsx
│       │   ├── NavBar.jsx
│       │   └── VoiceInput.jsx
│       ├── lib/
│       │   └── api.js          # API calls to backend
│       ├── pages/
│       │   ├── index.jsx       # Dashboard (chat/voice)
│       │   ├── controls.jsx    # Manual motion controls
│       │   └── settings.jsx    # Settings (placeholder)
│       └── styles/             # CSS/Styling
├── robot_env/                  # Python virtual environment (not in version control)
└── .gitignore
```

---

## Usage
- Follow the instructions in `README.md` to set up the environment, install dependencies, and run the application.
- Use the provided script (`start_receptionist_robot.sh`) to launch all services, or start backend, frontend, and wake word listener individually.
- The web UI provides both a chatbot/voice dashboard and a manual controls page for the robot.
- The Arduino/NodeMCU firmware listens for serial commands and drives a differential drive base accordingly.

---

## Hardware Integration
- The Arduino/NodeMCU code receives commands like `FORWARD`, `BACKWARD`, `LEFT`, `RIGHT`, `STOP`, `ROTATE_LEFT`, and `ROTATE_RIGHT` over serial and controls the motors via H-bridge or motor driver pins.
- Pin assignments can be customized in `arduino-serial.ino` to match your hardware.

---

## Extensibility
- **Q&A and motion responses** are easily updated via JSON files.
- **Speech models** and **TTS voices** can be swapped or expanded by adding new models to the appropriate directories.
- **UI components** are modular and can be extended for new features or hardware.

---

## License
See the repository for license details.
