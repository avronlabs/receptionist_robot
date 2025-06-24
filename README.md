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
- Use the provided script to start both backend and frontend:
  ```bash
  ./start_receptionist_robot.sh
  ```
- The backend (Flask) and frontend (Next.js) will start, and your browser should open automatically.

## 7. Notes
- The first time you use Coqui TTS, it will download the model (requires internet).
- If you move `requirements.txt` to the main directory, always install dependencies from there.
- For Raspberry Pi, ensure you have enough RAM (2GB+ recommended for TTS).

## 8. Updating the Code
- To pull the latest changes:
  ```bash
  git pull origin master  # or main, depending on your branch
  ```

---

For troubleshooting or advanced configuration, see the project wiki or contact the maintainer.

