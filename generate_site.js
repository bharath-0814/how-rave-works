const fs = require('fs');
const path = require('path');

const siteDir = 'D:/GitHub/how-rave-works';

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How Rave Works: Under the Hood of a Global Media Watch Party Engine</title>
  <meta name="description" content="An exhaustive, evidence-based reverse engineering deep-dive into Rave Desktop using REA. Examining its custom NTPv4 clock synchronizer, YouTube BotGuard VM minter, Google Drive webview hijacker, Android MCS push notification emulator, and residential proxy mesh.">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#fdf2f8',
              100: '#fce7f3',
              400: '#f472b6',
              500: '#ec4899',
              600: '#db2777',
              cyan: '#06b6d4',
              violet: '#8b5cf6',
              amber: '#f59e0b',
              emerald: '#10b981'
            },
            dark: {
              950: '#090a0f',
              900: '#0f111a',
              850: '#151824',
              800: '#1c2030',
              700: '#2b3147',
              600: '#404968'
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
            mono: ['Fira Code', 'monospace']
          }
        }
      }
    }
  </script>
  
  <!-- Prism.js for syntax highlighting -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>

  <style>
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0f111a; }
    ::-webkit-scrollbar-thumb { background: #2b3147; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #404968; }

    .glow-pink { box-shadow: 0 0 50px -10px rgba(236, 72, 153, 0.25); }
    .glow-cyan { box-shadow: 0 0 50px -10px rgba(6, 182, 212, 0.25); }
    .glow-card { border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(21, 24, 36, 0.65); backdrop-filter: blur(12px); }
    .glow-card:hover { border-color: rgba(236, 72, 153, 0.3); }
    
    code[class*="language-"], pre[class*="language-"] {
      background: #090a0f !important;
      font-size: 0.875rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .toc-item.active {
      color: #ec4899;
      font-weight: 600;
      border-left-color: #ec4899;
    }
  </style>
</head>
<body class="bg-dark-950 text-slate-300 antialiased font-sans selection:bg-brand-500 selection:text-white">

  <!-- Reading Progress Bar -->
  <div id="progress-bar" class="fixed top-0 left-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-500 to-brand-violet z-50 transition-all duration-75" style="width: 0%"></div>

  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-brand-500/20">R</div>
        <div class="flex items-center gap-2">
          <span class="font-display font-bold text-white text-lg tracking-tight">How Rave Works</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">REA Deep-Dive</span>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm font-medium">
        <a href="#toc" class="text-slate-400 hover:text-white transition">Sections</a>
        <a href="#architecture" class="text-slate-400 hover:text-white transition hidden md:block">Architecture</a>
        <a href="#sync-engine" class="text-slate-400 hover:text-white transition hidden md:block">NTP Sync</a>
        <a href="#botguard" class="text-slate-400 hover:text-white transition hidden md:block">BotGuard</a>
        <a href="#monetization" class="text-slate-400 hover:text-white transition hidden md:block">Proxy Mesh</a>
        <a href="https://github.com/bharath-0814/how-rave-works" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white border border-dark-700 flex items-center gap-2 transition">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-dark-800">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(236,72,153,0.15),rgba(255,255,255,0))]"></div>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-mono mb-8 uppercase tracking-wider">
        <span>Reverse Engineering Analysis</span>
        <span>•</span>
        <span>Rave Desktop v1.18.32</span>
      </div>
      
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-6">
        How Rave Works: <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-brand-cyan">Under the Hood</span> of a Global Watch Party Engine
      </h1>
      
      <p class="max-w-3xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed font-normal mb-10">
        An exhaustive, binary-and-source technical breakdown of Rave Desktop. Discover how it achieves sub-10ms global sync via custom NTPv4, executes YouTube's BotGuard VM in memory to mint PO tokens, hijacks Google Drive via webview injection, and runs a silent 13-SDK residential proxy mesh to subsidize free video infrastructure.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 border-t border-dark-800/80 pt-8">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>45 min comprehensive read</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span>Tool: REA (Reverse Engineer Anything)</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>Target Build: November 2026</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Key Metrics Ribbon -->
  <section class="border-b border-dark-800 bg-dark-900/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div class="p-4 rounded-xl glow-card">
          <div class="text-3xl font-display font-extrabold text-brand-cyan mb-1">&lt; 10 ms</div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-medium">Clock Skew (NTPv4)</div>
        </div>
        <div class="p-4 rounded-xl glow-card">
          <div class="text-3xl font-display font-extrabold text-brand-500 mb-1">13</div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-medium">Residential Proxy SDKs</div>
        </div>
        <div class="p-4 rounded-xl glow-card">
          <div class="text-3xl font-display font-extrabold text-brand-violet mb-1">100+</div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-medium">IPC Main Handlers</div>
        </div>
        <div class="p-4 rounded-xl glow-card">
          <div class="text-3xl font-display font-extrabold text-brand-emerald mb-1">115 MB</div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-medium">Unpacked ASAR Bundle</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      <!-- Sticky Sidebar Navigation -->
      <aside class="hidden lg:block lg:col-span-3">
        <div class="sticky top-24 space-y-6">
          <div class="p-5 rounded-2xl glow-card">
            <h3 class="font-display font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
              Table of Contents
            </h3>
            <nav id="toc" class="space-y-1.5 text-xs font-medium border-l border-dark-700 pl-3">
              <a href="#methodology" class="toc-item block py-1 text-slate-400 hover:text-white transition">1. REA Methodology & Target</a>
              <a href="#architecture" class="toc-item block py-1 text-slate-400 hover:text-white transition">2. Process Architecture & Topology</a>
              <a href="#fuses" class="toc-item block py-1 text-slate-400 hover:text-white transition">3. Electron Fuses & Hardening</a>
              <a href="#sync-engine" class="toc-item block py-1 text-slate-400 hover:text-white transition">4. The Core Clock Sync Engine</a>
              <a href="#youtube-botguard" class="toc-item block py-1 text-slate-400 hover:text-white transition">5. YouTube & BotGuard VM Minter</a>
              <a href="#google-drive" class="toc-item block py-1 text-slate-400 hover:text-white transition">6. Google Drive Webview Hijacking</a>
              <a href="#streaming-providers" class="toc-item block py-1 text-slate-400 hover:text-white transition">7. Netflix, Prime & DRM Players</a>
              <a href="#audio-worklets" class="toc-item block py-1 text-slate-400 hover:text-white transition">8. Low-Latency Audio Pipeline</a>
              <a href="#computer-vision" class="toc-item block py-1 text-slate-400 hover:text-white transition">9. Vision & Black Bar Detection</a>
              <a href="#mcs-push" class="toc-item block py-1 text-slate-400 hover:text-white transition">10. Android Push Notification Trick</a>
              <a href="#sqlite-dm" class="toc-item block py-1 text-slate-400 hover:text-white transition">11. Direct Messaging & SQLite</a>
              <a href="#monetization" class="toc-item block py-1 text-slate-400 hover:text-white transition">12. The Residential Proxy Mesh</a>
              <a href="#iat-meter" class="toc-item block py-1 text-slate-400 hover:text-white transition">13. Winsock Hooking & iat-meter</a>
              <a href="#priapus-client" class="toc-item block py-1 text-slate-400 hover:text-white transition">14. Distributed Web Scraping</a>
              <a href="#takeaways" class="toc-item block py-1 text-slate-400 hover:text-white transition">15. Architectural Takeaways</a>
            </nav>
          </div>

          <div class="p-5 rounded-2xl glow-card text-xs space-y-3">
            <div class="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              Analysis Target
            </div>
            <div class="text-slate-400">
              <p><strong class="text-white">App:</strong> Rave Desktop</p>
              <p><strong class="text-white">Version:</strong> 1.18.32</p>
              <p><strong class="text-white">Engine:</strong> Electron v33+ / Node.js</p>
              <p><strong class="text-white">Platform:</strong> Windows 11 x64 (NTFS)</p>
              <p><strong class="text-white">ASAR SHA-256:</strong> <span class="font-mono text-[10px] break-all text-slate-500">fcc90474a593bcd3215a1b9a5a28512986a7987510386edca1d2245aef0ee769</span></p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Article Body -->
      <article class="lg:col-span-9 space-y-16 text-slate-300 leading-relaxed text-base">

        <!-- Section 1 -->
        <section id="methodology" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">01 / OVERVIEW</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Introduction & REA Reverse Engineering Methodology
          </h2>

          <p>
            <strong>Rave</strong> is one of the world's most popular synchronous media streaming platforms, allowing millions of users across Android, iOS, macOS, and Windows to watch YouTube, Netflix, Disney+, Amazon Prime, and Google Drive videos together in synchronized watch party rooms (internally designated as <em>"Meshes"</em>).
          </p>

          <p>
            While building a simple watch party proof-of-concept is straightforward, scaling it across commercial third-party streaming sites is notoriously difficult. Streaming giants employ strict anti-bot measures (Google's BotGuard, YouTube's SABR and Proof-of-Origin tokens), DRM pipelines (Widevine L1/L3), dynamic iframe sandboxing, and non-standard player APIs. Furthermore, synchronizing media across clients experiencing diverse network jitter and clock skews without audio stutter requires sophisticated clock distribution.
          </p>

          <p>
            Using <strong>REA (Reverse Engineer Anything)</strong>—a local, evidence-first reverse engineering tool suite and MCP server—we performed an in-depth forensic investigation of the Windows production release of Rave Desktop (v1.18.32).
          </p>

          <div class="p-5 rounded-2xl glow-card border-l-4 border-l-brand-cyan">
            <h4 class="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              REA Investigation Protocol
            </h4>
            <p class="text-sm text-slate-400">
              REA’s <code class="font-mono text-cyan-300">inspect_electron_fuses</code> probed runtime switch states directly from PE headers; <code class="font-mono text-cyan-300">open_binary</code> mapped the 115 MB <code class="font-mono text-cyan-300">app.asar</code> container; <code class="font-mono text-cyan-300">inspect_artifact</code> generated the complete 4,084-node content-addressed asset DAG; and <code class="font-mono text-cyan-300">extract_artifact</code> isolated companion native C++ DLLs, protobuf definitions, AudioWorklet processors, and background child workers for static disassembly and AST decompilation.
            </p>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="architecture" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">02 / ARCHITECTURE</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Process Architecture & Electron Topology
          </h2>

          <p>
            Unlike typical single-window Electron applications, Rave Desktop implements a segregated multi-process topology composed of isolated browser windows, dedicated Node.js child processes, and Web Audio worklets.
          </p>

          <!-- SVG Diagram: Architecture -->
          <div class="p-6 rounded-2xl glow-card overflow-x-auto">
            <h4 class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 text-center">Rave Desktop Process & IPC Communication Topology</h4>
            <svg class="w-full min-w-[700px] h-96" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Main Process Box -->
              <rect x="260" y="20" width="280" height="90" rx="12" fill="#1c2030" stroke="#ec4899" stroke-width="2"/>
              <text x="400" y="50" text-anchor="middle" fill="#ffffff" font-family="Inter" font-weight="700" font-size="14">Main Electron Process</text>
              <text x="400" y="72" text-anchor="middle" fill="#f472b6" font-family="Fira Code" font-size="11">dist/main.prod.js (12.0 MB)</text>
              <text x="400" y="90" text-anchor="middle" fill="#94a3b8" font-family="Inter" font-size="10">NTP Sync, SQLite DB, IPC Hub, Acrylic Blur</text>

              <!-- Renderer Windows -->
              <rect x="20" y="180" width="210" height="75" rx="10" fill="#151824" stroke="#06b6d4" stroke-width="1.5"/>
              <text x="125" y="205" text-anchor="middle" fill="#ffffff" font-family="Inter" font-weight="600" font-size="13">Primary Video Window</text>
              <text x="125" y="224" text-anchor="middle" fill="#06b6d4" font-family="Fira Code" font-size="10">app.html #/mesh/:id</text>
              <text x="125" y="240" text-anchor="middle" fill="#94a3b8" font-family="Inter" font-size="10">VideoJS, MSE, Shaka, Webviews</text>

              <rect x="250" y="180" width="210" height="75" rx="10" fill="#151824" stroke="#8b5cf6" stroke-width="1.5"/>
              <text x="355" y="205" text-anchor="middle" fill="#ffffff" font-family="Inter" font-weight="600" font-size="13">Direct Message Window</text>
              <text x="355" y="224" text-anchor="middle" fill="#8b5cf6" font-family="Fira Code" font-size="10">dm-window.html</text>
              <text x="355" y="240" text-anchor="middle" fill="#94a3b8" font-family="Inter" font-size="10">Separate Redux Sync / Thread DB</text>

              <!-- Child Processes -->
              <rect x="480" y="180" width="140" height="75" rx="10" fill="#151824" stroke="#f59e0b" stroke-width="1.5"/>
              <text x="550" y="205" text-anchor="middle" fill="#ffffff" font-family="Inter" font-weight="600" font-size="12">Indexer Host</text>
              <text x="550" y="224" text-anchor="middle" fill="#f59e0b" font-family="Fira Code" font-size="10">indexerHost.child.js</text>
              <text x="550" y="240" text-anchor="middle" fill="#94a3b8" font-family="Inter" font-size="10">13 Proxy SDKs</text>

              <rect x="640" y="180" width="140" height="75" rx="10" fill="#151824" stroke="#10b981" stroke-width="1.5"/>
              <text x="710" y="205" text-anchor="middle" fill="#ffffff" font-family="Inter" font-weight="600" font-size="12">Switchboard</text>
              <text x="710" y="224" text-anchor="middle" fill="#10b981" font-family="Fira Code" font-size="10">switchboard.child.js</text>
              <text x="710" y="240" text-anchor="middle" fill="#94a3b8" font-family="Inter" font-size="10">P2P Relay & Proxy</text>

              <!-- Workers -->
              <rect x="20" y="295" width="210" height="50" rx="8" fill="#0f111a" stroke="#404968" stroke-width="1"/>
              <text x="125" y="316" text-anchor="middle" fill="#e2e8f0" font-family="Inter" font-size="11">AudioWorklets & BBD Worker</text>
              <text x="125" y="332" text-anchor="middle" fill="#64748b" font-family="Fira Code" font-size="9">PCM Int16, RMS, Aspect Ratio</text>

              <rect x="480" y="295" width="300" height="50" rx="8" fill="#0f111a" stroke="#404968" stroke-width="1"/>
              <text x="630" y="316" text-anchor="middle" fill="#e2e8f0" font-family="Inter" font-size="11">Native C++ Addons (iat-meter, peer_ffi, hopmn)</text>
              <text x="630" y="332" text-anchor="middle" fill="#64748b" font-family="Fira Code" font-size="9">Winsock hooks, DoH snooping, DLL FFI</text>

              <!-- Connectors -->
              <path d="M330 110 L125 180" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4 4"/>
              <path d="M380 110 L355 180" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4 4"/>
              <path d="M470 110 L550 180" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4"/>
              <path d="M510 110 L710 180" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 4"/>
              <path d="M125 255 L125 295" stroke="#404968" stroke-width="1"/>
              <path d="M550 255 L580 295" stroke="#404968" stroke-width="1"/>
              <path d="M710 255 L680 295" stroke="#404968" stroke-width="1"/>
            </svg>
          </div>

          <p>
            The main application window (<code class="font-mono text-pink-400">app.html</code>) mounts the React/Redux UI and renders the active room view. A secondary frameless window (<code class="font-mono text-purple-400">dm-window.html</code>) runs concurrently for Direct Messages, keeping chats open even when the main theater is fullscreened. A third window (<code class="font-mono text-slate-400">notification-window.html</code>) acts as a custom translucent notification overlay.
          </p>

          <p>
            Crucially, heavy background operations—specifically the bandwidth monetization SDKs and P2P proxy routing—are evicted from the UI threads into two unthrottled Node.js worker processes spawned via <code class="font-mono text-amber-300">child_process.fork()</code>: <code class="font-mono text-amber-300">indexerHost.child.js</code> and <code class="font-mono text-emerald-300">switchboard.child.js</code>.
          </p>
        </section>

        <!-- Section 3 -->
        <section id="fuses" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">03 / SECURITY ANALYSIS</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Electron Fuses & Binary Hardening
          </h2>

          <p>
            Using REA's <code class="font-mono text-pink-400">inspect_electron_fuses</code> tool against <code class="font-mono text-slate-300">Rave.exe</code> (SHA-256: <code class="font-mono text-xs text-slate-500">d20964aa65838092e2172fb9c9ebf7384232e0c8e5bcdcc7f4764954af3455d8</code>), we inspected the packaged binary's fuse bytes at file offset <code class="font-mono text-xs">192146224</code>:
          </p>

          <!-- Fuses Table -->
          <div class="overflow-x-auto rounded-xl border border-dark-700">
            <table class="w-full text-left text-sm">
              <thead class="bg-dark-800 text-slate-300 uppercase font-mono text-xs">
                <tr>
                  <th class="p-3">Fuse Name</th>
                  <th class="p-3">State</th>
                  <th class="p-3">Raw Byte</th>
                  <th class="p-3">Security & Architectural Implication</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-800 bg-dark-900/60 font-mono text-xs">
                <tr>
                  <td class="p-3 font-semibold text-white">RunAsNode</td>
                  <td class="p-3 text-emerald-400">ENABLED</td>
                  <td class="p-3">49 ('1')</td>
                  <td class="p-3 font-sans text-slate-400">Allows running <code class="text-pink-400">ELECTRON_RUN_AS_NODE=1 Rave.exe</code> as a raw Node.js runtime. Required for spawning child workers.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">EnableCookieEncryption</td>
                  <td class="p-3 text-rose-400">DISABLED</td>
                  <td class="p-3">48 ('0')</td>
                  <td class="p-3 font-sans text-slate-400">Session cookies are stored unencrypted on disk in the Chromium profile, facilitating cross-session reflection.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">EnableNodeCliInspectArguments</td>
                  <td class="p-3 text-emerald-400">ENABLED</td>
                  <td class="p-3">49 ('1')</td>
                  <td class="p-3 font-sans text-slate-400">Honors <code class="text-pink-400">--inspect</code> arguments, permitting DevTools attachment to child workers.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">EnableEmbeddedAsarIntegrityValidation</td>
                  <td class="p-3 text-rose-400">DISABLED</td>
                  <td class="p-3">48 ('0')</td>
                  <td class="p-3 font-sans text-slate-400">No header checksum enforcement on <code class="text-slate-300">app.asar</code>. Unpacked native binaries can deviate from archive hashes.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">OnlyLoadAppFromAsar</td>
                  <td class="p-3 text-rose-400">DISABLED</td>
                  <td class="p-3">48 ('0')</td>
                  <td class="p-3 font-sans text-slate-400">Electron is permitted to load code from raw filesystem paths outside the ASAR archive.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            These settings reveal intentional architectural trade-offs: Rave explicitly enables <code class="font-mono text-pink-400">RunAsNode</code> so that the main executable can double as the Node.js runner for <code class="font-mono text-amber-300">indexerHost.child.js</code> and <code class="font-mono text-emerald-300">switchboard.child.js</code> without packaging an independent Node runtime binary.
          </p>
        </section>

        <!-- Section 4 -->
        <section id="sync-engine" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">04 / CORE SYNC ENGINE</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            The Core Clock Sync Engine: Achieving Sub-10ms Global Synchronization
          </h2>

          <p>
            When two users in London and Tokyo watch a 4K movie together, client system clocks routinely diverge by 50ms to 3,000ms. Standard WebRTC or WebSocket timestamping without clock normalization results in noticeable audio echo, lip-flap divergence, and seek fighting.
          </p>

          <p>
            Rave solves this with an authentic <strong>NTPv4 (Network Time Protocol) client engine</strong> embedded directly inside the Electron main process (<code class="font-mono text-pink-400">dist/main.prod.js</code>, Module 72459).
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-4">
            <h4 class="font-bold text-white text-base">The NTPv4 Distribution Algorithm: Step-by-Step</h4>
            
            <ol class="list-decimal list-inside space-y-3 text-sm text-slate-300">
              <li>
                <strong class="text-white">Multi-Continent Pool Resolution:</strong> The engine queries an array of 25 global NTP servers spanning pool.ntp.org clusters across the US, UK, Europe, Asia, Oceania, South America, and Africa, as well as Google (<code class="font-mono text-cyan-300">time.google.com</code>), Cloudflare (<code class="font-mono text-cyan-300">time.cloudflare.com</code>), and Apple (<code class="font-mono text-cyan-300">time.apple.com</code>).
              </li>
              <li>
                <strong class="text-white">8-Sample Statistical Filtering:</strong> For each polling burst, 8 independent NTP packets are exchanged. The engine checks packet version (<code class="font-mono text-pink-400">version === 4</code>), rejects unsynchronized remote servers (<code class="font-mono text-pink-400">stratum &gt;= 16</code> or leapIndicator 3), validates root dispersion (&lt; 16s), and discards future timestamps.
              </li>
              <li>
                <strong class="text-white">Sliding Window Averaging:</strong> The resulting offsets are collected into a 60-element rolling array (<code class="font-mono text-cyan-300">this.ntpAggregate</code>). Outliers exceeding the standard deviation are pruned:
                <pre class="my-2"><code class="language-javascript">this.cachedNtpDelta = Math.round(
  this.ntpAggregate.reduce((e, t) => e + t) / this.ntpAggregate.length * 1e4
) / 1e4;</code></pre>
              </li>
              <li>
                <strong class="text-white">IPC Broadcast Heartbeat:</strong> Every 4,000ms (<code class="font-mono text-slate-300">timeoutDuration = 4000</code>), the main process pushes the smoothed delta to all active windows over IPC channel <code class="font-mono text-pink-400">ntp-delta</code>:
                <pre class="my-2"><code class="language-javascript">this.broadcastNtpDelta = async (e) => {
  const t = await e;
  this.getMainWindow()?.webContents.send("ntp-delta", t);
  this.getDMWindow?.()?.webContents.send("ntp-delta", t);
};</code></pre>
              </li>
              <li>
                <strong class="text-white">Video Player Playback Adjustment:</strong> When a user plays or seeks, their client transmits the current video timestamp coupled with the local NTP-corrected timestamp:
                <div class="bg-dark-900 p-3 rounded-lg font-mono text-xs text-brand-cyan my-2">
                  UniversalMediaTime = LocalVideoCurrentTime - (SystemClock + ntpDelta)
                </div>
                If a peer's video drifts by &gt; 500ms, a hard seek (<code class="font-mono text-pink-400">jumpToTimeStamp</code>) is triggered. If the drift is between 30ms and 500ms, the player adjusts <code class="font-mono text-pink-400">HTMLMediaElement.playbackRate</code> between 0.95x and 1.05x, gently re-aligning audio without audible pitch pops!
              </li>
            </ol>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="youtube-botguard" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">05 / REVERSE ENGINEERING HACKS</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            YouTube & BotGuard VM Minter: Defeating SABR & Proof-of-Origin
          </h2>

          <p>
            In late 2024 and 2025, YouTube aggressively rolled out <strong>SABR (Server-side Ad Insertion and Bitrate Routing)</strong> alongside <strong>Proof-of-Origin (PO Tokens)</strong>. Any third-party player or video streaming scraper that requests YouTube video streams without a valid, cryptographically signed BotGuard attestation token receives an immediate HTTP 403 Forbidden or throttled 360p stream.
          </p>

          <p>
            Rave's engineers designed an extraordinary solution: they packaged a complete <strong>in-memory BotGuard VM runner</strong> directly in the production bundle (<code class="font-mono text-pink-400">dist/botGuardScript.js</code>).
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-4">
            <h4 class="font-bold text-white text-base">The BotGuard VM Token Minting Pipeline</h4>

            <p class="text-sm text-slate-300">
              When a user loads a YouTube watch party, Rave does not rely on static API keys or hardcoded cookies. It dynamically simulates Google's challenge-response protocol:
            </p>

            <pre><code class="language-javascript">// 1. Fetch live YouTube HTML and extract Google's attestation challenge
