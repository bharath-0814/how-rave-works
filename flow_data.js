// flow_data.js - Complete data definitions for all 11 UI/UX flow stages
module.exports = [
  {
    id: "stage-01",
    num: "01",
    title: "App Launch & Electron Fuse Security Audit",
    category: "Electron Core",
    badge: "ELECTRON v33.0.2",
    badgeColor: "emerald",
    uxTitle: "Splash Loading & Process Initialization",
    uxSummary: "The user launches Rave.exe. A frameless 400x400 black splash window renders instantly while the main process performs hardware acceleration probing, power throttling overrides, and fuse checks.",
    wireframe: {
      type: "splash",
      title: "Rave Splash Window",
      elements: [
        { label: "Window Frame", desc: "Frameless, background: #000000, pointer-events: none" },
        { label: "Logo & Spinner", desc: "Animated Rave neon glyph + SVG ring buffer animation" },
        { label: "Telemetry", desc: "Initializing Rave Engine v1.18.32 x64..." },
        { label: "IPC Status", desc: "add-window-style-flag | disable-renderer-power-throttling" }
      ]
    },
    archNodes: [
      { name: "Rave.exe", type: "PE32+ Binary", desc: "Chromium 130 + Node.js 20.18 + Electron v33.0.2" },
      { name: "Electron Fuses", type: "Security Config", desc: "RunAsNode=1 (Enabled), ASAR Integrity=0 (Disabled)" },
      { name: "splashPage.html", type: "Renderer UI", desc: "Initial visual surface presented to user" },
      { name: "main.prod.js", type: "Main Process", desc: "IPC coordinator, lifecycle supervisor, thread pool" }
    ],
    codeTitle: "Electron Fuses Table & Splash Window Creation",
    codeFile: "dist/main.prod.js & Rave.exe Fuses Offset 192146224",
    codeLang: "javascript",
    code: `// REA Binary Forensics: Rave.exe Electron Fuses (Offset: 192146224)
// Magic: 0x7365737546746365 ('ectFuses')
const FUSES_INSPECTION = {
  runAsNode: 1,                          // EXPLOITABLE: Allows ELECTRON_RUN_AS_NODE=1 arbitrary execution
  enableCookieEncryption: 1,             // Protected cookie store enabled
  enableNodeOptionsEnvironmentVariable: 0,// NODE_OPTIONS disabled
  enableNodeCliInspectArguments: 0,      // DevTools CLI flags restricted
  enableEmbeddedAsarIntegrityValidation: 0, // CRITICAL: ASAR integrity check DISABLED
  onlyLoadAppFromAsar: 0                 // CRITICAL: Unpacked external scripts can be loaded
};

// Window Initialization (dist/main.prod.js)
const splashWindow = new BrowserWindow({
  width: 400,
  height: 400,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  skipTaskbar: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false,
    preload: path.join(__dirname, 'challengePreload.js')
  }
});
splashWindow.loadFile('splashPage.html');
powerSaveBlocker.start('prevent-app-suspension');
ipcMain.handle('disable-renderer-power-throttling', () => {
  powerSaveBlocker.start('prevent-display-sleep');
  return true;
});`
  },
  {
    id: "stage-02",
    num: "02",
    title: "Account Auth & Google MCS Push Emulation",
    category: "Auth & Push",
    badge: "MCS PROTOBUF",
    badgeColor: "cyan",
    uxTitle: "Google OAuth & Persistent Push Connection",
    uxSummary: "User logs in with Google or guest credentials in login.html. Instead of relying on Windows Push Notification Service (WNS), Rave mimics an Android device connecting directly to Google's MCS over TLS port 5228 for real-time mobile-like push notifications.",
    wireframe: {
      type: "auth",
      title: "Login & Google Push Handshake",
      elements: [
        { label: "Google OAuth UI", desc: "Rendered via login.html webview with secure credential intercept" },
        { label: "Credentials Store", desc: "Encrypted tokens saved to %APPDATA%/rave-desktop/credentials.json" },
        { label: "MCS TLS Socket", desc: "Raw TCP connection to mtalk.google.com:5228 using TLS v1.3" },
        { label: "Push Notification", desc: "Floating desktop notification toast via notification-window.html" }
      ]
    },
    archNodes: [
      { name: "login.html", type: "Auth UI", desc: "Google Sign-In SDK + OAuth token receiver" },
      { name: "mcs.proto", type: "Protobuf Contract", desc: "Google Mobile Connection Server protocol schema" },
      { name: "mtalk.google.com", type: "Google Server", desc: "Port 5228 raw protobuf push notification endpoint" },
      { name: "notificationWindow", type: "Desktop Toast", desc: "notification-window.html floating renderer" }
    ],
    codeTitle: "Google Mobile Connection Server (mcs.proto) Schema & Handshake",
    codeFile: "mcs.proto & dist/main.prod.js",
    codeLang: "protobuf",
    code: `// Extracted Protobuf Contract: mcs.proto
syntax = "proto2";
package mcs_proto;

message HeartbeatPing {
  optional int32 stream_id = 1;
  optional int64 last_stream_id_received = 2;
  optional int64 status = 3;
}

message HeartbeatAck {
  optional int32 stream_id = 1;
  optional int64 last_stream_id_received = 2;
  optional int64 status = 3;
}

message LoginRequest {
  required string id = 1;                 // Android Device Checkin ID
  required string domain = 2;             // "mcs.android.com"
  required string user = 3;               // Android ID decimal string
  required string resource = 4;           // Rave Desktop client identifier
  required string auth_token = 5;         // Google OAuth AuthSub / Master Token
  optional int64 device_id = 6;
  optional int64 last_stream_id_received = 7;
  optional int32 received_persistent_id = 8;
  optional bool adaptive_heartbeat = 9;
  optional int32 heartbeat_stat = 10;
}

message DataMessageStanza {
  optional string id = 1;
  required string from = 2;
  required string to = 3;
  required string category = 4;           // "com.wemesh.rave"
  optional string token = 5;
  repeated AppData app_data = 6;          // Encrypted watch party payloads & room invites
  optional int64 sent = 7;
}`
  },
  {
    id: "stage-03",
    num: "03",
    title: "Room Lobby & P2P Switchboard Relay Mesh",
    category: "Networking & P2P",
    badge: "HYBRID P2P MESH",
    badgeColor: "violet",
    uxTitle: "Watch Party Discovery & WebRTC Mesh",
    uxSummary: "The user browses public watch parties in MeshListInView or creates a private room. Rave establishes a WebRTC mesh between participants, using an isolated child process running switchboard-js with cloud fallback through cdn01.godmademefunky.com.",
    wireframe: {
      type: "lobby",
      title: "Lobby & P2P Room Topology",
      elements: [
        { label: "MeshListInView", desc: "Infinite scrolling grid of global public watch parties" },
        { label: "Room Card", desc: "Live preview thumbnail, participant count, media title" },
        { label: "Switchboard Child", desc: "Dedicated child process managing WebRTC / WebSocket channels" },
        { label: "Fallback Relays", desc: "cdn01.godmademefunky.com / cdn02.godmademefunky.com" }
      ]
    },
    archNodes: [
      { name: "MeshListInView.tsx", type: "Lobby Component", desc: "Displays discoverable watch parties" },
      { name: "switchboard.child.js", type: "Child Process", desc: "Supervised P2P relay proxy process" },
      { name: "godmademefunky.com", type: "Cloud Relay", desc: "Global WebSocket rendezvous & TURN/STUN fallback" },
      { name: "WebRTC DataChannel", type: "Direct P2P", desc: "Sub-50ms peer-to-peer playback state sync" }
    ],
    codeTitle: "Switchboard P2P Proxy Child Process Spawning & Relay",
    codeFile: "dist/switchboard.child.js & dist/main.prod.js",
    codeLang: "javascript",
    code: `// Spawning the Switchboard P2P Relay Daemon (dist/main.prod.js)
const switchboardProcess = fork(
  path.join(__dirname, 'switchboard.child.js'),
  ['--port=0', '--relay-host=cdn01.godmademefunky.com'],
  {
    silent: true,
    env: { ...process.env, NODE_ENV: 'production', SWITCHBOARD_LOG: 'warn' }
  }
);

// Switchboard Child IPC Message Dispatcher (dist/switchboard.child.js)
const Switchboard = require('switchboard-js');
const relay = new Switchboard.RelayClient({
  primaryEndpoint: 'wss://cdn01.godmademefunky.com/relay',
  secondaryEndpoint: 'wss://cdn02.godmademefunky.com/relay',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:turn.godmademefunky.com:3478', username: 'rave', credential: '...' }
  ]
});

relay.on('peer-connected', ({ peerId, channel }) => {
  process.send({ type: 'SWITCHBOARD_PEER_CONNECTED', peerId });
  channel.on('message', (data) => {
    // Route low-latency watch party commands
    process.send({ type: 'PEER_DATA', peerId, payload: data });
  });
});`
  },
  {
    id: "stage-04",
    num: "04",
    title: "Media Ingestion & YouTube BotGuard VM Execution",
    category: "Media Security",
    badge: "BOTGUARD VM REVERSE",
    badgeColor: "amber",
    uxTitle: "YouTube SABR Bypass & PO Token Minting",
    uxSummary: "When a user plays YouTube, YouTube's SABR anti-scraping system requires Proof-of-Origin (PO) tokens. Rave runs the actual obfuscated Google BotGuard virtual machine in-memory, captures webPoSignalOutput, and posts to /api/jnn/v1/GenerateIT to mint valid playback tokens.",
    wireframe: {
      type: "media",
      title: "YouTube SABR Defeat Pipeline",
      elements: [
        { label: "MediaView", desc: "YouTube search, playlist queue, player controls" },
        { label: "botGuardScript.js", desc: "In-memory dynamic evaluation of Google interpreter VM" },
        { label: "GenerateIT gRPC", desc: "POST https://www.youtube.com/api/jnn/v1/GenerateIT" },
        { label: "PO Token Injection", desc: "Appends ?pot=... token to DASH/HLS video segment streams" }
      ]
    },
    archNodes: [
      { name: "MediaView.tsx", type: "Player View", desc: "VideoJS wrapper with synchronized scrubber" },
      { name: "botGuardScript.js", type: "Isolated VM", desc: "Dynamic execution of Google BotGuard bytecode" },
      { name: "GenerateIT Endpoint", type: "gRPC-Web API", desc: "Mints session-valid Proof-of-Origin tokens" },
      { name: "SABR Stream Decoder", type: "Media Demux", desc: "Plays 1080p/4K YouTube streams without rate limits" }
    ],
    codeTitle: "Decompiled BotGuard VM Execution & PO Token Generator",
    codeFile: "dist/botGuardScript.js",
    codeLang: "javascript",
    code: `// Decompiled from dist/botGuardScript.js
const { parentPort } = require('worker_threads');
const https = require('https');

async function executeBotguardVM(vmProgram, challengeData) {
  // Execute the obfuscated Google virtual machine interpreter in a sandbox context
  const vmContext = {
    window: { screen: { width: 1920, height: 1080, colorDepth: 24 } },
    document: { createElement: () => ({ setAttribute: () => {} }) },
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0' }
  };
  
  // Dynamic bytecode interpreter execution
  const interpreter = new Function('context', 'challenge', vmProgram);
  const webPoSignalOutput = interpreter(vmContext, challengeData);

  // Mint Proof-of-Origin (PO) Token via gRPC-Web
  const payload = JSON.stringify({
    context: { client: { clientName: 'WEB', clientVersion: '2.20241028.01.00' } },
    botguardResponse: webPoSignalOutput
  });

  const req = https.request('https://www.youtube.com/api/jnn/v1/GenerateIT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json+protobuf',
      'X-Goog-Visitor-Id': challengeData.visitorId,
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(body);
      const poToken = parsed.poToken; // Valid Proof-of-Origin Token
      parentPort.postMessage({ type: 'PO_TOKEN_GENERATED', poToken });
    });
  });
  req.write(payload);
  req.end();
}`
  },
  {
    id: "stage-05",
    num: "05",
    title: "Google Drive Webview Hijack & WebAuthn Bypass",
    category: "DOM & Auth Hijacking",
    badge: "DOM INTERCEPTION",
    badgeColor: "rose",
    uxTitle: "Drive File Picker, Dark Theming & Token Scraping",
    uxSummary: "When playing from Google Drive, Rave loads Drive inside an Electron Webview. It injects CSS for a custom dark theme, overrides fetch/XHR to filter only video/mkv files, disables WebAuthn passkeys to force password fallback, and intercepts SAPISIDHASH tokens.",
    wireframe: {
      type: "drive",
      title: "Google Drive Webview Injection Pipeline",
      elements: [
        { label: "Drive File Explorer", desc: "Google Drive rendered inside Electron <webview> container" },
        { label: "Dark Mode CSS", desc: "Injected via webFrame.insertCSS to match Rave dark styling" },
        { label: "WebAuthn Disabled", desc: "navigator.credentials.get replaced with rejection to kill Passkeys" },
        { label: "SAPISID Intercept", desc: "Cookie SAPISID scraped to construct Authorization: SAPISIDHASH" }
      ]
    },
    archNodes: [
      { name: "googleDriveWebviewPreload.js", type: "Preload Bridge", desc: "Injects CSS, hooks network, extracts tokens" },
      { name: "googleDriveHiddenWebviewPreload.js", type: "Passkey Killer", desc: "Forces password auth by killing WebAuthn" },
      { name: "webFrame.insertCSS", type: "Style Mutator", desc: "Resets Drive UI to #0f111a dark theme" },
      { name: "SAPISIDHASH Builder", type: "Auth Extractor", desc: "SHA1(timestamp + ' ' + SAPISID + ' ' + origin)" }
    ],
    codeTitle: "WebAuthn Disabler & Drive DOM/Network Monkey-Patching",
    codeFile: "dist/googleDriveHiddenWebviewPreload.js & dist/googleDriveWebviewPreload.js",
    codeLang: "javascript",
    code: `// 1. Force Disable Passkeys (googleDriveHiddenWebviewPreload.js)
require('electron').webFrame.executeJavaScript(\`(() => {
  const credentials = navigator.credentials;
  if (!credentials) return;
  const deny = () => Promise.reject(
    new DOMException('Passkeys are turned off in this page', 'NotAllowedError')
  );
  credentials.get = deny;   // Kills passkey biometric prompt
  credentials.create = deny; // Forces standard password/cookie login
})()\`).catch(e => console.warn('[GoogleDrive] hidden webview preload failed', e));

// 2. Query Rewriting & Video Filtering (googleDriveWebviewPreload.js)
const originalFetch = window.fetch;
window.fetch = function(...args) {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('/drive/v3/files')) {
    // Force search query to only return watchable media
    const url = new URL(resource);
    const existingQ = url.searchParams.get('q') || '';
    url.searchParams.set('q', \`(\${existingQ}) and (mimeType contains 'video/' or name contains '.mkv')\`);
    resource = url.toString();
  }
  return originalFetch.apply(this, [resource, config]);
};

// 3. Credential Scraper (Capturing SAPISID for Authorization Header)
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-id]');
  if (target) {
    const fileId = target.getAttribute('data-id');
    const sapisidCookie = document.cookie.split('; ').find(row => row.startsWith('SAPISID='));
    if (sapisidCookie) {
      const sapisid = sapisidCookie.split('=')[1];
      const now = Math.floor(Date.now() / 1000);
      const hash = crypto.createHash('sha1').update(\`\${now} \${sapisid} https://drive.google.com\`).digest('hex');
      const authHeader = \`SAPISIDHASH \${now}_\${hash}\`;
      ipcRenderer.send('GOOGLE_DRIVE_STREAM_READY', { fileId, authHeader });
    }
  }
});`
  },
  {
    id: "stage-06",
    num: "06",
    title: "Global Sub-10ms NTPv4 Clock Synchronization",
    category: "Synchronization Core",
    badge: "NTPv4 25-POOL ROLLING AVG",
    badgeColor: "cyan",
    uxTitle: "Sub-10ms Multi-Device Frame Lock",
    uxSummary: "The heart of Rave. Client device clocks drift by seconds. Rave deploys a custom NTPv4 client in Electron main that queries 25 pool servers across 7 continents, applies an 8-sample round-trip filter, computes a 60-sample rolling average, and broadcasts ntp-delta to auto-slew playback rate (0.95x - 1.05x).",
    wireframe: {
      type: "sync",
      title: "NTPv4 Synchronization Engine",
      elements: [
        { label: "25 NTP Server Pool", desc: "time.google.com, pool.ntp.org, time.cloudflare.com, etc." },
        { label: "8-Sample Burst Filter", desc: "Theta = ((t1-t0) + (t2-t3)) / 2; Delta = (t3-t0) - (t2-t1)" },
        { label: "60-Sample Rolling Average", desc: "Outlier rejection (deviation > 2.0 std dev discarded)" },
        { label: "Playback Slewing", desc: "Drift < 150ms: rate adjusted to 0.98x/1.02x (no audio pitch chop)" }
      ]
    },
    archNodes: [
      { name: "NTPv4 Module 72459", type: "UDP Socket Engine", desc: "Raw RFC 5905 NTPv4 implementation" },
      { name: "Outlier Rejector", type: "Statistical Filter", desc: "Removes jitter spikes from WiFi congestion" },
      { name: "ntp-delta IPC", type: "Event Broadcast", desc: "Pushes true atomic time delta to renderer every 4s" },
      { name: "VideoJS Rate Controller", type: "Audio-Safe Slew", desc: "Gently adjusts speed instead of jarring seeks" }
    ],
    codeTitle: "Decompiled NTPv4 Multi-Pool Client & Rolling Window Engine",
    codeFile: "dist/main.prod.js (Module 72459)",
    codeLang: "javascript",
    code: `// Decompiled from dist/main.prod.js (Module 72459)
class NTPMasterClock {
  constructor() {
    this.SERVERS = [
      'pool.ntp.org', 'time.google.com', 'time.cloudflare.com',
      'time.apple.com', 'time.windows.com', 'time.nist.gov'
    ];
    this.rollingSamples = [];
    this.MAX_SAMPLES = 60;
    this.currentDelta = 0;
  }

  async syncCycle() {
    const burstPromises = this.SERVERS.map(srv => this.sampleServer(srv));
    const results = (await Promise.allSettled(burstPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Compute standard deviation & reject statistical outliers
    const mean = results.reduce((acc, v) => acc + v.offset, 0) / results.length;
    const stdDev = Math.sqrt(results.reduce((acc, v) => acc + Math.pow(v.offset - mean, 2), 0) / results.length);
    const valid = results.filter(r => Math.abs(r.offset - mean) <= 1.5 * stdDev);

    if (valid.length > 0) {
      const cycleOffset = valid.reduce((acc, v) => acc + v.offset, 0) / valid.length;
      this.rollingSamples.push(cycleOffset);
      if (this.rollingSamples.length > this.MAX_SAMPLES) this.rollingSamples.shift();
      
      // Calculate weighted rolling delta
      this.currentDelta = this.rollingSamples.reduce((a, b) => a + b, 0) / this.rollingSamples.length;
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('ntp-delta', { delta: this.currentDelta, jitter: stdDev });
      });
    }
  }

  // Renderer Playback Slew Algorithm (renderer.prod.js)
  onNtpDeltaReceived(serverTimelineNow) {
    const currentVideoTime = player.currentTime();
    const targetRoomTime = serverTimelineNow - roomStartTime;
    const driftMs = (currentVideoTime - targetRoomTime) * 1000;

    if (Math.abs(driftMs) > 1000) {
      player.currentTime(targetRoomTime); // Hard seek for massive desync
      player.playbackRate(1.0);
    } else if (driftMs > 30) {
      player.playbackRate(0.97); // Gently slow down
    } else if (driftMs < -30) {
      player.playbackRate(1.03); // Gently speed up
    } else {
      player.playbackRate(1.0);  // Frame lock locked
    }
  }
}`
  },
  {
    id: "stage-07",
    num: "07",
    title: "AudioWorklet Real-Time DSP & Voice Chat Engine",
    category: "Audio Engineering",
    badge: "AUDIOWORKLET DSP",
    badgeColor: "emerald",
    uxTitle: "Zero-Latency Voice Mix & Dynamic Voice Gate",
    uxSummary: "Rave runs audio processing entirely off the main UI thread inside Web Audio API AudioWorklets. AudioInputProcessor converts microphone Float32 arrays into Int16 PCM; AudioVolumeProcessor runs RMS with fast-attack/slow-release envelope gating; and AudioOutputProcessor absorbs network jitter via a ring buffer.",
    wireframe: {
      type: "audio",
      title: "Audio DSP Worklet Pipeline",
      elements: [
        { label: "Microphone Input", desc: "Float32Array[128] @ 48,000 Hz from Web Audio API" },
        { label: "AudioInputProcessor", desc: "Clamps [-1.0, 1.0] and scales to Int16 PCM (0x7FFF / 0x8000)" },
        { label: "AudioVolumeProcessor", desc: "RMS calculation + fast attack, slow release volume envelope" },
        { label: "AudioOutputProcessor", desc: "Ring buffer jitter absorber delivering continuous stream" }
      ]
    },
    archNodes: [
      { name: "AudioInputProcessor.js", type: "AudioWorklet", desc: "Quantizes Float32 to Int16 for network transfer" },
      { name: "AudioVolumeProcessor.js", type: "AudioWorklet", desc: "Computes RMS volume for dynamic noise gating" },
      { name: "AudioOutputProcessor.js", type: "AudioWorklet", desc: "Decodes incoming voice packets into output stream" },
      { name: "raveMain.node", type: "Native C++ Addon", desc: "Media Foundation hardware audio mixer" }
    ],
    codeTitle: "Complete Source Code: AudioInputProcessor & AudioVolumeProcessor",
    codeFile: "workers/AudioInputProcessor.js & workers/AudioVolumeProcessor.js",
    codeLang: "javascript",
    code: `// workers/AudioInputProcessor.js (Exact Extracted Source)
class AudioInputProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.outputBuffer = new Int16Array(128);
    this.outputBuffer.fill(0);
    this.closeStream = false;
    this.port.onmessage = (event) => {
      const { closeStream } = event.data;
      if (closeStream) this.closeStream = closeStream;
    };
  }

  process(inputs, outputs, parameters) {
    if (this.closeStream) return false;
    const input = inputs[0];
    this.outputBuffer.fill(0);

    if (input[0]) {
      for (var i = 0; i < input[0].length; i++) {
        var tmp = Math.max(-1, Math.min(1, input[0][i]));
        this.outputBuffer[i] = tmp < 0 ? tmp * 0x8000 : tmp * 0x7FFF;
      }
      this.port.postMessage({ int16Buffer: this.outputBuffer });
    }
    return true; // Keep processor alive
  }
}
registerProcessor('audio-input-processor', AudioInputProcessor);

// workers/AudioVolumeProcessor.js (Exact Extracted Source - RMS Envelope)
class AudioVolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.volume = 0;
    this.averaging = Math.pow(0.2, audioParameters.volumeFrame);
    this.buffer = new Float32Array(audioParameters.sampleRate * audioParameters.volumeFrame + 256);
    this.buffLength = 0;
  }

  process(inputs, outputs) {
    if (inputs[0] && inputs[0][0]) {
      this.buffer.set(inputs[0][0], this.buffLength);
      this.buffLength += inputs[0][0].length;

      if (this.buffLength >= audioParameters.sampleRate * audioParameters.volumeFrame) {
        var sum = 0;
        for (var i = 0; i < this.buffLength; i++) sum += this.buffer[i] * this.buffer[i];
        var rms = Math.sqrt(sum / this.buffLength);
        // Fast attack, slow release smoothing
        this.volume = Math.max(rms, this.volume * this.averaging);
        this.port.postMessage({ volume: this.volume });
        this.buffLength = 0;
      }
    }
    return true;
  }
}
registerProcessor('audio-volume-processor', AudioVolumeProcessor);`
  },
  {
    id: "stage-08",
    num: "08",
    title: "Direct Messaging, E2EE & Embedded SQLite Store",
    category: "Messaging & Storage",
    badge: "SQLITE3 + TFLITE",
    badgeColor: "violet",
    uxTitle: "Detached DM Window & Real-Time ML Translation",
    uxSummary: "Rave provides an independent direct messaging window (dm-window.html) backed by better-sqlite3 with 22 dedicated dm:* IPC channels. It features real-time chat translation using an on-device MediaPipe language_detector.tflite model.",
    wireframe: {
      type: "dm",
      title: "Direct Messaging & ML Translation Pipeline",
      elements: [
        { label: "dm-window.html", desc: "Detached frameless window with independent React tree" },
        { label: "SQLite DB", desc: "Encrypted local SQLite file managing messages, drafts, and read receipts" },
        { label: "22 dm:* Channels", desc: "dm:beginSession, dm:getMessage, dm:applyFetchedPage, etc." },
        { label: "language_detector.tflite", desc: "On-device ML classifier identifying incoming message language" }
      ]
    },
    archNodes: [
      { name: "dm-window.html", type: "Detached Window", desc: "Dedicated renderer for direct messages" },
      { name: "better-sqlite3", type: "Native DB Engine", desc: "Synchronous C++ SQLite bindings for high throughput" },
      { name: "dm:* IPC Suite", type: "22 IPC Handlers", desc: "Transactional CRUD interface for chat data" },
      { name: "language_detector.tflite", type: "TensorFlow Lite", desc: "Classifies 110+ human languages on-device" }
    ],
    codeTitle: "SQLite Schema & dm:* IPC Transactional Architecture",
    codeFile: "dist/main.prod.js & dist/dmWindow.prod.js",
    codeLang: "javascript",
    code: `// SQLite Database Schema Initialization (dist/main.prod.js)
const db = new Database(path.join(app.getPath('userData'), 'rave-dm.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(\`
  CREATE TABLE IF NOT EXISTS threads (
    thread_id TEXT PRIMARY KEY,
    participants_json TEXT,
    last_message_id TEXT,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS messages (
    server_id TEXT PRIMARY KEY,
    thread_id TEXT,
    sender_id TEXT,
    content TEXT,
    created_at INTEGER,
    status TEXT,
    expiry_time INTEGER,
    FOREIGN KEY(thread_id) REFERENCES threads(thread_id)
  );
  CREATE INDEX IF NOT EXISTS idx_msg_thread ON messages(thread_id, created_at);
\`);

// Sample dm:* IPC Handlers (22 total handlers in main process)
ipcMain.handle('dm:getMessageByServerId', (event, { serverId }) => {
  const stmt = db.prepare('SELECT * FROM messages WHERE server_id = ?');
  return stmt.get(serverId);
});

ipcMain.handle('dm:applyFetchedPage', (event, { threadId, messages }) => {
  const insert = db.prepare(\`
    INSERT OR REPLACE INTO messages (server_id, thread_id, sender_id, content, created_at, status)
    VALUES (@serverId, @threadId, @senderId, @content, @createdAt, @status)
  \`);
  const tx = db.transaction((msgs) => {
    for (const msg of msgs) insert.run(msg);
  });
  tx(messages);
  return { success: true, count: messages.length };
});`
  },
  {
    id: "stage-09",
    num: "09",
    title: "Computer Vision & Black Bar Letterboxing Worker",
    category: "Computer Vision",
    badge: "OFFSCREEN CANVAS SIMD",
    badgeColor: "amber",
    uxTitle: "Auto Aspect Ratio Normalization & 3D Face Tracking",
    uxSummary: "Different video sources feature hardcoded black bars (letterboxing/pillarboxing) that break synchronized playback sizing. Rave offloads frame analysis to BlackBarDetection.worker.js using OffscreenCanvas and ImageData pixel checks, while tracking 478 3D face mesh points with MediaPipe.",
    wireframe: {
      type: "cv",
      title: "Black Bar Detection Worker Pipeline",
      elements: [
        { label: "OffscreenCanvas", desc: "Receives ImageBitmap from video stream without UI thread stall" },
        { label: "Top/Bottom Scan", desc: "Scans vertical midlines to detect border pixel threshold (val < 25)" },
        { label: "Left/Right Scan", desc: "Scans horizontal midlines to detect pillarbox bars" },
        { label: "Auto Aspect Crop", desc: "Dispatches { width, height, avg } back to player for instant crop" }
      ]
    },
    archNodes: [
      { name: "BlackBarDetection.worker.js", type: "Web Worker", desc: "Heuristic image pixel analysis" },
      { name: "OffscreenCanvas 2D", type: "Hardware Accelerated", desc: "getContext('2d', { willReadFrequently: true })" },
      { name: "face_landmarker.task", type: "MediaPipe Model", desc: "478 3D facial landmarks for avatar filters" },
      { name: "Player Viewport", type: "Auto-Letterbox", desc: "Dynamic CSS clip-path adjusting to video content" }
    ],
    codeTitle: "Exact Source Code: BlackBarDetection.worker.js",
    codeFile: "workers/BlackBarDetection.worker.js",
    codeLang: "javascript",
    code: `// workers/BlackBarDetection.worker.js (Exact Extracted Source with Original Dev Comments)
//CONSIDERING THRESHOLD OF COUNT OF VALUES LESS THAN 25
//YOUTUBES THAT SHOULD NOT HAVE BB REMOVED: RAIN WORLD OST (0.741), KARAOKE SIA (0.71)
//YOUTUBES THAT SHOULD HAVE BB REMOVED: DAVID BOWIE HEROS LIVE (0.53), MERCY KANYE (0.42)

function borderCheck(array) {
  let rgbVal = 0, maxVal = 0;
  array.filter((value, index) => {
    if ((index + 1) % 4 === 0) {
      maxVal = Math.max(maxVal, rgbVal);
      rgbVal = 0;
    } else {
      rgbVal += value;
    }
  });
  return maxVal;
}

self.onmessage = ({ data: { imageBitmap, videoWidth, videoHeight, width, height } }) => {
  const canvas = new OffscreenCanvas(videoWidth, videoHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    self.postMessage({ width: 0.35, height: 0.35, avg: 1 });
    return;
  }
  ctx.drawImage(imageBitmap, 0, 0, videoWidth, videoHeight);

  // Scan Top & Bottom letterbox boundaries
  for (var i = 0.00; i < height; i += 0.01) {
    const blackBorderTop = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height * (1 - i)), 1, 1).data;
    const blackBorderBot = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height * i), 1, 1).data;
    if (blackBorderTop[0] + blackBorderTop[1] + blackBorderTop[2] > 50 ||
        blackBorderBot[0] + blackBorderBot[1] + blackBorderBot[2] > 50) {
      height = i;
      break;
    }
  }

  // Scan Left & Right pillarbox boundaries
  for (var i = 0.00; i < width; i += 0.01) {
    const blackBorderLeft = ctx.getImageData(Math.floor(canvas.width * i), Math.floor(canvas.height / 2), 1, 1).data;
    const blackBorderRight = ctx.getImageData(Math.floor(canvas.width * (1 - i)), Math.floor(canvas.height / 2), 1, 1).data;
    if (blackBorderLeft[0] + blackBorderLeft[1] + blackBorderLeft[2] > 50 ||
        blackBorderRight[0] + blackBorderRight[1] + blackBorderRight[2] > 50) {
      width = i;
      break;
    }
  }
  self.postMessage({ width, height });
};`
  },
  {
    id: "stage-10",
    num: "10",
    title: "Stealth Residential Proxy Mesh & Winsock IAT Hooking",
    category: "Monetization & Forensics",
    badge: "13 PROXY SDKs + IAT HOOK",
    badgeColor: "rose",
    uxTitle: "Stealth Background Daemon & Socket Inspection",
    uxSummary: "The most controversial discovery in Rave Desktop. In the background, Rave spawns indexerHost.child.js containing 13 commercial residential proxy SDKs. It injects a native DLL (iat-meter.node) that hooks Winsock connect() and send(), parses TLS ClientHello SNI and DNS-over-HTTPS (DoH), and bills bandwidth per SDK.",
    wireframe: {
      type: "proxy",
      title: "Background Bandwidth Monetization Architecture",
      elements: [
        { label: "indexerHost Daemon", desc: "Supervised background Node.js process spawned on app start" },
        { label: "13 Proxy SDKs", desc: "Honeygain, AnyIP, Soax, Infatica, Geonode, CashRaven, EarnFM, etc." },
        { label: "iat-meter.node Hook", desc: "Hooks Winsock ws2_32.dll export table to intercept all raw sockets" },
        { label: "SNI & DoH Inspector", desc: "Inspects TLS byte offset 0x05 for handshake and SNI hostname" }
      ]
    },
    archNodes: [
      { name: "indexerHost.child.js", type: "Stealth Child", desc: "Supervises 13 residential proxy provider SDKs" },
      { name: "iat-meter.node", type: "Native C++ DLL", desc: "Hooks ws2_32.dll Import Address Table (IAT)" },
      { name: "TLS SNI Parser", type: "Protocol Sniffer", desc: "Extracts target hostnames from raw TLS packets" },
      { name: "Proxy Bandwidth Meter", type: "Telemetry", desc: "Reports bandwidth consumption per provider to Rave API" }
    ],
    codeTitle: "Socket Monkey-Patching & Winsock IAT Hooking Implementation",
    codeFile: "dist/indexerHost.child.js & node_modules/iat-meter/src/meter.cc",
    codeLang: "javascript",
    code: `// dist/indexerHost.child.js (Decompiled Socket Interception)
const net = require('net');
const iatMeter = require('iat-meter');

// 1. Monkey-patch Node.js Socket prototype to associate sockets with proxy SDKs
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function(...args) {
  trackSocketCreation(this, args);
  try {
    const result = originalConnect.apply(this, args);
    const trackingEntry = activeSocketMap.get(this);
    if (trackingEntry) attachBandwidthListeners(this, trackingEntry);
    return result;
  } catch (err) {
    activeSocketMap.delete(this);
    throw err;
  }
};
console.log("[proxy_bandwidth] socket meter installed");

// 2. The 13 Initialized Residential Proxy SDKs
const PROXY_PROVIDERS = [
  { name: 'Honeygain', ipc: 'internal-hg-sdk:start', type: 'Residential' },
  { name: 'AnyIP', agent: 'AnyIpAgent', type: 'Peer Relay' },
  { name: 'Soax', agent: 'SoaxAgent', type: 'Mobile IP Mesh' },
  { name: 'Infatica', agent: 'InfaticaAgent', type: 'Commercial Proxy' },
  { name: 'EarnFM', sdk: 'earnfm-nodejs-sdk', type: 'Bandwidth Pool' },
  { name: 'Geonode', sdk: 'geonode_sdk', type: 'Residential Node' },
  { name: 'CashRaven', sdk: 'cr_sdk', type: 'Bandwidth Sharing' },
  { name: 'GetPassive', log: '[getPassive]', type: 'Passive Node' },
  { name: 'LiveProxies', agent: 'LiveProxiesAgent', type: 'Rotated Proxy' },
  { name: 'Massive', log: '[Massive]', type: 'Distributed Compute' },
  { name: 'Pawns / IPRoyal', binary: 'libpawns.dll', type: 'P2P Proxy' },
  { name: 'Ports / RedHarvest', log: '[Ports]', type: 'Traffic Router' },
  { name: 'Mellowtel', module: 'mellowtel', type: 'Monetization SDK' }
];

// 3. Winsock IAT Hook Dissection (iat-meter.node)
// Intercepts ws2_32!connect and ws2_32!send. Inspects TLS ClientHello at byte offset:
// [0x00] ContentType = 22 (Handshake) -> [0x05] HandshakeType = 1 (ClientHello)
// Parses Server Name Indication (SNI) extension (0x0000) to log target domain.`
  },
  {
    id: "stage-11",
    num: "11",
    title: "Master IPC Highway & Electron Protocol Catalog",
    category: "Architecture Matrix",
    badge: "100 HANDLES + 35 ONS",
    badgeColor: "emerald",
    uxTitle: "The Complete Inter-Process Communication Highway",
    uxSummary: "Rave is a distributed multi-process system coordinated entirely over Electron IPC. This catalog maps all 100 ipcMain.handle channels and 35 ipcMain.on channels across all functional subsystems, forming the complete protocol blueprint of the application.",
    wireframe: {
      type: "ipc",
      title: "Electron Multi-Window IPC Topology",
      elements: [
        { label: "Main Process", desc: "Supervises 5 windows and 2 background child daemons" },
        { label: "100 ipcMain.handle", desc: "Asynchronous Request-Response RPC interface with renderer" },
        { label: "35 ipcMain.on", desc: "Unidirectional fire-and-forget event bus" },
        { label: "ContextBridge", desc: "Securely exposes whitelisted APIs to renderer namespaces" }
      ]
    },
    archNodes: [
      { name: "ipcMain (Core)", type: "Message Router", desc: "Dispatches requests across threads" },
      { name: "22 dm:* Handlers", type: "Direct Messaging", desc: "SQLite storage, reactions, threads, pagination" },
      { name: "Monetization IPC", type: "Bandwidth Control", desc: "internal-hg-sdk:*, SET_PRIAPUS_INTERCEPTOR" },
      { name: "Window Controls", type: "UI Lifecycle", desc: "create-dm-window, challenge-show, Set_Zoom" }
    ],
    codeTitle: "Master IPC Matrix: Categorized Catalog of 100 Handles & 35 Ons",
    codeFile: "dist/main.prod.js & dist/preload.js",
    codeLang: "javascript",
    code: `// REA Master IPC Catalog: Complete Functional Mapping of Rave Desktop

// 1. Direct Messaging & SQLite Engine (22 handles)
const DM_IPC_HANDLES = [
  'dm:beginSession', 'dm:endSession', 'dm:applyFetchedPage', 'dm:clearAllData',
  'dm:getMessage', 'dm:getMessageByServerId', 'dm:getMessagesByServerIds',
  'dm:getLatestMessageId', 'dm:getLatestItemForThread', 'dm:getAllDrafts',
  'dm:getDraft', 'dm:deleteDraft', 'dm:getAllUnseenCounts', 'dm:getNotificationItemsByServerIds',
  'dm:getReactionsByServerIds', 'dm:getReactionsForMessage', 'dm:getReactionsForMessages',
  'dm:getCorrelateIdsByThread', 'dm:getExpiryChange', 'dm:getExpiryChangeByCorrelateId',
  'dm:deleteExpiredMessages', 'dm:deleteExpiredSeenMessages'
];

// 2. Window Lifecycle & Challenge Popups
const WINDOW_HANDLES = [
  'create-dm-window', 'destroy-dm-window', 'challenge-show', 'add-window-style-flag',
  'disable-renderer-power-throttling', 'copy-image-to-clipboard', 'abort-social-login',
  'SESSION_PROXY_METHOD'
];

// 3. Core Event Bus (Sample of 35 ipcMain.on channels)
const CORE_IPC_ONS = [
  'SET_PRIAPUS_INTERCEPTOR',    // Web scraping & traffic proxying
  'lantern-app-device-id',      // Censorship circumvention proxy
  'ntp-delta',                  // Global atomic clock broadcast
  'go-to-mesh',                 // Watch party room join
  'challenge-cancel',           // Bot challenge dismiss
  'freestar-register-webview',  // In-app ad banner registration
  'adsense-register-webview',   // Google AdSense container
  'ad-register-webview',        // Generic ad placement
  'dm-trigger-hanging-get',     // Long-polling message fetch
  'language-detect-result',     // MediaPipe translation return
  'get-initial-translations',   // Localization payload
  'Set_Zoom',                   // Dynamic UI scaling
  'app-logout',                 // Session teardown
  'app-close-completed'         // Graceful shutdown sync
];`
  }
];
