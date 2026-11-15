# How Rave Works: Under the Hood of a Global Watch Party Engine

> An exhaustive, evidence-backed reverse engineering deep dive into the desktop architecture of **Rave** (`rave-desktop` v1.18.32), conducted using **REA (Reverse Engineer Anything)**.

[![Live Website](https://img.shields.io/badge/website-live%20deep--dive-ec4899?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bharath-0814.github.io/how-rave-works/)
[![Analysis Tool: REA](https://img.shields.io/badge/analyzed%20with-REA%20MCP-06b6d4?style=for-the-badge)](https://github.com/morluto/rea)
[![Target Platform](https://img.shields.io/badge/target-Windows%20x64%20%7C%20Electron%2033+-8b5cf6?style=for-the-badge)](https://rave.io)

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
   - Intercepts clicks, captures Google's internal `SAPISIDHASH` authorization function and `__initData` API keys, and streams raw video files directly to all participants.

4. **Android MCS Push Notification Masquerade**:
   - Emulates an Android mobile device checkin (`android_checkin.proto`, `checkin.proto`, `mcs.proto`).
   - Connects directly to Google's Mobile Connection Server (MCS) on port 5228 over raw TLS using `@aracna/fcm`, completely bypassing Windows Notification Service (WNS) limitations.

5. **Audio Pipeline & Computer Vision**:
   - Low-latency AudioWorklets: `AudioInputProcessor` (Float32 to Int16 PCM conversion), `AudioOutputProcessor` (ring buffer dispatch), and `AudioVolumeProcessor` (RMS calculation with fast-attack/slow-release smoothing).
   - Real-time WebAssembly deep-learning noise cancellation via `@jitsi/rnnoise-wasm`.
   - OffscreenCanvas Web Worker (`BlackBarDetection.worker.js`) detecting video letterboxing/pillarboxing at pixel level (&lt; 25 luminosity threshold) to auto-crop videos.
   - Bundled Google MediaPipe WASM SIMD models: `face_landmarker.task` (478 3D facial landmarks for avatar mouth tracking) and `language_detector.tflite` for cross-platform chat translation.

6. **The Hidden Engine: 13-SDK Residential Proxy Mesh**:
   - Identifies the background business model: Rave bundles 13 residential proxy, web indexing, and bandwidth monetization SDKs in a dedicated child process (`indexerHost.child.js`):
     - AnyIP (`peer_ffi.dll`), CashRaven, EarnFM, GeoNode, GetPassive, Honeygain, Infatica (`BsLib_x64.dll`), LiveProxies (`hopmn.dll`), Massive, Ports (`@redharvest/proxy`), Soax (`librpalwi_amd64.dll`), Pawns/IPRoyal, and Mellowtel.
   - Custom native C++ Winsock hook (`iat-meter`): Hooks socket IATs (`send`, `recv`), intercepts TLS ClientHello SNI headers, inspects HTTP `CONNECT`/`Host` headers, and snoops DNS-over-HTTPS (DoH) answers from `dns.google` and `cloudflare-dns.com` to attribute byte-level bandwidth consumption.
   - `PriapusClient`: Distributed in-app web scraping engine executing headless fetch jobs dispatched via WebSocket.

---

## 🌐 Read the Full Deep-Dive Online

The full interactive blog article with diagrams, code breakdowns, and tables is deployed at:

👉 **[https://bharath-0814.github.io/how-rave-works/](https://bharath-0814.github.io/how-rave-works/)**

---

## 🛠 Target Artifact Provenance

- **Target Path:** `C:\Users\bhara\AppData\Local\Programs\rave-desktop`
- **Application ASAR:** `resources\app.asar` (115,820,306 bytes)
- **ASAR SHA-256:** `fcc90474a593bcd3215a1b9a5a28512986a7987510386edca1d2245aef0ee769`
- **Executable:** `Rave.exe` (236,438,376 bytes, PE32+ x86-64)
- **Executable SHA-256:** `d20964aa65838092e2172fb9c9ebf7384232e0c8e5bcdcc7f4764954af3455d8`

---

## ⚖️ Legal & Security Disclaimer

This project is published for educational, architectural, and security research purposes only. All observations and derivations were obtained via non-invasive static and local runtime inspection of legally acquired software using REA. No DRM keys were extracted, and no copyright protections were bypassed.