const t = await fetch("https://www.youtube.com", { headers: { Accept: "*/*" } });
const e = await t.text();
const n = e.match(/ytcfg\\.set\\(({.+?}\\));/s)?.[1];
window.yt = { config_: JSON.parse(n) };

const r = e.match(/window\\.ytAtN\\(\\s*({[\\s\\S]*?})\\s*\\)/);
const bgChallenge = JSON.parse(r[1]).R.bgChallenge;

// 2. Download and execute Google's dynamic BotGuard VM interpreter
const interpreterUrl = bgChallenge.interpreterUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;
const interpreterCode = await (await fetch("https:" + interpreterUrl)).text();
new Function(interpreterCode)(); // Instantiates VM in global context

// 3. Instantiate VM instance and capture cryptographic snapshot
const vmInstance = await BotGuardVM.create({
  program: bgChallenge.program,
  globalName: bgChallenge.globalName,
  globalObject: window
});
const signalOutput = [];
const snapshot = await vmInstance.snapshot({ webPoSignalOutput: signalOutput }, 10000);

// 4. Send snapshot to YouTube's gRPC-Web endpoint
const itResponse = await fetch("https://www.youtube.com/api/jnn/v1/GenerateIT", {
  method: "POST",
  headers: {
    "content-type": "application/json+protobuf",
    "x-goog-api-key": "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw",
    "x-user-agent": "grpc-web-javascript/0.1"
  },
  body: JSON.stringify(["O43z0dpjhgX20SCx4KAo", snapshot])
});

