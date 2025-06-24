#!/bin/bash
# Receptionist Robot launcher script (hybrid browser version)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate Python virtual environment and start backend
source "$SCRIPT_DIR/robot_env/bin/activate"
cd "$SCRIPT_DIR/backend"
flask run --host=0.0.0.0 --port=5050 &
BACKEND_PID=$!
cd "$SCRIPT_DIR/receptionist-robot-ui"

# Start React frontend (Next.js dev server)
npm run dev &
FRONTEND_PID=$!

# Wait a few seconds for frontend to start, then open in browser
sleep 5
xdg-open http://localhost:4000 &

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID