<div align="center">

  <h1>🖐️ GestureVision AI</h1>
  <p><b>Real-Time Touchless Human-Computer Interaction (HCI) & Computer Vision Engine in the Browser</b></p>

  <img src="https://img.shields.io/badge/Computer_Vision-MediaPipe_Hands-7928CA?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Architecture-Client--Side_Inference-00C7B7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/FPS-60_Realtime-22C55E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Author-Krishna_Gupta-3776AB?style=for-the-badge&logo=python&logoColor=white" />

  <br/><br/>

  <a href="https://krishnagupta-coder.github.io/GestureVision-AI/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_LAUNCH_LIVE_DEMO-7928CA?style=for-the-badge&logoColor=white" alt="Live Demo" />
  </a>

</div>

---

### ⚡ Problem Statement & Overview
Modern human-computer interfaces rely heavily on physical touch (keyboards, touchpads, touchscreens). In hygiene-critical environments (surgeries, cleanrooms, kitchens) or multitasking scenarios, physical contact is either hazardous or inconvenient.

**GestureVision AI** is an in-browser edge Computer Vision engine developed by [Krishna Gupta](https://github.com/KrishnaGupta-coder). It delivers **low-latency 3D hand tracking and gesture telemetry** running entirely in the client's browser with **zero server dependencies and absolute privacy**.

---

### 🎮 Gesture Lexicon & Simulated Controls

| Gesture | Landmark Trigger | Simulated OS Action | Audio Frequency |
| :--- | :--- | :--- | :--- |
| ✋ **Open Palm** | All 5 finger tips extended beyond PIP joints | **Media Play / Pause** | `520 Hz` |
| 🤏 **Pinch Dial** | Thumb tip to Index tip Euclidean distance `< 0.07` | **Precision Volume / Slider Dial** | `880 Hz` |
| ✌️ **Victory / Peace** | Index + Middle extended; Ring + Pinky curled | **State Capture / Screenshot** | `660 Hz` |
| ✊ **Closed Fist** | All fingers curled below PIP joints | **System Mute / Screen Lock** | `300 Hz` |
| 👆 **Point Vector** | Only Index extended | **Virtual Air Cursor** | `440 Hz` |

---

### 🛠️ Architecture & Pipeline

```mermaid
flowchart LR
    A[📹 Webcam Stream (640x480)] --> B[🧠 MediaPipe Hands Neural Net]
    B --> C[📍 21 3D Coordinate Landmarks]
    C --> D[📐 Euclidean Distance & Angle Calculation]
    D --> E[🎯 Gesture Classification Engine]
    E --> F[🎨 60 FPS HTML5 Canvas Skeleton Overlay]
    E --> G[🔊 Web Audio API Synthesizer Feedback]
    E --> H[⚡ Telemetry & State Bus]
```

---

### ✨ Core Capabilities

- **Zero-Latency In-Browser Inference**: Powered by Google MediaPipe WebAssembly and WebGL acceleration.
- **Dynamic Pinch Gauge**: Continuously computes proportional Euclidean distance between thumb and index finger to simulate high-precision continuous dials (sliders, zoom, scrubbers).
- **Tactile Web Audio Synthesizer**: Uses Web Audio API sine oscillators to give instantaneous audio-haptic feedback upon gesture switches.
- **Glassmorphic Telemetry HUD**: Live metrics displaying real-time FPS, active landmark count (21/21), confidence scores, and historical event streams.

---

### 🚀 Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/KrishnaGupta-coder/GestureVision-AI.git
   cd GestureVision-AI
   ```
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave) or serve via simple HTTP:
   ```bash
   python -m http.server 8000
   ```
3. Grant webcam permissions and test gestures in real time!

---

<div align="center">
  <sub>Developed with precision by <b>Krishna Gupta</b> • Specialized in Computer Vision & Edge Systems • Jaipur, India</sub>
</div>
