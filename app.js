// GestureVision AI — Real-Time Computer Vision & Hand Gesture Recognition Engine
// Developed by Krishna Gupta

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');

// UI Elements
const streamDot = document.getElementById('streamDot');
const streamStatus = document.getElementById('streamStatus');
const fpsCounter = document.getElementById('fpsCounter');
const landmarkCount = document.getElementById('landmarkCount');
const hudGestureName = document.getElementById('hudGestureName');
const hudConfidence = document.getElementById('hudConfidence');
const actionToast = document.getElementById('actionToast');
const pinchVal = document.getElementById('pinchVal');
const pinchBar = document.getElementById('pinchBar');
const logStream = document.getElementById('logStream');

// Buttons
const btnStart = document.getElementById('btnStart');
const btnToggleLandmarks = document.getElementById('btnToggleLandmarks');
const btnAudioToggle = document.getElementById('btnAudioToggle');
const btnClearLogs = document.getElementById('btnClearLogs');
const audioState = document.getElementById('audioState');

// Action Tiles
const tilePlayPause = document.getElementById('tilePlayPause');
const tilePinch = document.getElementById('tilePinch');
const tilePeace = document.getElementById('tilePeace');
const tileFist = document.getElementById('tileFist');

let showSkeleton = true;
let audioEnabled = true;
let isStreaming = false;
let lastFrameTime = performance.now();
let frameCount = 0;
let lastGesture = null;
let lastGestureTime = 0;

// Web Audio Synthesizer for futuristic tactile feedback
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.08) {
  if (!audioEnabled || audioCtx.state !== 'running') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context error or not unlocked yet
  }
}

function appendLog(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = `log-item ${type}`;
  item.textContent = `[${time}] ${msg}`;
  logStream.prepend(item);
  if (logStream.children.length > 25) {
    logStream.removeChild(logStream.lastChild);
  }
}

// Distance utility between 2 landmarks
function dist(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Classify gesture from 21 landmarks
function classifyHand(landmarks) {
  // Landmarks indices:
  // 0: Wrist, 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
  // MCPs: 2 (Thumb), 5 (Index), 9 (Middle), 13 (Ring), 17 (Pinky)
  // PIPs: 6 (Index), 10 (Middle), 14 (Ring), 18 (Pinky)

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexPip = landmarks[6];
  const middlePip = landmarks[10];
  const ringPip = landmarks[14];
  const pinkyPip = landmarks[18];

  const wrist = landmarks[0];

  // Check finger extension (tip higher/farther than PIP relative to wrist)
  const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.15;
  const isMiddleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.15;
  const isRingExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.15;
  const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.15;

  // Pinch distance between index tip and thumb tip
  const pinchDistance = dist(thumbTip, indexTip);
  const isPinching = pinchDistance < 0.07;

  // Update pinch gauge
  const pinchPercent = Math.min(100, Math.max(0, Math.round((1 - pinchDistance / 0.25) * 100)));
  pinchVal.textContent = `${pinchPercent}%`;
  pinchBar.style.width = `${pinchPercent}%`;

  if (isPinching) {
    return { name: 'PINCH', desc: 'Precision Dial', confidence: 0.95, tile: tilePinch, freq: 880 };
  }

  // Open Palm: All fingers extended
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { name: 'OPEN PALM', desc: 'Media: Play / Pause', confidence: 0.98, tile: tilePlayPause, freq: 520 };
  }

  // Victory / Peace: Index and Middle extended, Ring and Pinky closed
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { name: 'VICTORY / PEACE', desc: 'State Capture Triggered', confidence: 0.94, tile: tilePeace, freq: 660 };
  }

  // Fist: All fingers closed
  if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { name: 'CLOSED FIST', desc: 'Mute / System Lock', confidence: 0.92, tile: tileFist, freq: 300 };
  }

  // Pointing: Only Index extended
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { name: 'POINT', desc: 'Navigation Cursor', confidence: 0.89, tile: null, freq: 440 };
  }

  return { name: 'TRACKING', desc: 'Analyzing Movement', confidence: 0.70, tile: null, freq: null };
}

