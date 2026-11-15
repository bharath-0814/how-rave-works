# How Rave Works: Under the Hood of a Global Watch Party Engine

> An exhaustive, evidence-backed reverse engineering deep dive into the desktop architecture of **Rave** (`rave-desktop` v1.18.32), conducted using **REA (Reverse Engineer Anything)**.

[![Live Website](https://img.shields.io/badge/website-live%20deep--dive-ec4899?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bharath-0814.github.io/how-rave-works/)
[![Analysis Tool: REA](https://img.shields.io/badge/analyzed%20with-REA%20MCP-06b6d4?style=for-the-badge)](https://github.com/morluto/rea)
[![Target Platform](https://img.shields.io/badge/target-Windows%20x64%20%7C%20Electron%2033+-8b5cf6?style=for-the-badge)](https://rave.io)

---

## 🎨 Interactive UI/UX Flow Architecture System (Ink UI)

The live deployment features a complete **Interactive UI/UX Flow Architecture & Execution Inspector** built at the top of the page using the **Ink Design System**:

- **11 Complete System Stages**: From cold binary boot (`Rave.exe` + Electron Fuses) to background daemon execution (`indexerHost.child.js` + 13 residential proxy SDKs).
- **Interactive UI Wireframe Simulation**: Visual desktop mockup of every window (`splashPage.html`, `login.html`, `app.html`, `dm-window.html`, `notification-window.html`).
- **One-Click Code Inspection**: Every single stage features a dedicated `[ </> Code ]` button revealing reverse-engineered source code, decompiled scripts, and Protobuf schemas.
- **Master Expand/Collapse Code Action**: Toggle all 11 code drawers simultaneously for total architectural transparency.
- **Ink REA Terminal Simulator**: Test live forensic commands (`rea inspect-fuses`, `ntp status`, `proxies list`, `dsp inspect-worklets`, `ipc dump-catalog`) directly in an interactive browser terminal.
- **Searchable IPC Highway**: Complete, filterable matrix of all **100 `ipcMain.handle`** and **35 `ipcMain.on`** channels.

---

## 📖 Executive Summary

How does desktop watch party software synchronize 4K YouTube videos, Netflix movies, and private Google Drive files across millions of concurrent users globally with sub-10ms precision—without official APIs from streaming giants?

This repository contains the complete forensic analysis and full-length technical blog exploring every subsystem of Rave Desktop.

### 🔍 Key Revelations Discovered:

1. **Sub-10ms Global Sync via Custom NTPv4**:
   - Rave bypasses local OS system clocks entirely.
   - Embeds a full Network Time Protocol (NTP) client polling 25+ global servers across 7 continents (`time.google.com`, `time.cloudflare.com`, `pool.ntp.org`).
   - Uses an 8-sample statistical filter with standard deviation pruning and a 60-sample sliding window to calculate a rolling microsecond delta (`ntp-delta`).
   - Smoothly adjusts `HTMLMediaElement.playbackRate` between 0.95x and 1.05x to eliminate audio pitch distortion while syncing peers.

2. **YouTube BotGuard VM Minter & SABR Bypass**:
   - Runs an in-memory Google BotGuard VM emulator directly in the renderer (`dist/botGuardScript.js`).
   - Fetches Google's dynamic interpreter code and evaluates VM snapshots in real-time.
   - Exchanges snapshots with YouTube's internal gRPC-Web endpoint (`/api/jnn/v1/GenerateIT`) using Google API key `AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw`.
   - Generates authentic Proof-of-Origin (PO) tokens to stream YouTube video chunks without triggering bot-detection throttling.

3. **Google Drive Webview Hijacking**:
   - Injects custom CSS via `webFrame.insertCSS` to transform Google Drive's web interface into a dark-mode Rave theme.
   - Monkey-patches `window.fetch` and `XMLHttpRequest.prototype.open/send` to mutate file queries on the fly (`type:video type:matroska type:folder`).
   - Suppresses WebAuthn passkeys via `googleDriveHiddenWebviewPreload.js` to force cookie fallback.
   - Intercepts clicks, captures Google's internal `SAPISIDHASH` authorization function and `__initData` API keys, and streams raw video files directly to all participants.

4. **Android MCS Push Notification Masquerade**:
   - Emulates an Android mobile device checkin (`android_checkin.proto`, `checkin.proto`, `mcs.proto`).
   - Connects directly to Google's Mobile Connection Server (MCS) on port 5228 over raw TLS using `@aracna/fcm`, completely bypassing Windows Notification Service (WNS) limitations.

5. **Audio Pipeline & Computer Vision**:
   - Low-latency AudioWorklets: `AudioInputProcessor` (Float32 to Int16 PCM conversion), `AudioOutputProcessor` (ring buffer dispatch), and `AudioVolumeProcessor` (RMS calculation with fast-attack/slow-release smoothing).
   - Real-time WebAssembly deep-learning noise cancellation via `@jitsi/rnnoise-wasm`.
   - OffscreenCanvas Web Worker (`BlackBarDetection.worker.js`) detecting video letterboxing/pillarboxing at pixel level (< 25 luminosity threshold) to auto-crop videos.
   - Bundled Google MediaPipe WASM SIMD models: `face_landmarker.task` (478 3D facial landmarks for avatar mouth tracking) and `language_detector.tflite` for cross-platform chat translation.

6. **The Hidden Engine: 13-SDK Residential Proxy Mesh**:
   - Identifies the background business model: Rave bundles 13 residential proxy, web indexing, and bandwidth monetization SDKs in a dedicated child process (`indexerHost.child.js`):
     - AnyIP (`peer_ffi.dll`), CashRaven, EarnFM, GeoNode, GetPassive, Honeygain, Infatica (`BsLib_x64.dll`), LiveProxies (`hopmn.dll`), Massive, Ports (`@redharvest/proxy`), Soax (`librpalwi_amd64.dll`), Pawns/IPRoyal, and Mellowtel.
   - Custom native C++ Winsock hook (`iat-meter`): Hooks socket IATs (`send`, `recv`), intercepts TLS ClientHello SNI headers, inspects HTTP `CONNECT`/`Host` headers, and snoops DNS-over-HTTPS (DoH) answers from `dns.google` and `cloudflare-dns.com` to attribute byte-level bandwidth consumption.
   - `PriapusClient`: Distributed in-app web scraping engine executing headless fetch jobs dispatched via WebSocket.

---

## 🛠 Local Development & Build

```bash
# Clone the repository
git clone https://github.com/bharath-0814/how-rave-works.git
cd how-rave-works

# Rebuild the website from reverse-engineered forensic data
node generate_site.js

# Preview locally
npx serve .
```

---

## ⚖️ Responsible Disclosure & Legal Notice

This project is an independent educational and architectural analysis conducted strictly for reverse engineering research and interoperability study under relevant fair use and security research principles. All trademarks and registered trademarks are property of their respective owners.
