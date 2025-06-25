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

# Install Node.js 18.x (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or for Node.js 20.x (also supported)
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
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

