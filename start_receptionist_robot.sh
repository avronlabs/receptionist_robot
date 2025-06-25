#!/bin/bash
# Receptionist Robot launcher script (hybrid browser version)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill any process using ports 5050 (backend), 4000 (frontend), or 8765 (wakeword)
echo "Cleaning up existing processes on ports 5050, 4000, and 8765..."
sudo kill -9 $(sudo lsof -t -i:5050) 2>/dev/null
sudo kill -9 $(sudo lsof -t -i:4000) 2>/dev/null
sudo kill -9 $(sudo lsof -t -i:8765) 2>/dev/null

# Activate Python virtual environment and start backend
source "$SCRIPT_DIR/robot_env/bin/activate"
cd "$SCRIPT_DIR/backend"
flask run --host=0.0.0.0 --port=5050 &
BACKEND_PID=$!

# Start wakeword listener (WebSocket server)
python wakeword_listener.py &
WAKEWORD_PID=$!

cd "$SCRIPT_DIR/receptionist-robot-ui"

# Start React frontend (Next.js dev server)
npm run dev &
FRONTEND_PID=$!

# Wait a few seconds for frontend to start, then open in browser
sleep 5
xdg-open http://localhost:4000 &

# Wait for all processes to finish
wait $BACKEND_PID $FRONTEND_PID $WAKEWORD_PID
