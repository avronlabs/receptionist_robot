# Piper Model Download Instructions

This directory is for Piper TTS model files (e.g., `.onnx`, `.onnx.json`).

**These files are NOT tracked by git and must be downloaded manually.**

## How to Download Piper Models

1. Visit the official Piper model repository:  
   https://github.com/rhasspy/piper/releases 
   or 
   https://rhasspy.github.io/piper-samples/

2. Download the desired voice/model files (e.g., `en_US-amy-medium.onnx` and its `.onnx.json` config).

3. Place the downloaded `.onnx` and `.onnx.json` files in this directory:
   
   ```
   backend/speech/piper-models/
   ```

4. Update your environment or configuration if you change model names.

---

**Note:**
- Do NOT commit model files to git. They are large and are ignored by `.gitignore`.
- If you need a specific model, check your `tts.py` or documentation for the required filename.

For more help, see the main project `README.md`.