// 5. Mint websafe Proof-of-Origin token for video stream requests
const [integrityToken, expiryOffset] = await itResponse.json();
const minter = await Minter.create({ integrityToken }, signalOutput);
const poToken = await minter.mintAsWebsafeString(videoId);</code></pre>
          </div>

          <p>
            By executing Google's obfuscated virtual machine bytecode inside the Electron renderer and communicating over gRPC-web, Rave continuously mints fresh, valid Proof-of-Origin tokens that allow seamless, uninterrupted YouTube streaming across all room participants without triggering bot-detection blocks.
          </p>
        </section>

        <!-- Section 6 -->
        <section id="google-drive" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">06 / DOM & PROTOCOL HIJACKING</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Google Drive Webview Hijacking: CSS Theming, Query Rewriting & Credential Capture
          </h2>

          <p>
            Streaming a private Google Drive video to multiple users in a watch party normally requires OAuth2 scopes, quota limits, and Google Drive API billing. Rave bypasses this entirely through a sophisticated webview hijacking technique located in <code class="font-mono text-pink-400">dist/googleDriveWebviewPreload.js</code>.
          </p>

          <div class="space-y-4">
            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-cyan">Phase 1: Full DOM Re-Theming via webFrame.insertCSS</h4>
              <p class="text-sm text-slate-400">
                When a user opens the Google Drive picker inside Rave, Rave loads the real <code class="font-mono text-slate-300">drive.google.com</code> web page inside an Electron <code class="font-mono text-pink-400">&lt;webview&gt;</code>. Immediately upon document creation, Rave injects over 100 lines of custom CSS using <code class="font-mono text-pink-400">webFrame.insertCSS()</code>, completely hiding Google Drive's UI buttons, navbar, and toolbars, and styling the file grid with dark translucent acrylic backgrounds (<code class="font-mono text-slate-300">backdrop-filter: blur(5px)</code>) so it looks like a native Rave UI widget!
              </p>
            </div>

            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-pink">Phase 2: Network Query Mutation (Monkey-Patching fetch and XHR)</h4>
              <p class="text-sm text-slate-400">
                Rave monkey-patches both <code class="font-mono text-pink-400">window.fetch</code> and <code class="font-mono text-pink-400">XMLHttpRequest.prototype.open / send</code> inside Google Drive's browsing context. Whenever Drive makes internal <code class="font-mono text-slate-300">items:list</code> or <code class="font-mono text-slate-300">items:get</code> API calls, Rave intercepts the payload on the fly:
              </p>
              <pre><code class="language-javascript">// Rave automatically mutates the search query sent to Google servers:
