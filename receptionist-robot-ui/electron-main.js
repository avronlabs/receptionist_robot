const { app, BrowserWindow, session } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;
let frontendProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public', 'file.svg'), // Change to your icon if needed
  });
  win.loadURL('http://localhost:4000');

  // Allow microphone access
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true); // Approve access to microphone/camera
    } else {
      callback(false);
    }
  });
}

function startBackend() {
  // Adjust the path to your backend main.py and venv as needed
  const backendPath = path.join(__dirname, '..', 'backend', 'app.py');
  const venvPython = path.join(__dirname, '..', 'robot_env', 'bin', 'python');
  backendProcess = spawn(venvPython, [backendPath], {
    cwd: path.join(__dirname, '..', 'backend'),
    stdio: 'inherit',
  });
}

function startFrontend() {
  // Serve the static exported Next.js site from the 'out' directory on port 4000
  frontendProcess = spawn('npx', ['serve', '-l', '4000', 'out'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit',
  });
}

app.whenReady().then(() => {
  startBackend();
  startFrontend();
  // Wait a bit for frontend to start, then open window
  setTimeout(createWindow, 5000);
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});
