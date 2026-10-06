<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>404 — Lost in Space</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg: #050a14;
      --accent: #00f0ff;
      --glow: #00f0ff44;
      --warn: #ff4d6d;
    }

    body {
      background: var(--bg);
      font-family: 'Space Mono', monospace;
      overflow: hidden;
    }

    /* Star field */
    .stars {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .star {
      position: absolute;
      border-radius: 50%;
      background: white;
      animation: twinkle var(--d, 3s) ease-in-out infinite alternate;
    }

    @keyframes twinkle {
      from { opacity: 0.1; transform: scale(1); }
      to   { opacity: 1;   transform: scale(1.4); }
    }

    /* Floating astronaut */
    .astronaut {
      animation: float 6s ease-in-out infinite;
      transform-origin: center;
    }

    @keyframes float {
      0%,100% { transform: translateY(0px) rotate(-3deg); }
      50%      { transform: translateY(-24px) rotate(4deg); }
    }

    /* Glitch on "404" */
    .glitch {
      position: relative;
      color: var(--accent);
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(7rem, 20vw, 14rem);
      line-height: 1;
      letter-spacing: 0.04em;
      text-shadow:
        0 0 20px var(--accent),
        0 0 60px var(--glow);
    }

    .glitch::before,
    .glitch::after {
      content: '404';
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .glitch::before {
      color: var(--warn);
      left: 3px;
      text-shadow: none;
      animation: glitch-a 2.8s infinite steps(1);
    }

    .glitch::after {
      color: #fff;
      left: -3px;
      opacity: 0.5;
      text-shadow: none;
      animation: glitch-b 3.2s infinite steps(1);
    }

    @keyframes glitch-a {
      0%,80%,100% { clip-path: inset(100% 0 0 0); opacity: 0; }
      5%  { clip-path: inset(10% 0 85% 0); opacity: 1; }
      10% { clip-path: inset(60% 0 10% 0); opacity: 1; }
      15% { clip-path: inset(30% 0 55% 0); opacity: 1; }
      20% { clip-path: inset(80% 0 5%  0); opacity: 1; }
    }

    @keyframes glitch-b {
      0%,85%,100% { clip-path: inset(100% 0 0 0); opacity: 0; }
      10% { clip-path: inset(45% 0 40% 0); opacity: 1; }
      20% { clip-path: inset(5%  0 70% 0); opacity: 1; }
      30% { clip-path: inset(75% 0 10% 0); opacity: 1; }
    }

    /* Scanlines overlay */
    .scanlines {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(0,0,0,0.07) 3px,
        rgba(0,0,0,0.07) 4px
      );
    }

    /* Button */
    .btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      border: 1px solid var(--accent);
      color: var(--accent);
      font-family: 'Space Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      overflow: hidden;
      transition: color 0.3s;
    }

    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--accent);
      transform: translateX(-101%);
      transition: transform 0.3s ease;
      z-index: -1;
    }

    .btn:hover::before { transform: translateX(0); }
    .btn:hover { color: var(--bg); }

    /* Terminal blink */
    .cursor {
      display: inline-block;
      width: 0.6ch;
      background: var(--accent);
      animation: blink 1s step-end infinite;
      vertical-align: middle;
      height: 1.1em;
      margin-left: 2px;
    }

    @keyframes blink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0; }
    }

    /* Orbit ring */
    .orbit {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(0,240,255,0.15);
      animation: spin var(--s, 12s) linear infinite;
    }

    @keyframes spin {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center">

  <!-- Star field -->
  <div class="stars" id="stars"></div>

  <!-- Scanlines -->
  <div class="scanlines"></div>

  <!-- Orbit rings centered on astronaut -->
  <div class="orbit" style="width:260px;height:260px;top:38%;right:18%;--s:14s;"></div>
  <div class="orbit" style="width:400px;height:400px;top:38%;right:18%;--s:22s;transform-origin:center;border-color:rgba(255,77,109,0.1);"></div>

  <!-- Main content -->
  <div class="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 text-center lg:text-left">

    <!-- Left: Text -->
    <div class="flex flex-col items-center lg:items-start">
      <!-- Top label -->
      <div class="flex items-center gap-2 mb-4 text-xs tracking-widest" style="color:var(--warn);">
        <span class="inline-block w-2 h-2 rounded-full animate-ping" style="background:var(--warn);"></span>
        SIGNAL_LOST.ERR — SECTOR_7G
      </div>

      <!-- 404 glitch -->
      <div class="glitch select-none">404</div>

      <!-- Tagline -->
      <p class="mt-2 text-sm tracking-widest uppercase" style="color:rgba(0,240,255,0.5);">
        Page not found in this galaxy
      </p>

      <!-- Terminal message -->
      <div class="mt-8 p-4 border text-left text-xs leading-6 max-w-sm w-full" style="border-color:rgba(0,240,255,0.2);background:rgba(0,240,255,0.03);">
        <p style="color:rgba(0,240,255,0.4);">// system log</p>
        <p style="color:#aaa;">
          <span style="color:var(--accent);">root@cosmos</span>:<span style="color:var(--warn);">~$</span>
          find / -name "page.html" 2&gt;/dev/null
        </p>
        <p style="color:rgba(255,255,255,0.35);">Searching… 0 results.</p>
        <p style="color:rgba(255,255,255,0.35);">The page has drifted beyond the event horizon.<span class="cursor"></span></p>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
        <a href="/" class="btn">
          ← Return to Base
        </a>
        <a href="/contact" class="btn" style="border-color:rgba(255,77,109,0.6);color:var(--warn);">
          ⚠ Report Issue
        </a>
      </div>
    </div>

    <!-- Right: Astronaut SVG -->
    <div class="relative flex-shrink-0" style="width:220px;height:260px;">
      <!-- Glow blob behind astronaut -->
      <div class="absolute inset-0 rounded-full blur-3xl opacity-20" style="background:var(--accent);transform:scale(1.3);"></div>

      <div class="astronaut">
        <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" width="220" height="260">
          <!-- Backpack -->
          <rect x="78" y="115" width="44" height="55" rx="6" fill="#1a2a3a" stroke="#00f0ff" stroke-width="1.5"/>
          <rect x="85" y="123" width="12" height="8" rx="2" fill="#00f0ff" opacity="0.4"/>
          <rect x="103" y="123" width="12" height="8" rx="2" fill="#ff4d6d" opacity="0.4"/>

          <!-- Body suit -->
          <ellipse cx="100" cy="148" rx="38" ry="48" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>

          <!-- Legs -->
          <rect x="72" y="182" width="22" height="38" rx="10" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>
          <rect x="106" y="182" width="22" height="38" rx="10" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>
          <!-- Boots -->
          <ellipse cx="83" cy="219" rx="14" ry="7" fill="#071015" stroke="#00f0ff" stroke-width="1"/>
          <ellipse cx="117" cy="219" rx="14" ry="7" fill="#071015" stroke="#00f0ff" stroke-width="1"/>

          <!-- Arms -->
          <rect x="40" y="122" width="20" height="42" rx="10" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>
          <rect x="140" y="122" width="20" height="42" rx="10" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>
          <!-- Gloves -->
          <ellipse cx="50" cy="167" rx="11" ry="8" fill="#071015" stroke="#00f0ff" stroke-width="1"/>
          <ellipse cx="150" cy="167" rx="11" ry="8" fill="#071015" stroke="#00f0ff" stroke-width="1"/>

          <!-- Helmet outer -->
          <circle cx="100" cy="85" r="48" fill="#0d1f30" stroke="#00f0ff" stroke-width="2"/>

          <!-- Visor -->
          <ellipse cx="100" cy="87" rx="32" ry="28" fill="#001a26" stroke="#00f0ff" stroke-width="1.5"/>

          <!-- Visor reflections -->
          <ellipse cx="86" cy="76" rx="10" ry="6" fill="rgba(0,240,255,0.08)" transform="rotate(-20,86,76)"/>
          <ellipse cx="106" cy="72" rx="6" ry="3" fill="rgba(0,240,255,0.05)" transform="rotate(-20,106,72)"/>

          <!-- Visor glow effect -->
          <ellipse cx="100" cy="87" rx="32" ry="28" fill="none" stroke="#00f0ff" stroke-width="0.5" opacity="0.5"/>

          <!-- Earth reflection in visor -->
          <circle cx="105" cy="90" r="10" fill="rgba(0,100,200,0.4)"/>
          <path d="M100 84 Q108 88 104 96 Q98 98 96 92 Z" fill="rgba(0,200,100,0.3)"/>

          <!-- Helmet collar ring -->
          <ellipse cx="100" cy="130" rx="40" ry="10" fill="#0d1f30" stroke="#00f0ff" stroke-width="1.5"/>

          <!-- Chest panel -->
          <rect x="82" y="138" width="36" height="22" rx="4" fill="#071015" stroke="#00f0ff" stroke-width="1"/>
          <circle cx="91" cy="149" r="4" fill="#ff4d6d" opacity="0.8"/>
          <circle cx="100" cy="149" r="4" fill="#00f0ff" opacity="0.8"/>
          <circle cx="109" cy="149" r="4" fill="#ffd700" opacity="0.8"/>

          <!-- Antenna -->
          <line x1="100" y1="37" x2="100" y2="20" stroke="#00f0ff" stroke-width="2"/>
          <circle cx="100" cy="17" r="4" fill="#00f0ff" opacity="0.9"/>
          <circle cx="100" cy="17" r="7" fill="none" stroke="#00f0ff" stroke-width="1" opacity="0.4" class="animate-ping"/>

          <!-- Tether rope from hand -->
          <path d="M162 167 Q185 155 178 130 Q172 115 165 108" stroke="#00f0ff" stroke-width="1.5" fill="none" stroke-dasharray="4 3" opacity="0.5"/>
        </svg>
      </div>
    </div>
  </div>

  <script>
    // Generate random stars
    const container = document.getElementById('stars');
    for (let i = 0; i < 160; i++) {
      const s = document.createElement('div');
      const size = Math.random() * 2.5 + 0.5;
      s.className = 'star';
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${Math.random()*100}%;
        left:${Math.random()*100}%;
        --d:${(Math.random()*3+2).toFixed(1)}s;
        animation-delay:${(Math.random()*4).toFixed(1)}s;
        opacity:${(Math.random()*0.6+0.1).toFixed(2)};
      `;
      container.appendChild(s);
    }
  </script>
</body>
</html>