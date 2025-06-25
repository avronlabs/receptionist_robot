# Receptionist Robot - Installation Guide

## Prerequisites
- Python 3.8 or higher
- Node.js and npm (for frontend)
- Git

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
```bash
cd receptionist-robot-ui
npm install
```

## 6. Running the Application
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
  - **Wake Word Listener (Porcupine WebSocket):**
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

## 7. Notes
- The first time you use Coqui TTS, it will download the model (requires internet).
- If you move `requirements.txt` to the main directory, always install dependencies from there.
- For Raspberry Pi, ensure you have enough RAM (2GB+ recommended for TTS).
- If running on different machines, update API/WebSocket URLs in the frontend config files.

## 8. Updating the Code
- To pull the latest changes:
  ```bash
  git pull origin master  # or main, depending on your branch
  ```

---

For troubleshooting or advanced configuration, see the project wiki or contact the maintainer.