// Reset active tile styling
function clearActiveTiles() {
  [tilePlayPause, tilePinch, tilePeace, tileFist].forEach(t => t.classList.remove('active'));
}

// MediaPipe Results Callback
function onResults(results) {
  // Update FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFrameTime >= 1000) {
    fpsCounter.textContent = Math.round((frameCount * 1000) / (now - lastFrameTime));
    frameCount = 0;
    lastFrameTime = now;
  }

  // Clear canvas & draw video frame
  canvasElement.width = videoElement.videoWidth || 640;
  canvasElement.height = videoElement.videoHeight || 480;
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    landmarkCount.textContent = `${landmarks.length}/21`;

    // Draw Skeleton & Connectors if enabled
    if (showSkeleton) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#a855f7', lineWidth: 4 });
      drawLandmarks(canvasCtx, landmarks, { color: '#00c7b7', lineWidth: 2, radius: 4 });
    }

    // Classify Gesture
    const gesture = classifyHand(landmarks);
    hudGestureName.textContent = gesture.name;
    hudConfidence.textContent = `${Math.round(gesture.confidence * 100)}%`;
    actionToast.textContent = `Action: ${gesture.desc}`;

    clearActiveTiles();
    if (gesture.tile) {
      gesture.tile.classList.add('active');
    }

    // Trigger state change audio & log if gesture changed
    const currentTime = Date.now();
    if (gesture.name !== lastGesture && currentTime - lastGestureTime > 600) {
      lastGesture = gesture.name;
      lastGestureTime = currentTime;
      if (gesture.freq) playTone(gesture.freq);
      if (gesture.name !== 'TRACKING') {
        appendLog(`Detected: ${gesture.name} -> ${gesture.desc}`, 'action');
      }
    }
  } else {
    landmarkCount.textContent = '0/21';
    hudGestureName.textContent = 'NONE';
    hudConfidence.textContent = '0.0%';
    actionToast.textContent = 'Ready for Hand Input';
    clearActiveTiles();
    pinchVal.textContent = '0%';
    pinchBar.style.width = '0%';
  }

  canvasCtx.restore();
}

// MediaPipe Hands Initialization
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.65,
  minTrackingConfidence: 0.65
});

hands.onResults(onResults);

let camera = null;

// Camera Start Handler
btnStart.addEventListener('click', async () => {
  if (isStreaming) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  try {
    appendLog('Requesting webcam access...', 'info');
    btnStart.textContent = 'Initializing Camera...';
    btnStart.disabled = true;

    camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });

    await camera.start();
    isStreaming = true;
    streamDot.classList.add('active');
    streamStatus.textContent = 'Camera Live (60 FPS)';
    btnStart.textContent = 'Camera Active';
    appendLog('Webcam connected. Neural model tracking active.', 'info');
    playTone(580, 0.15);
  } catch (err) {
    appendLog(`Camera error: ${err.message}`, 'action');
    btnStart.textContent = 'Retry Camera';
    btnStart.disabled = false;
  }
});

// Controls
btnToggleLandmarks.addEventListener('click', () => {
  showSkeleton = !showSkeleton;
  btnToggleLandmarks.textContent = showSkeleton ? 'Toggle Skeleton' : 'Skeleton: OFF';
  appendLog(`Skeleton overlay: ${showSkeleton ? 'Enabled' : 'Disabled'}`, 'info');
});

btnAudioToggle.addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  audioState.textContent = audioEnabled ? 'ON' : 'OFF';
  appendLog(`Audio FX: ${audioEnabled ? 'Enabled' : 'Muted'}`, 'info');
});

btnClearLogs.addEventListener('click', () => {
  logStream.innerHTML = '';
});
