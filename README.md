# Receptionist Robot - Installation Guide

## Prerequisites
- Python 3.8 or higher
- Node.js v18.18.0 or higher (required for frontend; older versions will NOT work)
- npm (comes with Node.js)
- Git

> **If you see errors like `EBADENGINE` or `Unexpected token '.'` during `npm install`, your Node.js is too old. See below for upgrade instructions.**

## 1. Clone the Repository
```bash
git clone https://github.com/avronlabs/receptionist_robot.git
cd receptionist_robot
```

## 2. Set Up Python Environment
```bash
python3 -m venv robot_env
source robot_env/bin/activate
```

## 2.1. (Raspberry Pi/Linux) Install Required System Packages
Before installing Python dependencies, run:

```bash
sudo apt-get update
sudo apt-get install python3-dev python3.10-venv libportaudio2 libasound-dev portaudio19-dev build-essential
```

## 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

## 4. Install System Dependencies
- **ffmpeg** (required for audio processing):
  ```bash
  sudo apt-get install ffmpeg
  ```

## 5. Set Up Frontend
### Ensure Correct Node.js Version
Check your Node.js version:
```bash
node -v
```
You must see `v18.18.0` or newer. If not, upgrade Node.js:

#### Upgrade Node.js on Ubuntu/Linux
```bash
# Remove old Node.js
sudo apt-get remove nodejs

# Install Node.js 20.x (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or for Node.js 18.x (also supported)
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt-get install -y nodejs

# Verify
node -v
npm -v
```

#### Clean up old dependencies (if upgrading)
```bash
cd receptionist-robot-ui
rm -rf node_modules package-lock.json
```

#### Install frontend dependencies
```bash
cd receptionist-robot-ui
npm install
```
## 6. Download Piper models (required for TTS)
After cloning the repository, download the Piper model files (not included in git):

```bash
cd backend/speech/piper-models

wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US-amy-medium/en_US-amy-medium.onnx

wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US-amy-medium/en_US-amy-medium.onnx.json
```

### Or download other models as needed
- The above commands download the `amy` voice model. You can choose other voices from the [Piper models page](https://huggingface.co/rhasspy/piper-voices).
- Place the downloaded `.onnx` and `.onnx.json` files in the `backend/speech/piper-models` directory.
- Do **not** commit `.onnx` or `.onnx.json` model files to git. They are ignored via `.gitignore`.
- You may use a different model if you wish; update the path in `tts.py` accordingly.

## 6.1. Set the Piper Executable Path
Depending on your system, you must set the correct Piper executable in `backend/speech/tts.py`:

- **For Desktop Linux (x86_64/AMD64):**
  - Use: `piper-desktop/piper`
- **For Raspberry Pi (ARM64):**
  - Use: `piper-rpi/piper`

You can set this by editing the `PIPER_PATH` in `tts.py` or by setting the `PIPER_PATH` environment variable before running the backend:

```bash
# Example for Raspberry Pi
export PIPER_PATH=backend/speech/piper-rpi/piper
# Example for Desktop Linux
export PIPER_PATH=backend/speech/piper-desktop/piper
```

If you do not set the environment variable, make sure the default in `tts.py` matches your system.



## 7. Running the Application
- **Recommended:** Use the provided script to start all servers:
  ```bash
  ./start_receptionist_robot.sh
  ```
- **Or launch servers individually:**
  - **Backend (Flask API):**
    ```bash
    source robot_env/bin/activate
    cd backend
    flask run --host=0.0.0.0 --port=5050
    ```
  - **Wake Word Listener (Vosk WebSocket):**
    ```bash
    source robot_env/bin/activate
    cd backend
    python wakeword_listener.py
    ```
  - **Frontend (Next.js):**
    ```bash
    cd receptionist-robot-ui
    npm run dev
    # or for production: npm run build && npm start
    ```
- The backend (Flask), wake word listener, and frontend (Next.js) will start. Your browser should open automatically if using the script.

## 8. Notes
- The first time you use Whisper or TTS, it may download models (requires internet).
- If you move `requirements.txt` to the main directory, always install dependencies from there.
- For Raspberry Pi, ensure you have enough RAM (2GB+ recommended for TTS).
- If running on different machines, update API/WebSocket URLs in the frontend config files.
- **If you see an error like:**

  ```
  OSError: [Errno 8] Exec format error: '/home/rpi/receptionist_robot/backend/speech/piper-desktop/piper'
  ```
  This means the Piper binary is not compatible with your system architecture. Download the correct Piper binary for your platform:
  - For Raspberry Pi (ARM64): [piper_arm64.tar.gz](https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz)
  - For Desktop Linux (AMD64): [piper_amd64.tar.gz](https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz)

  Extract the archive and place the `piper` binary in `backend/speech/piper-desktop/`.

## 9. Updating the Code
- To pull the latest changes:
  ```bash
  git pull origin master  # or main, depending on your branch
  ```

For troubleshooting or advanced configuration, see the project wiki or contact the maintainer.

