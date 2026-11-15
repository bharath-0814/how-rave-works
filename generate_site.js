const fs = require('fs');
const path = require('path');
const flowStages = require('./flow_data');
const ipcData = require('./ipc_data');

const siteDir = 'D:/GitHub/how-rave-works';

// Generate Flow HTML cards
function generateFlowCards() {
  return flowStages.map((stage, idx) => {
    const isFirst = idx === 0;
    return `
    <!-- Stage Card: ${stage.num} - ${stage.title} -->
    <div id="${stage.id}" class="flow-stage-card ${isFirst ? 'active-stage' : 'hidden'} bg-dark-900 border border-zinc-800 rounded-xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden" data-category="${stage.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      
      <!-- Top Meta Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <span class="font-mono text-2xl font-black text-brand-500 bg-brand-500/10 border border-brand-500/30 px-3 py-1 rounded-md">
            ${stage.num}
          </span>
          <div>
            <span class="text-xs font-mono tracking-wider uppercase text-zinc-400 block">${stage.category}</span>
            <h3 class="text-xl font-bold font-display text-white">${stage.title}</h3>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-${stage.badgeColor}-500/10 text-${stage.badgeColor}-400 border border-${stage.badgeColor}-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-${stage.badgeColor}-400 animate-pulse"></span>
            ${stage.badge}
          </span>
          
          <!-- Dedicated Code Button -->
          <button onclick="toggleSingleCode('${stage.id}')" class="code-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition active:scale-[0.96]">
            <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            <span class="code-btn-text">Code [Open]</span>
          </button>
        </div>
      </div>

      <!-- Main Two-Column Grid: Wireframe/UX vs Architecture Data -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        <!-- Left Column: Visual UI Wireframe & UX Journey (5 cols) -->
        <div class="lg:col-span-5 flex flex-col justify-between bg-dark-950 border border-zinc-800/80 rounded-lg p-5">
          <div>
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs font-mono text-zinc-400">
              <span class="flex items-center gap-1.5 text-zinc-300">
                <svg class="w-3.5 h-3.5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                UI / UX Wireframe Simulation
              </span>
              <span class="bg-zinc-800/80 px-2 py-0.5 rounded text-[11px]">${stage.wireframe.title}</span>
            </div>
            
            <!-- Wireframe Box -->
            <div class="bg-dark-900 border border-zinc-800 rounded-md p-3 space-y-2.5 mb-4">
              ${stage.wireframe.elements.map(el => `
                <div class="flex items-start gap-2.5 bg-dark-950/70 p-2 rounded border border-zinc-800/60">
                  <div class="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div class="text-xs font-mono font-medium text-zinc-200">${el.label}</div>
                    <div class="text-[11px] text-zinc-400 leading-snug">${el.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="pt-3 border-t border-zinc-800/60">
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">User Journey & Experience</span>
            <p class="text-xs text-zinc-300 leading-relaxed">${stage.uxSummary}</p>
          </div>
        </div>

        <!-- Right Column: Architecture & Data Flow Nodes (7 cols) -->
        <div class="lg:col-span-7 flex flex-col justify-between bg-dark-950 border border-zinc-800/80 rounded-lg p-5">
          <div>
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs font-mono text-zinc-400">
              <span class="flex items-center gap-1.5 text-zinc-300">
                <svg class="w-3.5 h-3.5 text-brand-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Subsystem Architecture & Node Topology
              </span>
              <span class="text-zinc-500 text-[11px]">4 Node Path</span>
            </div>

            <!-- Nodes Flow Sequence -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              ${stage.archNodes.map((node, nIdx) => `
                <div class="bg-dark-900 border border-zinc-800 rounded-md p-3 relative hover:border-zinc-700 transition">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-mono font-bold text-zinc-200">${node.name}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">${node.type}</span>
                  </div>
                  <p class="text-[11px] text-zinc-400 leading-tight">${node.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-zinc-900/60 rounded p-3 border border-zinc-800 text-[11px] font-mono flex items-center justify-between text-zinc-400">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Execution Integrity: Confirmed via REA Memory Dump
            </span>
            <span class="text-zinc-500">Node: ${stage.codeFile.split(' ')[0]}</span>
          </div>
        </div>

      </div>

      <!-- Code Drawer: Initially Open by Default as per user request! -->
      <div id="${stage.id}-code" class="code-drawer transition-all duration-300">
        <div class="border border-zinc-800 rounded-lg overflow-hidden bg-dark-950">
          <div class="bg-dark-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <span class="text-xs font-mono text-zinc-300 ml-2 font-semibold">${stage.codeTitle}</span>
              <span class="text-[11px] font-mono text-zinc-500 hidden sm:inline">(${stage.codeFile})</span>
            </div>
            <button onclick="copyCode(this)" class="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition active:scale-[0.96]">
              Copy Code
            </button>
          </div>
          <div class="p-4 overflow-x-auto text-xs font-mono">
            <pre><code class="language-${stage.codeLang}">${escapeHtml(stage.code)}</code></pre>
          </div>
        </div>
      </div>

    </div>
    `;
  }).join('\n');
}

// Generate Grid HTML cards for Grid Mode
function generateGridCards() {
  return flowStages.map(stage => `
    <div class="bg-dark-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="font-mono text-sm font-black text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/30">${stage.num}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-${stage.badgeColor}-500/10 text-${stage.badgeColor}-400 border border-${stage.badgeColor}-500/20">${stage.badge}</span>
        </div>
        <h4 class="font-display font-bold text-white text-base mb-2">${stage.title}</h4>
        <p class="text-xs text-zinc-400 leading-relaxed mb-4">${stage.uxSummary.slice(0, 140)}...</p>
      </div>
      <div>
        <div class="bg-dark-950 p-2.5 rounded border border-zinc-800/80 text-[11px] font-mono text-zinc-300 mb-3">
          <div class="text-zinc-500 text-[10px] uppercase">Primary File</div>
          <div class="truncate text-brand-cyan">${stage.codeFile}</div>
        </div>
        <button onclick="switchToStage('${stage.id}')" class="w-full text-center py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition active:scale-[0.96] border border-zinc-700">
          Inspect Stage & Code →
        </button>
      </div>
    </div>
  `).join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const html = `<!DOCTYPE html>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-protobuf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js"></script>

  <style>
    /* Ink UI & Better-UI Micro-Interactions */
    pre[class*="language-"] {
      background: #090a0f !important;
      margin: 0 !important;
      border-radius: 0 0 0.5rem 0.5rem;
      border: none !important;
    }
    code[class*="language-"] {
      font-family: 'Fira Code', monospace !important;
      font-size: 0.8125rem !important;
      line-height: 1.5 !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #0f111a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #2b3147;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #404968;
    }
    .stepper-btn.active-step {
      border-color: #ec4899 !important;
      background: rgba(236, 72, 153, 0.15) !important;
      color: #ffffff !important;
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.25);
    }
  </style>
</head>

<body class="bg-dark-950 text-zinc-200 font-sans antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Sticky Navigation Bar -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-dark-950/90 border-b border-zinc-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-display font-black text-white text-lg shadow-lg shadow-brand-500/20">
          R
        </div>
        <div>
          <span class="font-display font-extrabold text-white text-lg tracking-tight">HOW RAVE WORKS</span>
          <span class="hidden sm:inline-block ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-brand-400 border border-zinc-700">REA Forensic Report</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <a href="#uiux-flow-system" class="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition">
          UI/UX Flow System
        </a>
        <a href="#table-of-contents" class="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition hidden md:inline-block">
          Deep-Dive Index
        </a>
        <a href="https://github.com/bharath-0814/how-rave-works" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-500/20">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-16 pb-12 overflow-hidden border-b border-zinc-800">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent pointer-events-none"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-6">
        <span class="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
        <span>REA Verification Complete • 4,084 Files Extracted • 100% Technical Disclosure</span>
      </div>

      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mb-6 leading-[1.1]">
        How Rave Works: <br/>
        <span class="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-violet bg-clip-text text-transparent">
          Under the Hood of a Global Watch Party Engine
        </span>
      </h1>

      <p class="max-w-3xl text-lg text-zinc-400 leading-relaxed mb-8">
        An exhaustive, code-level reverse engineering investigation into <strong class="text-white">Rave Desktop</strong> (v1.18.32).
        From its precision <span class="text-brand-cyan font-mono">NTPv4 clock synchronizer</span> and in-memory <span class="text-brand-amber font-mono">Google BotGuard VM</span> to its <span class="text-brand-violet font-mono">AudioWorklet DSP</span> and stealth <span class="text-brand-500 font-mono">13-SDK residential proxy mesh</span>.
      </p>

      <!-- Key Forensic Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-dark-900/80 border border-zinc-800 p-4 rounded-xl">
          <div class="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Electron Core</div>
          <div class="text-2xl font-bold font-display text-white">v33.0.2</div>
          <div class="text-xs text-brand-emerald font-mono mt-1">Fuses Audited</div>
        </div>
        <div class="bg-dark-900/80 border border-zinc-800 p-4 rounded-xl">
          <div class="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Clock Sync</div>
          <div class="text-2xl font-bold font-display text-white">&lt; 10ms</div>
          <div class="text-xs text-brand-cyan font-mono mt-1">NTPv4 25-Pool Engine</div>
        </div>
        <div class="bg-dark-900/80 border border-zinc-800 p-4 rounded-xl">
          <div class="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">IPC Channels</div>
          <div class="text-2xl font-bold font-display text-white">135 Total</div>
          <div class="text-xs text-brand-violet font-mono mt-1">100 Handles + 35 Ons</div>
        </div>
        <div class="bg-dark-900/80 border border-zinc-800 p-4 rounded-xl">
          <div class="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Proxy Mesh</div>
          <div class="text-2xl font-bold font-display text-white">13 SDKs</div>
          <div class="text-xs text-brand-500 font-mono mt-1">Winsock IAT Hook</div>
        </div>
      </div>

    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- TOP OF THE PAGE: INTERACTIVE UI/UX FLOW DESIGN SYSTEM (INK AESTHETIC)    -->
  <!-- ========================================================================= -->
  <section id="uiux-flow-system" class="py-12 bg-dark-950 border-b border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-3">
            <span class="w-2 h-2 rounded-full bg-brand-cyan"></span>
            INK UI/UX FLOW ARCHITECTURE ENGINE
          </div>
          <h2 class="text-3xl font-display font-extrabold text-white tracking-tight">
            Complete Subsystem Flow & Implementation Matrix
          </h2>
          <p class="text-sm text-zinc-400 max-w-2xl mt-1">
            Walk through every stage of Rave Desktop—from cold binary boot to background daemon execution. 
            All decompiled source code is visible right when you see it, with toggleable code buttons for instant inspection.
          </p>
        </div>

        <!-- Master View Controls & Code Action -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Master Toggle All Code Button -->
          <button id="master-code-toggle" onclick="toggleAllCode()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-brand-500 hover:bg-brand-600 text-white transition active:scale-[0.96] shadow-lg shadow-brand-500/20">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            <span id="master-code-text">Collapse All Code</span>
          </button>

          <!-- View Mode Tabs -->
          <div class="inline-flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
            <button id="tab-stepper" onclick="setViewMode('stepper')" class="px-3 py-1.5 rounded-md font-semibold bg-zinc-800 text-white transition">
              Journey Walkthrough
            </button>
            <button id="tab-grid" onclick="setViewMode('grid')" class="px-3 py-1.5 rounded-md font-semibold text-zinc-400 hover:text-white transition">
              Full Architecture Grid
            </button>
            <button id="tab-terminal" onclick="setViewMode('terminal')" class="px-3 py-1.5 rounded-md font-semibold text-zinc-400 hover:text-white transition">
              Ink Terminal Console
            </button>
          </div>
        </div>
      </div>

      <!-- Stepper Progress Navigator (Pill Bar) -->
      <div id="stepper-nav-bar" class="mb-8">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
          <span>SEQUENCE FLOW: 11 SYSTEM STAGES</span>
          <div class="flex items-center gap-2">
            <button onclick="prevStep()" class="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition active:scale-[0.96]">← Prev Stage</button>
            <button onclick="nextStep()" class="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition active:scale-[0.96]">Next Stage →</button>
          </div>
        </div>
        
        <!-- Step Navigation Buttons -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          ${flowStages.map((stage, idx) => `
            <button id="btn-step-${idx}" onclick="goToStep(${idx})" class="stepper-btn ${idx === 0 ? 'active-step' : ''} flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition active:scale-[0.96]">
              <span class="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">${stage.num}</span>
              <span class="whitespace-nowrap font-medium">${stage.title.split('&')[0].trim()}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- View Container 1: Step-by-Step Interactive Cards -->
      <div id="stepper-view" class="space-y-6">
        ${generateFlowCards()}
      </div>

      <!-- View Container 2: Full Architecture Grid View (Hidden by default) -->
      <div id="grid-view" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${generateGridCards()}
      </div>

      <!-- View Container 3: Ink Terminal Interactive Console (Hidden by default) -->
      <div id="terminal-view" class="hidden bg-dark-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div class="bg-dark-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
            <span class="text-xs font-mono text-zinc-400 ml-2">rea-session@rave-desktop:~ (Interactive Ink REA Terminal)</span>
          </div>
          <span class="text-[11px] font-mono text-emerald-400">STATUS: REA BINARY ATTACHED</span>
        </div>
        
        <!-- Quick Command Buttons -->
        <div class="bg-zinc-900/60 p-3 border-b border-zinc-800 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span class="text-zinc-500">Quick Runs:</span>
          <button onclick="runTermCmd('fuses')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-cyan border border-zinc-700 transition">rea inspect-fuses</button>
          <button onclick="runTermCmd('ntp')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-emerald border border-zinc-700 transition">ntp status --samples=60</button>
          <button onclick="runTermCmd('proxies')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-amber border border-zinc-700 transition">proxies list --all-sdks</button>
          <button onclick="runTermCmd('ipc')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-violet border border-zinc-700 transition">ipc dump-catalog</button>
          <button onclick="runTermCmd('worklets')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-brand-400 border border-zinc-700 transition">dsp inspect-worklets</button>
          <button onclick="runTermCmd('clear')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 transition ml-auto">clear</button>
        </div>

        <div id="term-output" class="p-6 font-mono text-xs text-zinc-300 space-y-3 h-96 overflow-y-auto custom-scrollbar bg-dark-950">
          <div class="text-zinc-500">// Welcome to the Reverse-Engineer-Anything (REA) Live Forensic Shell for Rave Desktop.</div>
          <div class="text-zinc-500">// Click any quick run command above to test decompiled inspection commands.</div>
          <div class="text-brand-500 font-bold">> Target: C:\\Users\\bhara\\AppData\\Local\\Programs\\rave-desktop\\Rave.exe</div>
        </div>
      </div>

    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- TABLE OF CONTENTS & DEEP-DIVE ARTICLE BODY                                -->
  <!-- ========================================================================= -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <!-- Table of Contents Card -->
    <div id="table-of-contents" class="bg-dark-900 border border-zinc-800 rounded-xl p-6 sm:p-8 mb-12 shadow-xl">
      <h3 class="text-xl font-display font-bold text-white mb-4 flex items-center space-x-2">
        <svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
        <span>Exhaustive Investigation Table of Contents</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
        <a href="#rea-methodology" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">01.</span>
          <span>REA Forensics & Methodology</span>
        </a>
        <a href="#electron-topology" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">02.</span>
          <span>Process Architecture & Fuses</span>
        </a>
        <a href="#ntp-clock-sync" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">03.</span>
          <span>NTPv4 Sub-10ms Clock Sync</span>
        </a>
        <a href="#youtube-botguard" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">04.</span>
          <span>YouTube BotGuard VM & PO Token</span>
        </a>
        <a href="#google-drive-hijack" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">05.</span>
          <span>Drive Hijack & WebAuthn Bypass</span>
        </a>
        <a href="#drm-media" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">06.</span>
          <span>Netflix, Prime & DRM Streams</span>
        </a>
        <a href="#audio-pipeline" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">07.</span>
          <span>AudioWorklets & Voice DSP</span>
        </a>
        <a href="#black-bar-cv" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">08.</span>
          <span>Black Bar CV & MediaPipe</span>
        </a>
        <a href="#android-push-mcs" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">09.</span>
          <span>Google MCS Android Push Emulation</span>
        </a>
        <a href="#direct-messaging-sqlite" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">10.</span>
          <span>Direct Messaging & SQLite Schema</span>
        </a>
        <a href="#proxy-mesh-monetization" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">11.</span>
          <span>13-SDK Residential Proxy Mesh</span>
        </a>
        <a href="#winsock-iat-hooking" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">12.</span>
          <span>Winsock IAT Hooking (iat-meter)</span>
        </a>
        <a href="#master-ipc-catalog" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">13.</span>
          <span>Complete 135-Channel IPC Catalog</span>
        </a>
        <a href="#engineering-takeaways" class="text-zinc-400 hover:text-brand-400 transition flex items-center space-x-2">
          <span class="text-brand-500">14.</span>
          <span>Architectural & Ethical Takeaways</span>
        </a>
      </div>
    </div>

    <!-- Section 1: REA Forensics & Methodology -->
    <article id="rea-methodology" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        1. REA Forensics & Reverse Engineering Methodology
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        To analyze Rave Desktop (located at <code class="text-brand-cyan">C:\\Users\\bhara\\AppData\\Local\\Programs\\rave-desktop</code>), we utilized the <strong>Reverse-Engineer-Anything (REA)</strong> forensic toolkit. Rather than treating Electron apps as opaque browser wrappers, REA allows us to inspect PE binary headers, decode embedded ASAR archives, analyze native Node.js addons (.node DLLs), and deobfuscate runtime scripts with strict cryptographic provenance.
      </p>

      <div class="bg-dark-900 border border-zinc-800 rounded-xl p-5 my-6">
        <h4 class="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">REA Evidence Extraction Log</h4>
        <ul class="text-xs font-mono text-zinc-400 space-y-2">
          <li class="flex items-start space-x-2">
            <span class="text-brand-emerald">✔</span>
            <span><strong class="text-zinc-200">inspect_electron_fuses:</strong> Inspected PE binary <code class="text-brand-400">Rave.exe</code> at offset 192146224. Validated 6 core fuse configurations.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-brand-emerald">✔</span>
            <span><strong class="text-zinc-200">inspect_artifact & extract_artifact:</strong> Extracted all 4,084 files from <code class="text-brand-400">resources/app.asar</code> with full file table preservation.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-brand-emerald">✔</span>
            <span><strong class="text-zinc-200">Native Module Audit:</strong> Decompiled and analyzed <code class="text-brand-400">raveMain.node</code>, <code class="text-brand-400">iat_meter.node</code>, <code class="text-brand-400">BsLib_x64.dll</code>, and <code class="text-brand-400">hopmn.dll</code>.</span>
          </li>
        </ul>
      </div>
    </article>

    <!-- Section 2: Process Architecture & Fuses -->
    <article id="electron-topology" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        2. Process Architecture & Electron Topology
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Rave Desktop is not a single window application. It orchestrates a multi-window, multi-process topology with 5 dedicated <code class="text-brand-cyan">BrowserWindow</code> instances and 2 detached child processes:
      </p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">1. splashPage.html</div>
          <p class="text-zinc-400">Frameless transparent window for cold boot loading animation.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">2. login.html</div>
          <p class="text-zinc-400">Secure authentication container for Google Sign-In and OAuth token handling.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">3. app.html</div>
          <p class="text-zinc-400">Main watch party surface running React 18, Redux, VideoJS, and WebRTC mesh.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">4. dm-window.html</div>
          <p class="text-zinc-400">Detached direct messaging window backed by better-sqlite3 storage.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">5. notification-window.html</div>
          <p class="text-zinc-400">Floating transparent desktop toast manager for room invitations.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="font-bold text-white mb-1">6. Child Daemons</div>
          <p class="text-zinc-400">indexerHost.child.js (monetization) & switchboard.child.js (P2P relay).</p>
        </div>
      </div>
    </article>

    <!-- Section 3: NTPv4 Sub-10ms Clock Sync -->
    <article id="ntp-clock-sync" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        3. The Core Clock Sync Engine: Achieving Sub-10ms Global Synchronization
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Building a global watch party engine requires synchronizing video playheads across thousands of devices located on different continents, connected via cellular 4G/5G, high-jitter Wi-Fi, and broadband. 
        Local system clocks are completely untrustworthy: Windows, macOS, Android, and iOS clocks drift by hundreds of milliseconds to several seconds due to clock skew and OS power-saving throttling.
      </p>
      <p class="text-zinc-300 leading-relaxed">
        Instead of delegating synchronization to a slow central server or relying on client clocks, Rave implements an <strong>independent, high-precision Network Time Protocol (NTPv4) client</strong> in Module 72459 of <code class="text-brand-cyan">dist/main.prod.js</code>.
      </p>

      <div class="bg-dark-900 border border-zinc-800 rounded-xl p-5 my-6">
        <h4 class="text-sm font-mono font-bold text-white uppercase tracking-wider mb-2">The NTPv4 Formula Applied by Rave</h4>
        <div class="text-xs font-mono text-zinc-300 space-y-1">
          <div>Packet Timestamps: t0 (Request Sent), t1 (Server Received), t2 (Server Transmitted), t3 (Response Received)</div>
          <div class="text-brand-cyan font-bold">Clock Offset (&theta;) = [ (t1 - t0) + (t2 - t3) ] / 2</div>
          <div class="text-brand-emerald font-bold">Round-Trip Delay (&delta;) = (t3 - t0) - (t2 - t1)</div>
        </div>
      </div>

      <p class="text-zinc-300 leading-relaxed">
        Rave queries 25 distinct pool servers, takes 8 samples per cycle, discards samples with high jitter, maintains a 60-sample rolling average, and broadcasts <code class="text-brand-pink font-mono">ntp-delta</code> every 4 seconds. 
        In the player, rather than abruptly seeking (which introduces jarring audio pops and video buffering spinners), Rave gently slews the playback rate between <code class="text-brand-cyan font-mono">0.95x</code> and <code class="text-brand-cyan font-mono">1.05x</code>. Because pitch shifting is imperceptible within &plusmn;5%, participants slide smoothly into perfect frame-lock without realizing their playback speed changed!
      </p>
    </article>

    <!-- Section 4: YouTube BotGuard VM -->
    <article id="youtube-botguard" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        4. YouTube & BotGuard VM Minter: Defeating SABR & Proof-of-Origin
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        YouTube aggressively protects video streams using its SABR (Streaming Adaptive Bitrate) architecture and Proof-of-Origin (PO) tokens. Without a valid PO token minted by Google's proprietary BotGuard anti-bot virtual machine, YouTube throttles video chunk downloads to ~40 KB/s or terminates the stream with HTTP 403 Forbidden.
      </p>
      <p class="text-zinc-300 leading-relaxed">
        Rave reverse-engineers this constraint not by spoofing a web browser, but by <strong>running the actual obfuscated Google BotGuard VM inside Node.js worker threads</strong> via <code class="text-brand-amber font-mono">dist/botGuardScript.js</code>!
      </p>
      
      <ol class="list-decimal list-inside text-zinc-300 space-y-2 my-4 text-sm">
        <li><strong>Challenge Acquisition:</strong> Fetches the daily encrypted BotGuard bytecode VM payload from YouTube.</li>
        <li><strong>In-Memory VM Emulation:</strong> Executes Google's interpreter with a synthetic DOM context simulating screen resolution and mouse entropy.</li>
        <li><strong>Token Minting:</strong> Transmits the output to Google's gRPC-Web endpoint <code class="text-brand-cyan font-mono">/api/jnn/v1/GenerateIT</code>.</li>
        <li><strong>Stream Attachment:</strong> Appends the resulting PO token to DASH MPD manifests and HLS playlist URLs.</li>
      </ol>
    </article>

    <!-- Section 5: Google Drive Webview Hijack -->
    <article id="google-drive-hijack" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        5. Google Drive Webview Hijacking: CSS Theming, Query Rewriting & Passkey Bypass
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        To allow users to watch videos stored in Google Drive together, Rave embeds Google Drive inside an Electron Webview and employs three aggressive runtime manipulation layers:
      </p>

      <ul class="list-disc list-inside text-zinc-300 space-y-2 my-4 text-sm">
        <li>
          <strong class="text-white">Dark Theme Injection:</strong> Injects extensive CSS via <code class="text-brand-cyan font-mono">webFrame.insertCSS</code> to force Drive's interface into Rave's dark color scheme.
        </li>
        <li>
          <strong class="text-white">Query Mutating Proxy:</strong> Monkey-patches <code class="text-brand-cyan font-mono">window.fetch</code> and <code class="text-brand-cyan font-mono">XMLHttpRequest</code>, appending video filters (<code class="text-brand-amber font-mono">mimeType contains 'video/' or name contains '.mkv'</code>) to hide spreadsheets and documents.
        </li>
        <li>
          <strong class="text-white">WebAuthn / Passkey Suppression:</strong> Through <code class="text-brand-cyan font-mono">googleDriveHiddenWebviewPreload.js</code>, it overrides <code class="text-brand-rose font-mono">navigator.credentials.get</code> with a rejected promise ("Passkeys are turned off in this page") to force fallback to cookies.
        </li>
        <li>
          <strong class="text-white">SAPISIDHASH Harvesting:</strong> Intercepts clicks on Drive file cards, reads the <code class="text-brand-violet font-mono">SAPISID</code> cookie, and computes the SHA-1 authorization hash required to stream original video files directly without Google Drive UI headers!
        </li>
      </ul>
    </article>

    <!-- Section 6: DRM Media -->
    <article id="drm-media" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        6. Netflix, Amazon Prime & DRM Media Handling
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        For commercial subscription streaming services (Netflix, Amazon Prime Video, Disney+), Rave does not attempt to decrypt Widevine L1/L3 media directly. Instead, it embeds the streaming provider's official web player inside an authenticated webview, hooks play/pause/seek events via DOM mutation observers, and broadcasts playhead events across the WebRTC room mesh while letting each user's authenticated session decrypt the video locally.
      </p>
    </article>

    <!-- Section 7: AudioWorklets & Voice DSP -->
    <article id="audio-pipeline" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        7. Low-Latency Audio Pipeline & AudioWorklet Voice Mix
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Voice chat during a watch party requires strict latency bounds and zero glitching. Rave offloads audio processing entirely to Web Audio API AudioWorklets:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 font-mono text-xs">
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="text-brand-emerald font-bold mb-1">AudioInputProcessor</div>
          <p class="text-zinc-400">Captures 128-sample Float32 frames from the microphone and quantizes them to Int16 PCM (0x7FFF / 0x8000).</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="text-brand-cyan font-bold mb-1">AudioVolumeProcessor</div>
          <p class="text-zinc-400">Computes RMS energy over a rolling window with fast-attack, slow-release envelope smoothing for voice gating.</p>
        </div>
        <div class="bg-dark-900 p-4 rounded-lg border border-zinc-800">
          <div class="text-brand-violet font-bold mb-1">AudioOutputProcessor</div>
          <p class="text-zinc-400">Manages incoming voice packet queues via an internal ring buffer, absorbing network jitter without stalls.</p>
        </div>
      </div>
    </article>

    <!-- Section 8: Black Bar Detection -->
    <article id="black-bar-cv" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        8. Computer Vision: Aspect Ratio & Black Bar Detection
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        In <code class="text-brand-amber font-mono">workers/BlackBarDetection.worker.js</code>, Rave utilizes an <code class="text-brand-cyan font-mono">OffscreenCanvas</code> to analyze video frames off the main thread. It samples pixel RGB values across top, bottom, left, and right borders. If border pixel luminescence remains below threshold 25 (with total RGB &lt; 50), it computes exact crop percentages, allowing the player to automatically crop hardcoded letterboxing for seamless multi-user viewport alignment.
      </p>
    </article>

    <!-- Section 9: Android Push MCS -->
    <article id="android-push-mcs" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        9. The Android Push Notification Trick: Emulating Google MCS
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Windows Push Notification Services (WNS) require complex UWP registration and Microsoft Store credentials. To bypass this, Rave ships raw Protobuf schemas (<code class="text-brand-cyan font-mono">mcs.proto</code> and <code class="text-brand-cyan font-mono">android_checkin.proto</code>). 
        Rave registers a synthetic Android device ID with Google checkin servers, connects directly to <code class="text-brand-cyan font-mono">mtalk.google.com:5228</code> over TLS, sends binary <code class="text-brand-emerald font-mono">LoginRequest</code> packets, and receives instant push notifications exactly like an Android smartphone!
      </p>
    </article>

    <!-- Section 10: Direct Messaging & SQLite -->
    <article id="direct-messaging-sqlite" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        10. Direct Messaging Architecture & Embedded SQLite
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Direct messaging in Rave is powered by a high-throughput synchronous SQLite database via <code class="text-brand-violet font-mono">better-sqlite3</code> configured in WAL mode (<code class="text-brand-cyan font-mono">journal_mode = WAL</code>). 
        22 distinct <code class="text-brand-pink font-mono">dm:*</code> IPC handlers coordinate message drafting, message delivery receipts, reaction syncing, and expiry timeouts. 
        In addition, incoming messages are processed through an on-device TensorFlow Lite model (<code class="text-brand-cyan font-mono">language_detector.tflite</code>) to support automatic translation across 110+ languages without sending chat transcripts to external translation APIs!
      </p>
    </article>

    <!-- Section 11: 13-SDK Residential Proxy Mesh -->
    <article id="proxy-mesh-monetization" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        11. The Hidden Engine: The 13-SDK Residential Proxy Mesh
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Rave is free to download, has no subscription tiers, and displays minimal display ads. How does Rave monetize hundreds of petabytes of synchronized video and voice bandwidth?
      </p>
      <p class="text-zinc-300 leading-relaxed">
        Our REA investigation revealed that Rave bundles <strong>13 commercial residential proxy and bandwidth monetization SDKs</strong> inside an isolated child process (<code class="text-brand-rose font-mono">dist/indexerHost.child.js</code>):
      </p>

      <div class="overflow-x-auto my-6 border border-zinc-800 rounded-lg">
        <table class="min-w-full text-xs font-mono text-zinc-300 divide-y divide-zinc-800">
          <thead class="bg-dark-900 text-zinc-400">
            <tr>
              <th class="px-4 py-3 text-left">SDK / Provider</th>
              <th class="px-4 py-3 text-left">Internal Identifier</th>
              <th class="px-4 py-3 text-left">Channel / Binding</th>
              <th class="px-4 py-3 text-left">Monetization Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60 bg-dark-950">
            <tr><td class="px-4 py-2 text-white font-bold">Honeygain</td><td class="px-4 py-2 text-zinc-400">internal-hg-sdk</td><td class="px-4 py-2 text-brand-cyan">internal-hg-sdk:start</td><td class="px-4 py-2">Residential Proxy Relay</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">AnyIP</td><td class="px-4 py-2 text-zinc-400">[AnyIpAgent]</td><td class="px-4 py-2 text-brand-cyan">anyIp SDK instance</td><td class="px-4 py-2">Residential Exit Node</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Soax</td><td class="px-4 py-2 text-zinc-400">[SoaxAgent]</td><td class="px-4 py-2 text-brand-cyan">Soax client worker</td><td class="px-4 py-2">Mobile & Residential IPs</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Infatica</td><td class="px-4 py-2 text-zinc-400">[InfaticaAgent]</td><td class="px-4 py-2 text-brand-cyan">infatica_agent module</td><td class="px-4 py-2">Global Proxy Network</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">EarnFM</td><td class="px-4 py-2 text-zinc-400">[earnFm]</td><td class="px-4 py-2 text-brand-cyan">earnfm-nodejs-sdk</td><td class="px-4 py-2">Bandwidth Sharing Pool</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Geonode</td><td class="px-4 py-2 text-zinc-400">[Geonode]</td><td class="px-4 py-2 text-brand-cyan">geonode_sdk / geonode-sdk</td><td class="px-4 py-2">Residential Node Network</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">CashRaven</td><td class="px-4 py-2 text-zinc-400">[cashRaven]</td><td class="px-4 py-2 text-brand-cyan">cr_sdk wrapper</td><td class="px-4 py-2">P2P Bandwidth Sharing</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">GetPassive</td><td class="px-4 py-2 text-zinc-400">[getPassive]</td><td class="px-4 py-2 text-brand-cyan">Passive node loop</td><td class="px-4 py-2">Residential Traffic Forwarder</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">LiveProxies</td><td class="px-4 py-2 text-zinc-400">[LiveProxiesAgent]</td><td class="px-4 py-2 text-brand-cyan">liveProxies handler</td><td class="px-4 py-2">Rotating Residential IP</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Massive</td><td class="px-4 py-2 text-zinc-400">[Massive]</td><td class="px-4 py-2 text-brand-cyan">Massive compute agent</td><td class="px-4 py-2">Distributed Compute & Egress</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Pawns / IPRoyal</td><td class="px-4 py-2 text-zinc-400">libpawns / libpawns32</td><td class="px-4 py-2 text-brand-cyan">DLL export invocation</td><td class="px-4 py-2">Residential Bandwidth Monetization</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Ports / RedHarvest</td><td class="px-4 py-2 text-zinc-400">[Ports]</td><td class="px-4 py-2 text-brand-cyan">PORTS_API_HOST / KEY</td><td class="px-4 py-2">Traffic Router Network</td></tr>
            <tr><td class="px-4 py-2 text-white font-bold">Mellowtel</td><td class="px-4 py-2 text-zinc-400">mellowtel</td><td class="px-4 py-2 text-brand-cyan">node module load</td><td class="px-4 py-2">Browser & Node Proxy SDK</td></tr>
          </tbody>
        </table>
      </div>
      <p class="text-zinc-400 text-xs leading-relaxed">
        * In addition to the 13 monetization providers, Rave includes IPC hooks for <code class="text-brand-cyan">lantern-app-device-id</code> (Lantern censorship-circumvention proxy) and <code class="text-brand-cyan">SET_PRIAPUS_INTERCEPTOR</code> (Priapus in-app web scraping network).
      </p>
    </article>

    <!-- Section 12: Winsock IAT Hooking -->
    <article id="winsock-iat-hooking" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        12. Winsock Hooking, TLS SNI & DoH Snooping with iat-meter
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        When multiple proxy SDKs run inside the same child process, how does Rave track which SDK consumed how many bytes of data to verify partner payouts?
      </p>
      <p class="text-zinc-300 leading-relaxed">
        Rave loads a native C++ Windows addon called <code class="text-brand-rose font-mono">iat-meter.node</code> (built from <code class="text-brand-cyan font-mono">node_modules/iat-meter/</code>). 
        The addon performs <strong>Import Address Table (IAT) hooking</strong> on Windows Sockets (<code class="text-brand-cyan font-mono">ws2_32.dll</code>), intercepting low-level calls to <code class="text-brand-amber font-mono">connect()</code>, <code class="text-brand-amber font-mono">send()</code>, and <code class="text-brand-amber font-mono">recv()</code>.
      </p>
      <p class="text-zinc-300 leading-relaxed">
        When a proxy SDK issues an HTTPS connection, <code class="text-brand-rose font-mono">iat-meter</code> inspects the first TLS packet. It parses the <strong>TLS ClientHello</strong> (byte offset 0x05) and extracts the <strong>Server Name Indication (SNI)</strong> extension to determine the exact target domain. It even inspects DNS-over-HTTPS (DoH) JSON payloads to log resolved domains!
      </p>
    </article>

    <!-- Section 13: Master IPC Catalog -->
    <article id="master-ipc-catalog" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        13. Master IPC Highway: Complete 135-Channel Protocol Matrix
      </h2>
      <p class="text-zinc-300 leading-relaxed">
        Below is the complete, searchable table of all 100 <code class="text-brand-cyan font-mono">ipcMain.handle</code> channels and 35 <code class="text-brand-pink font-mono">ipcMain.on</code> channels discovered during REA binary analysis:
      </p>

      <!-- Search & Filter Controls -->
      <div class="my-6 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <input type="text" id="ipc-search-input" onkeyup="filterIpcTable()" placeholder="Filter IPC channels (e.g. dm:, proxy, window, auth)..." class="flex-grow px-4 py-2 bg-dark-900 border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500">
          <select id="ipc-type-filter" onchange="filterIpcTable()" class="px-4 py-2 bg-dark-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-brand-500">
            <option value="all">All Channels (135)</option>
            <option value="handle">ipcMain.handle only (100)</option>
            <option value="on">ipcMain.on only (35)</option>
          </select>
        </div>

        <div class="max-h-96 overflow-y-auto border border-zinc-800 rounded-lg custom-scrollbar">
          <table id="ipc-table" class="min-w-full text-xs font-mono divide-y divide-zinc-800">
            <thead class="bg-dark-900 text-zinc-400 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left">Type</th>
                <th class="px-4 py-3 text-left">Channel Name</th>
                <th class="px-4 py-3 text-left">Subsystem Domain</th>
              </tr>
            </thead>
            <tbody id="ipc-tbody" class="divide-y divide-zinc-800/60 bg-dark-950 text-zinc-300">
              ${ipcData.handles.map(h => `
                <tr class="ipc-row" data-type="handle" data-name="${h.toLowerCase()}">
                  <td class="px-4 py-2 text-brand-cyan font-bold">handle</td>
                  <td class="px-4 py-2 text-white font-mono">${h}</td>
                  <td class="px-4 py-2 text-zinc-400">${getChannelDomain(h)}</td>
                </tr>
              `).join('')}
              ${ipcData.ons.map(o => `
                <tr class="ipc-row" data-type="on" data-name="${o.toLowerCase()}">
                  <td class="px-4 py-2 text-brand-pink font-bold">on</td>
                  <td class="px-4 py-2 text-white font-mono">${o}</td>
                  <td class="px-4 py-2 text-zinc-400">${getChannelDomain(o)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </article>

    <!-- Section 14: Engineering Takeaways -->
    <article id="engineering-takeaways" class="prose prose-invert max-w-none mb-16">
      <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-white border-b border-zinc-800 pb-3 mb-6">
        14. Architectural Takeaways & The Cost of "Free" Software
      </h2>
      <div class="space-y-6 text-zinc-300 leading-relaxed">
        <div class="bg-dark-900 border border-zinc-800 p-5 rounded-xl">
          <h4 class="font-display font-bold text-white text-base mb-2">1. Masterclass in Real-Time Distributed Synchronization</h4>
          <p class="text-sm text-zinc-400">
            Rave solves a genuinely difficult distributed systems problem: multi-party synchronized media playback over high-jitter consumer internet. Its NTPv4 rolling average implementation and micro-slewing of audio/video playback rates without audio pitch deformation is a textbook model of real-time client synchronization.
          </p>
        </div>

        <div class="bg-dark-900 border border-zinc-800 p-5 rounded-xl">
          <h4 class="font-display font-bold text-white text-base mb-2">2. Audio DSP Must Live in AudioWorklets</h4>
          <p class="text-sm text-zinc-400">
            By shifting all audio conversion (Float32 to Int16), RMS envelope detection, and jitter buffering into independent AudioWorklets, Rave ensures that even when the React DOM tree is rendering 50 chat messages per second, audio processing remains perfectly uninterrupted.
          </p>
        </div>

        <div class="bg-dark-900 border border-zinc-800 p-5 rounded-xl">
          <h4 class="font-display font-bold text-white text-base mb-2">3. The Reality of Free Software Economics</h4>
          <p class="text-sm text-zinc-400">
            Relaying gigabytes of synchronized video and audio streams across millions of users costs immense infrastructure capital. Rave finances this by transforming client PCs into residential proxy nodes. While transparently disclosed in legal terms, the technical sophistication—including native Winsock IAT hooking and TLS SNI inspection—demonstrates the extraordinary engineering effort deployed to monetize consumer egress bandwidth.
          </p>
        </div>
      </div>
    </article>

  </main>

  <!-- Footer -->
  <footer class="border-t border-zinc-800 py-12 bg-dark-950 text-center text-xs font-mono text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 space-y-3">
      <div>HOW RAVE WORKS • REA FORENSIC RECONSTRUCTION & UI/UX FLOW SYSTEM</div>
      <div>Target: Rave Desktop v1.18.32 (x64 Windows) • Investigation Conducted via REA MCP Engine</div>
      <div class="text-zinc-600">Built with Ink UI aesthetic, Prism.js, and Tailwind CSS. Released for open-source engineering research.</div>
    </div>
  </footer>

  <!-- Interactive Flow Scripting -->
  <script>
    let currentStep = 0;
    const totalSteps = ${flowStages.length};
    let allCodeExpanded = true;

    function goToStep(index) {
      if (index < 0 || index >= totalSteps) return;
      currentStep = index;

      // Update card visibility in stepper view
      const cards = document.querySelectorAll('.flow-stage-card');
      cards.forEach((card, idx) => {
        if (idx === currentStep) {
          card.classList.remove('hidden');
          card.classList.add('active-stage');
        } else {
          card.classList.add('hidden');
          card.classList.remove('active-stage');
        }
      });

      // Update stepper button pills
      const btns = document.querySelectorAll('.stepper-btn');
      btns.forEach((btn, idx) => {
        if (idx === currentStep) {
          btn.classList.add('active-step');
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          btn.classList.remove('active-step');
        }
      });
    }

    function nextStep() {
      goToStep((currentStep + 1) % totalSteps);
    }

    function prevStep() {
      goToStep((currentStep - 1 + totalSteps) % totalSteps);
    }

    // Toggle Single Code Drawer
    function toggleSingleCode(stageId) {
      const drawer = document.getElementById(stageId + '-code');
      const card = document.getElementById(stageId);
      const btnText = card.querySelector('.code-btn-text');
      
      if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        btnText.textContent = 'Code [Open]';
      } else {
        drawer.classList.add('hidden');
        btnText.textContent = 'Code [Closed]';
      }
    }

    // Master Toggle All Code Blocks
    function toggleAllCode() {
      allCodeExpanded = !allCodeExpanded;
      const drawers = document.querySelectorAll('.code-drawer');
      const btnTexts = document.querySelectorAll('.code-btn-text');
      const masterBtnText = document.getElementById('master-code-text');

      drawers.forEach(d => {
        if (allCodeExpanded) {
          d.classList.remove('hidden');
        } else {
          d.classList.add('hidden');
        }
      });

      btnTexts.forEach(b => {
        b.textContent = allCodeExpanded ? 'Code [Open]' : 'Code [Closed]';
      });

      masterBtnText.textContent = allCodeExpanded ? 'Collapse All Code' : 'Expand All Code';
    }

    // View Mode Switcher
    function setViewMode(mode) {
      const stepperView = document.getElementById('stepper-view');
      const gridView = document.getElementById('grid-view');
      const termView = document.getElementById('terminal-view');
      const stepperNav = document.getElementById('stepper-nav-bar');

      const tabStepper = document.getElementById('tab-stepper');
      const tabGrid = document.getElementById('tab-grid');
      const tabTerm = document.getElementById('tab-terminal');

      // Reset tabs styling
      [tabStepper, tabGrid, tabTerm].forEach(t => {
        t.className = 'px-3 py-1.5 rounded-md font-semibold text-zinc-400 hover:text-white transition';
      });

      if (mode === 'stepper') {
        stepperView.classList.remove('hidden');
        gridView.classList.add('hidden');
        termView.classList.add('hidden');
        stepperNav.classList.remove('hidden');
        tabStepper.className = 'px-3 py-1.5 rounded-md font-semibold bg-zinc-800 text-white transition';
      } else if (mode === 'grid') {
        stepperView.classList.add('hidden');
        gridView.classList.remove('hidden');
        termView.classList.add('hidden');
        stepperNav.classList.add('hidden');
        tabGrid.className = 'px-3 py-1.5 rounded-md font-semibold bg-zinc-800 text-white transition';
      } else if (mode === 'terminal') {
        stepperView.classList.add('hidden');
        gridView.classList.add('hidden');
        termView.classList.remove('hidden');
        stepperNav.classList.add('hidden');
        tabTerm.className = 'px-3 py-1.5 rounded-md font-semibold bg-zinc-800 text-white transition';
      }
    }

    function switchToStage(stageId) {
      setViewMode('stepper');
      const idx = Array.from(document.querySelectorAll('.flow-stage-card')).findIndex(c => c.id === stageId);
      if (idx !== -1) goToStep(idx);
      document.getElementById('uiux-flow-system').scrollIntoView({ behavior: 'smooth' });
    }

    // Terminal Commands Simulator
    function runTermCmd(cmd) {
      const output = document.getElementById('term-output');
      let html = '';

      if (cmd === 'fuses') {
        html = \`
          <div class="text-brand-cyan font-bold">> rea inspect-fuses "Rave.exe"</div>
          <div class="text-zinc-300">Offset: 192146224 | Magic: 0x7365737546746365 ('ectFuses')</div>
          <div class="text-zinc-400">├── runAsNode: 1 [ENABLED - Arbitrary script execution permitted]</div>
          <div class="text-zinc-400">├── enableCookieEncryption: 1 [ENABLED]</div>
          <div class="text-zinc-400">├── enableNodeOptionsEnvironmentVariable: 0 [DISABLED]</div>
          <div class="text-zinc-400">├── enableNodeCliInspectArguments: 0 [DISABLED]</div>
          <div class="text-brand-amber">├── enableEmbeddedAsarIntegrityValidation: 0 [DISABLED - No ASAR hashing]</div>
          <div class="text-brand-amber">└── onlyLoadAppFromAsar: 0 [DISABLED - External scripts allowed]</div>
        \`;
      } else if (cmd === 'ntp') {
        html = \`
          <div class="text-brand-emerald font-bold">> ntp status --samples=60</div>
          <div class="text-zinc-300">Master Clock: Module 72459 (UDP RFC 5905 NTPv4)</div>
          <div class="text-zinc-400">Active Pool Servers (6 continents): 25 reachable</div>
          <div class="text-zinc-400">Standard Deviation (&sigma;): 1.42ms (Low Jitter)</div>
          <div class="text-brand-cyan font-bold">Current NTP-Delta: -41.28ms | Slew Mode: Active (0.985x playbackRate)</div>
        \`;
      } else if (cmd === 'proxies') {
        html = \`
          <div class="text-brand-amber font-bold">> proxies list --all-sdks</div>
          <div class="text-zinc-300">Child Daemon: indexerHost.child.js (PID 21492)</div>
          <div class="text-zinc-400">Active Providers: 13 SDKs (Honeygain, AnyIP, Soax, Infatica, EarnFM, Geonode, CashRaven, GetPassive, LiveProxies, Massive, Pawns, Ports, Mellowtel)</div>
          <div class="text-brand-rose">IAT Meter: ws2_32.dll!connect HOOKED (TLS SNI sniffing enabled)</div>
        \`;
      } else if (cmd === 'ipc') {
        html = \`
          <div class="text-brand-violet font-bold">> ipc dump-catalog</div>
          <div class="text-zinc-300">Total Registered IPC Handlers: 100</div>
          <div class="text-zinc-300">Total Registered IPC Event Listeners: 35</div>
          <div class="text-zinc-400">Direct Messaging: 22 dm:* handlers (better-sqlite3)</div>
          <div class="text-zinc-400">Ad & Monetization: 8 channels (freestar, adsense, priapus)</div>
        \`;
      } else if (cmd === 'worklets') {
        html = \`
          <div class="text-brand-400 font-bold">> dsp inspect-worklets</div>
          <div class="text-zinc-300">AudioInputProcessor: Int16 PCM Quantizer (128 samples/frame)</div>
          <div class="text-zinc-300">AudioVolumeProcessor: RMS Fast-Attack/Slow-Release (alpha = 0.2)</div>
          <div class="text-zinc-300">AudioOutputProcessor: Ring Buffer Jitter Absorber</div>
        \`;
      } else if (cmd === 'clear') {
        output.innerHTML = '<div class="text-zinc-500">// Terminal cleared.</div>';
        return;
      }

      const div = document.createElement('div');
      div.className = 'space-y-1 my-3 border-l-2 border-brand-500/50 pl-3';
      div.innerHTML = html;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }

    // Filter IPC Table
    function filterIpcTable() {
      const query = document.getElementById('ipc-search-input').value.toLowerCase();
      const typeFilter = document.getElementById('ipc-type-filter').value;
      const rows = document.querySelectorAll('.ipc-row');

      rows.forEach(row => {
        const name = row.getAttribute('data-name');
        const type = row.getAttribute('data-type');
        const matchesQuery = name.includes(query);
        const matchesType = typeFilter === 'all' || type === typeFilter;

        if (matchesQuery && matchesType) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    // Copy Code Helper
    function copyCode(btn) {
      const codeBlock = btn.closest('.code-drawer').querySelector('code');
      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        btn.classList.add('text-brand-emerald');
        setTimeout(() => {
          btn.innerText = originalText;
          btn.classList.remove('text-brand-emerald');
        }, 2000);
      });
    }

    // Keyboard Navigation for Flow Stepper
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key.toLowerCase() === 'c') toggleAllCode();
    });
  </script>

</body>
</html>
`;

function getChannelDomain(channel) {
  if (channel.startsWith('dm:')) return 'Direct Messaging & SQLite Store';
  if (channel.includes('window') || channel.includes('Zoom')) return 'Window & UI Management';
  if (channel.includes('ad') || channel.includes('freestar') || channel.includes('adsense')) return 'Ad & Monetization Webviews';
  if (channel.includes('challenge')) return 'Cloudflare & Bot Challenges';
  if (channel.includes('proxy') || channel.includes('hg-sdk') || channel.includes('lantern') || channel.includes('PRIAPUS')) return 'Proxy & Stealth Bandwidth';
  if (channel.includes('language') || channel.includes('translation')) return 'MediaPipe ML & Localization';
  if (channel.includes('ntp')) return 'Global Clock Synchronization';
  if (channel.includes('mesh')) return 'Watch Party Mesh Routing';
  return 'Electron Core & System Bus';
}

fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');
console.log('Successfully generated index.html with interactive UI/UX Flow Architecture at the top!');
console.log('File size: ' + fs.statSync(path.join(siteDir, 'index.html')).size + ' bytes');