if (isSearch) {
  let query = originalQuery;
  if (!query.includes(" type:video")) query += " type:video";
  if (!query.includes(" type:matroska")) query += " type:matroska";
  if (!query.includes(" type:folder")) query += " type:folder";
  payload[0][19] = query; // Injected into Google Drive RPC body!
}</code></pre>
            </div>

            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-emerald">Phase 3: Capturing SAPISIDHASH and Google Drive __initData</h4>
              <p class="text-sm text-slate-400">
                When the user clicks any video thumbnail, Rave blocks Google's default video player modal (<code class="font-mono text-pink-400">e.preventDefault(); e.stopPropagation();</code>). It inspects Google Drive's global <code class="font-mono text-slate-300">__initData</code> object, extracts the internal <code class="font-mono text-emerald-400">SAPISIDHASH</code> generator function from the window scope, computes the authentication hash, and passes the raw file ID, resource key, and auth hash back to the Rave main process:
              </p>
              <pre><code class="language-javascript">const sapisidHashFunc = Object.entries(window).find(
  ([k, v]) => typeof v === "function" && v.toString().includes("SAPISIDHASH")
)[1];
const authHash = sapisidHashFunc([{ key: "u", value: googleUserId }]);

console.log("video data", JSON.stringify({
  id: fileId,
  resourcekey: resourceKey,
  timestampHash: authHash,
  apiKey: __initData[0][...][36]
}));</code></pre>
            </div>
          </div>
        </section>

        <!-- Section 7 -->
        <section id="streaming-providers" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">07 / STREAMING PROVIDERS</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Netflix, Amazon Prime & DRM Media Handling
          </h2>

          <p>
            For premium subscription platforms (Netflix, Amazon Prime Video, Disney+, HBO Max, and Crunchyroll), users must authenticate with their own credentials. However, Rave must synchronize playback across users who may have different video server routing.
          </p>

          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex items-start gap-2">
              <span class="text-brand-500 font-bold">•</span>
              <div>
                <strong class="text-white">Netflix Cookie Interception:</strong> Handled via IPC channels <code class="font-mono text-pink-400">netflix_get_cookies</code> and <code class="font-mono text-pink-400">netflix_get_cookies_response</code>. Rave monitors the Netflix browsing session, captures authentication tokens, and extracts the MPEG-DASH manifest (<code class="font-mono text-cyan-300">mpdVideoStream</code>) to synchronize playback position.
              </div>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-500 font-bold">•</span>
              <div>
                <strong class="text-white">Amazon Shaka Player Hooks:</strong> In <code class="font-mono text-slate-300">dist/common.prod.js</code>, Rave implements custom interceptors for Google's Shaka Player: <code class="font-mono text-xs text-amber-300">"Amazon shaka filter: service cert challenge but no cached cert"</code>, managing license challenge caching for Widevine DRM handshakes.
              </div>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-500 font-bold">•</span>
              <div>
                <strong class="text-white">SoundCloud Waveform & Transcoding:</strong> Intercepts SoundCloud client APIs to resolve transcoded HLS stream URLs and renders custom interactive audio waveforms with synchronized user comment bubbles.
              </div>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-brand-500 font-bold">•</span>
              <div>
                <strong class="text-white">Bitmap Subtitle Renderer:</strong> Implements a custom PGS (Presentation Graphic Stream) Blu-ray/DVD subtitle decoder in JavaScript, blitting decoded bitmap subtitles onto a canvas overlaid on top of native video elements.
              </div>
            </li>
          </ul>
        </section>

        <!-- Section 8 -->
        <section id="audio-worklets" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">08 / AUDIO WORKLETS</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Low-Latency Audio Pipeline & Voice Chat
          </h2>

          <p>
            Rave allows friends to talk over VoIP in watch party rooms without muting the shared movie audio. To minimize audio thread latency on the CPU, Rave implements three custom <strong>AudioWorkletProcessors</strong> running directly on the browser's dedicated high-priority audio rendering thread:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-5 rounded-xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-cyan">AudioInputProcessor.js</h4>
              <p class="text-xs text-slate-400">
                Pulls 128-sample chunks from the microphone input, converts 32-bit floating-point samples to 16-bit signed PCM integers (<code class="font-mono text-pink-400">tmp &lt; 0 ? tmp * 0x8000 : tmp * 0x7FFF</code>), and ships them via <code class="font-mono text-pink-400">this.port.postMessage</code> directly to the Opus encoder.
              </p>
            </div>
            <div class="p-5 rounded-xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-500">AudioOutputProcessor.js</h4>
              <p class="text-xs text-slate-400">
                Maintains a ring-buffer queue of incoming peer PCM packets. Dispatches audio slices into the speaker output channel without blocking the main event loop, handling jitter and sample starvation seamlessly.
              </p>
            </div>
            <div class="p-5 rounded-xl glow-card space-y-2">
              <h4 class="font-bold text-white text-sm text-brand-violet">AudioVolumeProcessor.js</h4>
              <p class="text-xs text-slate-400">
                Calculates Root-Mean-Square (RMS) audio energy in real time. Applies a custom exponential "fast attack, slow release" smoothing envelope (<code class="font-mono text-pink-400">Math.max(rms, volume * averaging)</code>) to drive avatar speaking indicators.
              </p>
            </div>
          </div>

          <p>
            Furthermore, Rave bundles <code class="font-mono text-pink-400">@jitsi/rnnoise-wasm</code>—a WebAssembly port of Mozilla/Xiph's RNNoise deep learning recurrent neural network—to perform real-time noise suppression, removing keyboard clicks and room echo before voice transmission.
          </p>
        </section>

        <!-- Section 9 -->
        <section id="computer-vision" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">09 / COMPUTER VISION</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Computer Vision: Aspect Ratio & Black Bar Detection
          </h2>

          <p>
            Videos on YouTube and streaming sites frequently feature hardcoded letterboxing (black bars on top/bottom) or pillarboxing (black bars on left/right). When multiple users watch on displays with varying aspect ratios (ultrawide monitors vs laptops vs phones), double black bars occur.
          </p>

          <p>
            Rave solves this with an image processing Web Worker: <code class="font-mono text-pink-400">workers/BlackBarDetection.worker.js</code>.
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-3">
            <h4 class="font-bold text-white text-sm">How BlackBarDetection Analyzes Frames</h4>
            <p class="text-sm text-slate-400">
              The worker instantiates an <code class="font-mono text-pink-400">OffscreenCanvas(videoWidth, videoHeight)</code> and grabs video frame image bitmaps:
            </p>
            <ol class="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>It computes the global image dark pixel average (pixels with RGB channels &lt; 25).</li>
              <li>It samples top and bottom horizontal scanlines, stepping inwards until RGB sum &gt; 50.</li>
              <li>It performs a multi-pixel verification pass (<code class="font-mono text-cyan-300">borderCheck</code>) across 5-pixel horizontal bars to ensure high-contrast frames aren't misclassified.</li>
              <li>It repeats the process for left and right pillarboxes.</li>
              <li>It posts the calculated crop offsets back to the player, which applies an instant CSS transform zoom to crop the video to its active content!</li>
            </ol>
          </div>

          <h3 class="text-xl font-display font-bold text-white mt-8 mb-4">On-Device MediaPipe Models</h3>
          <p>
            In <code class="font-mono text-slate-300">dist/mediapipe/</code>, Rave bundles two full Google MediaPipe AI models compiled for WebAssembly with SIMD acceleration:
          </p>
          <ul class="list-disc list-inside space-y-2 text-sm text-slate-300">
            <li>
              <strong class="text-white">Face Landmarker (<code class="font-mono text-pink-400">face_landmarker.task</code> - 3.6 MB):</strong> Detects 478 3D facial landmarks in real time via webcam. Drives user avatar lip-syncing and head movement during watch parties (<code class="font-mono text-cyan-300">mouthOpenThreshold</code>, <code class="font-mono text-cyan-300">mouthOpenSmilePoseThreshold</code>).
            </li>
            <li>
              <strong class="text-white">Language Detector (<code class="font-mono text-pink-400">language_detector.tflite</code> - 308 KB):</strong> Identifies the source language of incoming chat messages directly on-device, enabling byte-identical automated translation matching the iOS and Android clients without server latency.
            </li>
          </ul>
        </section>

        <!-- Section 10 -->
        <section id="mcs-push" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">10 / NOTIFICATION PROTOCOL</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            The Android Push Notification Trick: Emulating Google MCS over Raw TLS
          </h2>

          <p>
            Push notifications on desktop platforms are notoriously fragmented: Windows Notification Service (WNS) requires Store certificates, while web push requires active service workers.
          </p>

          <p>
            Rave takes a completely different, ingenious route: <strong>it masquerades as a physical Android phone connecting directly to Google's push servers!</strong>
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-4">
            <p class="text-sm text-slate-300">
              Examining the root of the extracted ASAR reveals three raw Protocol Buffer files:
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div class="p-3 bg-dark-900 rounded-lg border border-dark-700 text-pink-400">android_checkin.proto</div>
              <div class="p-3 bg-dark-900 rounded-lg border border-dark-700 text-purple-400">checkin.proto</div>
              <div class="p-3 bg-dark-900 rounded-lg border border-dark-700 text-cyan-400">mcs.proto</div>
            </div>
            <p class="text-sm text-slate-300">
              Using the <code class="font-mono text-pink-400">@aracna/fcm</code> library, Rave performs an Android Checkin with Google's servers (<code class="font-mono text-slate-300">android.clients.google.com/checkin</code>), synthesizes an Android Device ID, registers with Firebase Cloud Messaging Sender ID <code class="font-mono text-cyan-300">357028413082</code> (WeMesh Inc.), and opens a long-lived TLS connection directly to Google's <strong>MCS (Mobile Connection Server)</strong> on port 5228.
            </p>
            <p class="text-sm text-slate-300">
              When a friend invites you to a watch party, Google's push servers deliver the protobuf notification directly down the raw TLS socket to Rave Desktop, completely bypassing Windows notification limitations!
            </p>
          </div>
        </section>

        <!-- Section 11 -->
        <section id="sqlite-dm" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">11 / DATA PERSISTENCE</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Direct Messaging Architecture & Embedded SQLite
          </h2>

          <p>
            Rave bundles <code class="font-mono text-pink-400">better-sqlite3</code> (v13.0.3) as an unpacked native Node-API C++ addon (<code class="font-mono text-xs text-slate-400">node_modules/better-sqlite3/build/Release/better_sqlite3.node</code>) to manage an embedded local database for direct messages, thread drafts, and reactions.
          </p>

          <p>
            Over 40 IPC channels in <code class="font-mono text-slate-300">dist/main.prod.js</code> are dedicated to direct messaging operations:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
            <div class="p-4 bg-dark-900 rounded-xl border border-dark-800 space-y-1">
              <div class="text-brand-cyan font-bold mb-2">Message Lifecycle & Read Receipts</div>
              <div>dm:beginSession / dm:endSession</div>
              <div>dm:upsertMessages / dm:markMessagesSeen</div>
              <div>dm:markMessageUnsent / dm:updateMessageBody</div>
              <div>dm:deleteExpiredMessages / dm:clearAllData</div>
            </div>
            <div class="p-4 bg-dark-900 rounded-xl border border-dark-800 space-y-1">
              <div class="text-brand-500 font-bold mb-2">Reactions, Drafts & Search</div>
              <div>dm:upsertReactions / dm:getReactionsForMessage</div>
              <div>dm:getDraft / dm:upsertDraft / dm:deleteDraft</div>
              <div>dm:searchThreadMessages / dm:getThreadPreviews</div>
              <div>dm-trigger-hanging-get (Long-polling fallback)</div>
            </div>
          </div>
        </section>

        <!-- Section 12 -->
        <section id="monetization" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">12 / MONETIZATION DEEP-DIVE</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            The Hidden Engine: The 13-SDK Residential Proxy Mesh
          </h2>

          <p>
            How does Rave provide free real-time watch parties and media transcoding without a subscription fee? The answer lies in its background bandwidth monetization architecture.
          </p>

          <p>
            When inspecting <code class="font-mono text-pink-400">dist/indexerHost.child.js</code> and the unpacked native directory <code class="font-mono text-slate-300">resources/dlls/</code>, we discovered that Rave embeds <strong>13 distinct residential proxy, web indexing, and peer-to-peer bandwidth-sharing SDKs</strong>:
          </p>

          <!-- Proxy SDK Table -->
          <div class="overflow-x-auto rounded-xl border border-dark-700">
            <table class="w-full text-left text-xs">
              <thead class="bg-dark-800 text-slate-300 uppercase font-mono">
                <tr>
                  <th class="p-3">SDK / Provider</th>
                  <th class="p-3">Binary / Addon</th>
                  <th class="p-3">Embedded Keys & Configuration</th>
                  <th class="p-3">Function / Network Target</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-800 bg-dark-900/60 font-mono">
                <tr>
                  <td class="p-3 font-semibold text-white">AnyIP</td>
                  <td class="p-3 text-cyan-400">peer_ffi.dll (1.7 MB)</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">public_849a296f-74b6-4c75-b770-8e3f4998318a</code></td>
                  <td class="p-3 font-sans text-slate-400">Residential proxy node; loaded dynamically via <code class="text-slate-300">ffi-rs</code>.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">CashRaven</td>
                  <td class="p-3 text-cyan-400">cr_sdk / @cashraven</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">eeee4909045ab80a82bd7003a3bc3a773b83f5ec</code></td>
                  <td class="p-3 font-sans text-slate-400">App ID: <code class="text-slate-300">io.rave.desktop</code>; P2P residential proxy network.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">EarnFM</td>
                  <td class="p-3 text-cyan-400">earnfm-nodejs-sdk</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">f6b221af-ed6e-41d2-bd59-61652563cbe3</code></td>
                  <td class="p-3 font-sans text-slate-400">Bandwidth monetization fleet client with explicit consent store.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">GeoNode</td>
                  <td class="p-3 text-cyan-400">geonode-sdk (2.0.1)</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">af6dccb6-3cc1-40ed-8522-98393aafc647</code></td>
                  <td class="p-3 font-sans text-slate-400">App ID: <code class="text-slate-300">3c09d7b0-99ca-4ad6-b5ab-aa0aafd615b3</code>; Geo-proxying.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">GetPassive</td>
                  <td class="p-3 text-cyan-400">@getpassive/sdk (1.1.4)</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">gp_pk_8e60d289b0a8c3af5d34026f0e5f4a7f</code></td>
                  <td class="p-3 font-sans text-slate-400">Passive income bandwidth sharing service.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Honeygain</td>
                  <td class="p-3 text-cyan-400">@honeygain / nodejs-sdk-ws</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">6a72f269fd723169d6fb4b8ba9ef7e73</code></td>
                  <td class="p-3 font-sans text-slate-400">Global crowdsourced residential proxy node.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Infatica</td>
                  <td class="p-3 text-cyan-400">BsLib_x64.dll (7.3 MB)</td>
                  <td class="p-3 text-slate-400">Partner ID: <code class="text-pink-400">RaveWin</code></td>
                  <td class="p-3 font-sans text-slate-400">Infatica residential proxy network; exported as <code class="text-slate-300">LibInit</code>.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">LiveProxies</td>
                  <td class="p-3 text-cyan-400">hopmn.dll (715 KB)</td>
                  <td class="p-3 text-slate-400">Seeds: <code class="text-slate-400 text-[10px]">seed1.desdecasaconmusica.com</code></td>
                  <td class="p-3 font-sans text-slate-400">Argv: <code class="text-slate-300">["hopmn", "raveapp", ...]</code>; P2P proxy mesh.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Massive</td>
                  <td class="p-3 text-cyan-400">rave-massive</td>
                  <td class="p-3 text-slate-400">Token: <code class="text-pink-400 text-[10px]">cb7d8494-c3e3-4df1-899f-dc8fe03150b2</code></td>
                  <td class="p-3 font-sans text-slate-400">Distributed computing and bandwidth monetization platform.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Ports / RedHarvest</td>
                  <td class="p-3 text-cyan-400">@redharvest/proxy</td>
                  <td class="p-3 text-slate-400">Key: <code class="text-pink-400 text-[10px]">1fce167d785cc40466471ba32d0...</code></td>
                  <td class="p-3 font-sans text-slate-400">API Host: <code class="text-slate-300">https://api.mesh.video</code>; mesh tunneling cells.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Soax</td>
                  <td class="p-3 text-cyan-400">librpalwi_amd64.dll (24 MB)</td>
                  <td class="p-3 text-slate-400">Init Token: <code class="text-pink-400">ravee-z3x6y-wind</code></td>
                  <td class="p-3 font-sans text-slate-400">Soax residential proxy network (<code class="text-slate-300">librpalwi_connect_async</code>).</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Pawns / IPRoyal</td>
                  <td class="p-3 text-cyan-400">libpawns.dll</td>
                  <td class="p-3 text-slate-400">JWT Token (exp: 2037)</td>
                  <td class="p-3 font-sans text-slate-400">Pawns bandwidth sharing client.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-white">Mellowtel</td>
                  <td class="p-3 text-cyan-400">mellowtel-electron</td>
                  <td class="p-3 text-slate-400">8 DevTools CDP sessions</td>
                  <td class="p-3 font-sans text-slate-400">Open-source monetization; isolated via <code class="text-slate-300">mellowtel-pool-slot-0..7</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section 13 -->
        <section id="iat-meter" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">13 / NETWORK SURVEILLANCE</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Winsock Hooking, TLS SNI & DoH Snooping with iat-meter
          </h2>

          <p>
            Running 13 concurrent residential proxy SDKs creates a major challenge: how does Rave ensure none of these third-party SDKs abuse the user's connection or overwhelm network capacity?
          </p>

          <p>
            Rave engineered a custom native C++ Windows addon called <strong>iat-meter</strong> (<code class="font-mono text-pink-400">iat_meter.node</code>). This module performs low-level traffic inspection and byte attribution directly at the Windows socket layer.
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-4">
            <h4 class="font-bold text-white text-base">How iat-meter Operates: Deep Technical Analysis</h4>

            <ul class="space-y-3 text-sm text-slate-300">
              <li>
                <strong class="text-white">IAT Hooking & Winsock Interception:</strong> <code class="font-mono text-pink-400">iat-meter</code> patches the Import Address Table (IAT) and hooks dynamic <code class="font-mono text-cyan-300">GetProcAddress</code> swaps for all loaded proxy DLLs, intercepting <code class="font-mono text-slate-300">send</code>, <code class="font-mono text-slate-300">recv</code>, and asynchronous overlapped I/O completions (<code class="font-mono text-slate-300">overlappedPending</code>, <code class="font-mono text-slate-300">completionsCounted</code>).
              </li>
              <li>
                <strong class="text-white">TLS ClientHello SNI Extraction:</strong> When a proxy socket initiates a connection, <code class="font-mono text-pink-400">iat-meter</code> intercepts the first write (<code class="font-mono text-cyan-300">raveFirstWritePeek</code>), inspects the raw binary buffer for the TLS handshake sentinel (<code class="font-mono text-pink-400">byte 0x16, 0x03</code>), walks the TLS extensions tree to Extension 0x0000 (Server Name Indication), and extracts the target domain name without breaking TLS encryption!
              </li>
              <li>
                <strong class="text-white">HTTP Host & CONNECT Header Parsing:</strong> If the connection is plaintext or an HTTP proxy tunnel, it parses <code class="font-mono text-cyan-300">CONNECT host:port</code> or the <code class="font-mono text-cyan-300">Host:</code> header to identify the target host.
              </li>
              <li>
                <strong class="text-white">DNS-over-HTTPS (DoH) Snooping:</strong> Many modern proxy SDKs resolve domains via DoH to hide destination hosts. Rave installs an interceptor proxying <code class="font-mono text-slate-300">https.request</code>, <code class="font-mono text-slate-300">https.get</code>, and <code class="font-mono text-slate-300">globalThis.fetch</code> to watch queries to <code class="font-mono text-pink-400">dns.google</code> and <code class="font-mono text-pink-400">cloudflare-dns.com</code>. It decompresses the DoH gzip/brotli payload, parses the DNS Answer records, and builds an in-memory IP-to-Domain lookup table (<code class="font-mono text-cyan-300">Ee.set(ip, domain)</code>)!
              </li>
              <li>
                <strong class="text-white">Attribution & Bandwidth Reporting:</strong> When raw bytes flow through the hooked socket, Rave correlates the peer IP back to the known domain and exact proxy SDK, measuring exact RX/TX byte counts every 100ms and reporting telemetry back to the main process!
              </li>
            </ul>
          </div>
        </section>

        <!-- Section 14 -->
        <section id="priapus-client" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">14 / SCRAPING WORKER</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            The PriapusClient: Distributed In-App Web Scraping
          </h2>

          <p>
            Beyond the 13 third-party residential proxy SDKs, Rave features its own proprietary distributed web scraping engine embedded inside the renderer (<code class="font-mono text-pink-400">dist/common.prod.js</code>): <strong>PriapusClient</strong>.
          </p>

          <p>
            The client flow operates as follows:
          </p>

          <div class="p-6 rounded-2xl glow-card space-y-3">
            <ol class="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>It requests a session token from the Rave backend and registers an IPC interceptor: <code class="font-mono text-pink-400">SET_PRIAPUS_INTERCEPTOR</code>.</li>
              <li>It opens a persistent WebSocket connection: <code class="font-mono text-cyan-300">new WebSocket(this.websocketUrl + '/' + userId)</code>.</li>
              <li>The Rave backend dispatches scraping jobs with message type <code class="font-mono text-pink-400">"TASK"</code>.</li>
              <li>The desktop client executes the task using headless HTTP requests (<code class="font-mono text-slate-300">fetch(p, { method, headers, body })</code>).</li>
              <li>The client base64-encodes the raw web response and pushes it back up the WebSocket with message type <code class="font-mono text-emerald-400">"FINISHED"</code> (<code class="font-mono text-slate-300">scrapeWebResponse</code>).</li>
            </ol>
          </div>
        </section>

        <!-- Section 15 -->
        <section id="takeaways" class="space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-brand-500 font-mono text-sm font-semibold">15 / CONCLUSION</span>
            <div class="h-px bg-dark-700 flex-1"></div>
          </div>
          
          <h2 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Architectural Takeaways & Engineering Lessons
          </h2>

          <p>
            Reverse engineering Rave Desktop provides a masterclass in modern real-time distributed client engineering. Key engineering takeaways include:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-base text-brand-cyan">1. Never Trust Client Clocks</h4>
              <p class="text-sm text-slate-400">
                Operating a global real-time synchronization system requires bypassing local OS time entirely. Rave's embedded NTPv4 client, multi-server statistical sampling, and sliding window averaging provide a resilient blueprint for any distributed time-sensitive application.
              </p>
            </div>
            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-base text-brand-500">2. Protect the Audio Thread at All Costs</h4>
              <p class="text-sm text-slate-400">
                Offloading audio processing to AudioWorkletProcessors (converting Float32 to Int16 PCM, computing RMS energy) and offloading aspect-ratio analysis to OffscreenCanvas Web Workers guarantees 60fps video playback without frame drops or audio crackle.
              </p>
            </div>
            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-base text-brand-violet">3. Work Around Platform Boundaries Creatively</h4>
              <p class="text-sm text-slate-400">
                Emulating an Android checkin to connect directly to Google's MCS push notification servers demonstrates that cross-platform desktop applications can bypass OS notification store limitations by utilizing standard cloud protocols.
              </p>
            </div>
            <div class="p-5 rounded-2xl glow-card space-y-2">
              <h4 class="font-bold text-white text-base text-brand-emerald">4. The Cost of "Free" Software</h4>
              <p class="text-sm text-slate-400">
                High-bandwidth real-time video synchronization is expensive to operate. Rave's 13-SDK proxy mesh combined with custom Winsock hook attribution shows the intricate engineering required to subsidize free consumer infrastructure through bandwidth sharing.
              </p>
            </div>
          </div>
        </section>

      </article>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-dark-800 bg-dark-950 py-12 text-center text-xs text-slate-500 space-y-3">
    <p>Authored via <strong>REA (Reverse Engineer Anything)</strong> • Forensic Analysis of Shipped Binary Artifacts</p>
    <p>Published for educational and architectural research purposes under the MIT License.</p>
  </footer>

  <!-- Interactive Scroll Progress & TOC Scrollspy Script -->
  <script>
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.getElementById('progress-bar').style.width = scrolled + '%';

      // ScrollSpy
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 120) {
          current = section.getAttribute('id');
        }
      });
      document.querySelectorAll('.toc-item').forEach(item => {
        item.classList.remove('active', 'border-l-2');
        if (item.getAttribute('href') === '#' + current) {
          item.classList.add('active', 'border-l-2');
        }
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(siteDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully wrote index.html to ' + path.join(siteDir, 'index.html'));
