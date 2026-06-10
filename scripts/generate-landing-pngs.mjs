#!/usr/bin/env node
/**
 * Generates premium GymWeek landing PNG assets (SVG → PNG via sharp).
 * Run: node scripts/generate-landing-pngs.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/landing');

const C = {
  bg: '#05070f',
  green: '#b6ff3b',
  greenHi: '#c8ff5d',
  greenLo: '#8bff12',
  purple: '#6c4dff',
  blue: '#3b82f6',
  white: '#ffffff',
  muted: '#a0a0a0',
  glass: 'rgba(255,255,255,0.08)',
  dark: '#0d1528',
  dark2: '#121c32',
};

const defs = `
  <defs>
    <linearGradient id="gGreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d4ff5f"/>
      <stop offset="50%" stop-color="#b6ff3b"/>
      <stop offset="100%" stop-color="#89c628"/>
    </linearGradient>
    <linearGradient id="gGreenBtn" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c8ff5d"/>
      <stop offset="100%" stop-color="#8bff12"/>
    </linearGradient>
    <linearGradient id="gDarkGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.03)"/>
    </linearGradient>
    <linearGradient id="gScreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a2844"/>
      <stop offset="100%" stop-color="#0a1020"/>
    </linearGradient>
    <radialGradient id="gGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b6ff3b" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#b6ff3b" stop-opacity="0"/>
    </radialGradient>
    <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <filter id="fTitleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
`;

function wrap(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;
}

/** Isometric top face */
function isoTop(x, y, w, d, fill, stroke = 'none') {
  const hw = w / 2;
  const hd = d / 2;
  return `<polygon points="${x},${y - hd} ${x + hw},${y} ${x},${y + hd} ${x - hw},${y}" fill="${fill}" stroke="${stroke}"/>`;
}

/** Isometric left face */
function isoLeft(x, y, w, h, fill, stroke = 'none') {
  const hw = w / 2;
  return `<polygon points="${x - hw},${y} ${x},${y + hw} ${x},${y + hw + h} ${x - hw},${y + h}" fill="${fill}" stroke="${stroke}"/>`;
}

/** Isometric right face */
function isoRight(x, y, w, h, fill, stroke = 'none') {
  const hw = w / 2;
  return `<polygon points="${x + hw},${y} ${x},${y + hw} ${x},${y + hw + h} ${x + hw},${y + h}" fill="${fill}" stroke="${stroke}"/>`;
}

function isoBox(cx, cy, w, d, h, colors) {
  const [top, left, right] = colors;
  return `${isoTop(cx, cy, w, d, top)}${isoLeft(cx, cy, w, h, left)}${isoRight(cx, cy, w, h, right)}`;
}

function svgLogo() {
  return wrap(360, 72, `
    <g filter="url(#fGlow)">
      <path d="M8 12 L28 8 L38 36 L18 40 Z" fill="${C.green}" opacity="0.9"/>
      <path d="M22 14 L32 12 L36 28 L24 30 Z" fill="${C.bg}" opacity="0.5"/>
    </g>
    <text x="52" y="48" font-family="Arial Black, Helvetica, sans-serif" font-size="36" font-weight="900" letter-spacing="6" fill="${C.green}">GYM</text>
    <text x="168" y="48" font-family="Arial Black, Helvetica, sans-serif" font-size="36" font-weight="900" letter-spacing="6" fill="${C.white}">WEEK</text>
  `);
}

function svgScriptTitle() {
  return wrap(720, 160, `
    <text x="360" y="105" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="108" font-weight="700"
      font-style="italic" fill="${C.white}" filter="url(#fTitleGlow)"
      stroke="${C.white}" stroke-width="1.5" paint-order="stroke fill"
    >GymWeek</text>
    <text x="360" y="105" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="108" font-weight="700"
      font-style="italic" fill="none" stroke="rgba(182,255,59,0.25)" stroke-width="3"
    >GymWeek</text>
  `);
}

function svgStartTrialBtn() {
  return wrap(300, 60, `
    <rect x="2" y="2" width="296" height="56" rx="14" fill="url(#gGreenBtn)" stroke="#6a9b1f" stroke-width="2"/>
    <rect x="2" y="2" width="296" height="28" rx="14" fill="rgba(255,255,255,0.25)" opacity="0.35"/>
    <polygon points="38,30 48,24 48,36" fill="${C.bg}"/>
    <text x="62" y="38" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="700" fill="${C.bg}">Start Free Trial</text>
    <ellipse cx="150" cy="58" rx="120" ry="8" fill="url(#gGlow)" opacity="0.5"/>
  `);
}

function svgGetStartedBtn() {
  return wrap(260, 60, `
    <rect x="2" y="2" width="256" height="56" rx="14" fill="rgba(10,17,32,0.85)" stroke="rgba(182,255,59,0.45)" stroke-width="1.5"/>
    <rect x="2" y="2" width="256" height="56" rx="14" fill="url(#gDarkGlass)" opacity="0.6"/>
    <text x="36" y="38" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="${C.white}">Get Started</text>
    <text x="210" y="38" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600" fill="${C.green}">›</text>
    <ellipse cx="130" cy="58" rx="100" ry="6" fill="url(#gGlow)" opacity="0.3"/>
  `);
}

function svgMonitor() {
  const body = `
    <ellipse cx="200" cy="400" rx="140" ry="20" fill="#000" opacity="0.35" filter="url(#fSoft)"/>
    ${isoBox(200, 320, 200, 120, 28, ['#1e2d4a', '#141e34', '#0f1728'])}
    <rect x="118" y="168" width="164" height="110" rx="6" fill="url(#gScreen)" stroke="${C.green}" stroke-width="1.5" opacity="0.9"/>
    <rect x="128" y="178" width="144" height="80" rx="4" fill="#0a1428"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${135 + i * 34}" y="${220 - i * 12}" width="22" height="${20 + i * 14}" rx="2" fill="${C.green}" opacity="${0.5 + i * 0.12}"/>`).join('')}
    <line x1="128" y1="200" x2="272" y2="200" stroke="${C.green}" stroke-width="0.5" opacity="0.3"/>
    <rect x="140" y="148" width="120" height="24" rx="4" fill="#1a2844" stroke="rgba(182,255,59,0.3)" stroke-width="1"/>
    <circle cx="152" cy="160" r="4" fill="${C.green}" opacity="0.8"/>
    <circle cx="166" cy="160" r="4" fill="${C.blue}" opacity="0.6"/>
    <rect x="178" y="156" width="60" height="8" rx="2" fill="${C.green}" opacity="0.25"/>
    <rect x="100" y="340" width="200" height="12" rx="3" fill="#1a2844"/>
    <rect x="130" y="352" width="140" height="8" rx="2" fill="#141e34"/>
    <ellipse cx="200" cy="130" rx="60" ry="40" fill="url(#gGlow)" opacity="0.35"/>
    <rect x="155" y="95" width="90" height="55" rx="4" fill="rgba(182,255,59,0.08)" stroke="rgba(182,255,59,0.35)" stroke-width="1" transform="rotate(-8 200 122)"/>
    <polyline points="165,125 180,110 195,118 215,100 230,108" fill="none" stroke="${C.green}" stroke-width="2" opacity="0.7"/>
  `;
  return wrap(400, 420, body);
}

function svgBench() {
  return wrap(400, 360, `
    <ellipse cx="200" cy="330" rx="150" ry="18" fill="#000" opacity="0.4" filter="url(#fSoft)"/>
    ${isoBox(200, 280, 240, 100, 20, ['#1a2540', '#121a2e', '#0d1424'])}
    ${isoBox(200, 220, 200, 70, 14, ['#243352', '#1a2844', '#141e34'])}
    <rect x="95" y="195" width="210" height="16" rx="4" fill="#2a3a58" stroke="rgba(182,255,59,0.2)" stroke-width="1"/>
    ${isoLeft(120, 210, 30, 50, '#1a2844')}
    ${isoRight(280, 210, 30, 50, '#141e34')}
    <rect x="70" y="175" width="260" height="8" rx="3" fill="#8899aa"/>
    <rect x="65" y="168" width="16" height="16" rx="8" fill="#2a3548" stroke="${C.green}" stroke-width="1.5"/>
    <rect x="319" y="168" width="16" height="16" rx="8" fill="#2a3548" stroke="${C.green}" stroke-width="1.5"/>
    <ellipse cx="200" cy="175" rx="80" ry="8" fill="url(#gGlow)" opacity="0.25"/>
  `);
}

function svgFloatingTech() {
  return wrap(440, 380, `
    <ellipse cx="220" cy="350" rx="120" ry="15" fill="#000" opacity="0.25"/>
    ${isoBox(120, 260, 90, 55, 12, ['#243352', '#1a2844', '#141e34'])}
    <rect x="88" y="228" width="64" height="42" rx="3" fill="#0a1428" stroke="${C.green}" stroke-width="1" opacity="0.8"/>
    ${[0, 1, 2].map((i) => `<rect x="${95 + i * 18}" y="${250 - i * 6}" width="12" height="${14 + i * 8}" fill="${C.green}" opacity="0.5"/>`).join('')}
    ${isoBox(300, 200, 110, 65, 10, ['#1e2d4a', '#141e34', '#0f1728'])}
    <rect x="258" y="172" width="84" height="52" rx="3" fill="#0a1428" stroke="${C.blue}" stroke-width="1" opacity="0.7"/>
    <circle cx="300" cy="198" r="14" fill="none" stroke="${C.green}" stroke-width="2" opacity="0.6"/>
    <line x1="300" y1="184" x2="300" y2="212" stroke="${C.green}" stroke-width="1.5" opacity="0.5"/>
    <line x1="286" y1="198" x2="314" y2="198" stroke="${C.green}" stroke-width="1.5" opacity="0.5"/>
    <rect x="180" y="80" width="100" height="65" rx="6" fill="rgba(13,21,40,0.9)" stroke="rgba(182,255,59,0.4)" stroke-width="1.5" transform="rotate(-12 230 112)"/>
    <rect x="190" y="92" width="80" height="40" rx="3" fill="#0a1428" transform="rotate(-12 230 112)"/>
    <rect x="320" y="100" width="70" height="48" rx="4" fill="rgba(13,21,40,0.85)" stroke="rgba(59,130,246,0.4)" stroke-width="1" transform="rotate(10 355 124)"/>
    ${[0, 1, 2].map((i) => `<circle cx="${200 + i * 40}" cy="${320 + (i % 2) * 10}" r="4" fill="${C.green}" opacity="0.5"/>`).join('')}
    <ellipse cx="220" cy="180" rx="80" ry="50" fill="url(#gGlow)" opacity="0.2"/>
  `);
}

function glassCard(title, subTitle, iconSvg, accentColor = C.green) {
  return wrap(320, 420, `
    <rect x="8" y="8" width="304" height="404" rx="22" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    <rect x="8" y="8" width="304" height="404" rx="22" fill="url(#gDarkGlass)" opacity="0.5"/>
    <rect x="8" y="380" width="304" height="32" rx="22" fill="url(#gGlow)" opacity="0.35"/>
    <rect x="8" y="8" width="304" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>
    <text x="32" y="52" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="${accentColor}">${title}</text>
    <rect x="32" y="68" width="180" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>
    <rect x="32" y="90" width="240" height="200" rx="14" fill="rgba(0,0,0,0.45)" stroke="rgba(182,255,59,0.15)" stroke-width="1"/>
  ${iconSvg}
    <rect x="32" y="310" width="256" height="72" rx="12" fill="rgba(0,0,0,0.35)" stroke="rgba(182,255,59,0.12)" stroke-width="1"/>
    <text x="100" y="342" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700" fill="${C.white}">${subTitle}</text>
    <text x="100" y="362" font-family="Inter, Arial, sans-serif" font-size="11" fill="${C.muted}">Stay consistent with your goals</text>
    <ellipse cx="160" cy="410" rx="100" ry="12" fill="url(#gGlow)" opacity="0.4"/>
  `);
}

function iconFlame() {
  return `
    <circle cx="68" cy="340" r="22" fill="rgba(182,255,59,0.12)" stroke="rgba(182,255,59,0.3)" stroke-width="1"/>
    <path d="M68 328 Q62 338 64 348 Q68 352 72 348 Q74 338 68 328" fill="#ff6b35"/>
    <path d="M68 332 Q66 340 68 346 Q70 340 68 332" fill="#ffb347"/>
  `;
}

function iconChart() {
  return `
    <circle cx="68" cy="340" r="22" fill="rgba(182,255,59,0.12)" stroke="rgba(182,255,59,0.3)" stroke-width="1"/>
    <rect x="56" y="346" width="10" height="14" rx="2" fill="${C.green}" opacity="0.7"/>
    <rect x="68" y="338" width="10" height="22" rx="2" fill="${C.blue}" opacity="0.8"/>
    <rect x="80" y="342" width="10" height="18" rx="2" fill="#ff6b6b" opacity="0.8"/>
  `;
}

function iconCalendar() {
  return `
    <circle cx="68" cy="340" r="22" fill="rgba(182,255,59,0.12)" stroke="rgba(182,255,59,0.3)" stroke-width="1"/>
    <rect x="56" y="332" width="24" height="20" rx="3" fill="none" stroke="${C.green}" stroke-width="1.5"/>
    <line x1="56" y1="338" x2="80" y2="338" stroke="${C.green}" stroke-width="1"/>
    <line x1="62" y1="330" x2="62" y2="334" stroke="${C.green}" stroke-width="1.5"/>
    <line x1="74" y1="330" x2="74" y2="334" stroke="${C.green}" stroke-width="1.5"/>
    <rect x="60" y="342" width="6" height="5" rx="1" fill="${C.green}" opacity="0.6"/>
    <rect x="68" y="342" width="6" height="5" rx="1" fill="${C.green}" opacity="0.4"/>
  `;
}

function cardIconCenter(type) {
  const icons = {
    flame: `<path d="M160 175 Q140 200 148 230 Q160 240 172 230 Q180 200 160 175" fill="#ff6b35"/><path d="M160 185 Q152 205 160 222 Q168 205 160 185" fill="#ffb347"/>`,
    chart: [0, 1, 2].map((i) => `<rect x="${140 + i * 22}" y="${210 - i * 10}" width="16" height="${30 + i * 16}" rx="3" fill="${[C.green, C.blue, '#ff6b6b'][i]}" opacity="0.85"/>`).join(''),
    calendar: `<rect x="138" y="175" width="44" height="38" rx="5" fill="none" stroke="${C.green}" stroke-width="2"/><line x1="138" y1="188" x2="182" y2="188" stroke="${C.green}" stroke-width="1.5"/>${[0,1,2,3].map(i => `<rect x="${144 + (i%2)*16}" y="${194 + Math.floor(i/2)*10}" width="10" height="8" rx="1" fill="${C.green}" opacity="0.5"/>`).join('')}`,
  };
  return icons[type] || icons.flame;
}

function svgFeatureCard(title, sub, iconType) {
  return glassCard(title, sub, `
    <g transform="translate(0,0)">${cardIconCenter(iconType)}</g>
  `);
}

const ASSETS = [
  { name: 'gymweek_logo.png', svg: svgLogo(), w: 360, h: 72, scale: 2 },
  { name: 'gymweek_script_title.png', svg: svgScriptTitle(), w: 720, h: 160, scale: 2 },
  { name: 'start_free_trial_button.png', svg: svgStartTrialBtn(), w: 300, h: 60, scale: 2 },
  { name: 'get_started_button.png', svg: svgGetStartedBtn(), w: 260, h: 60, scale: 2 },
  { name: 'computer_stack_monitor.png', svg: svgMonitor(), w: 400, h: 420, scale: 2 },
  { name: 'gym_bench.png', svg: svgBench(), w: 400, h: 360, scale: 2 },
  { name: 'floating_tech.png', svg: svgFloatingTech(), w: 440, h: 380, scale: 2 },
  { name: 'feature_card_planner.png', svg: svgFeatureCard('Weekly Planner', 'Streak Tracking', 'flame'), w: 320, h: 420, scale: 2 },
  { name: 'feature_card_logger.png', svg: svgFeatureCard('Workout Logger', 'Volume Charts', 'chart'), w: 320, h: 420, scale: 2 },
  { name: 'feature_card_progress.png', svg: svgFeatureCard('Progress Analytics', 'Smart Planner', 'calendar'), w: 320, h: 420, scale: 2 },
];

async function renderPng({ name, svg, w, h, scale }) {
  const buf = await sharp(Buffer.from(svg))
    .resize(w * scale, h * scale)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  const path = join(OUT, name);
  await writeFile(path, buf);
  return { name, size: buf.length };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log('Generating GymWeek landing PNGs...\n');
  const results = [];
  for (const asset of ASSETS) {
    const r = await renderPng(asset);
    results.push(r);
    console.log(`  ✓ ${r.name} (${(r.size / 1024).toFixed(1)} KB)`);
  }
  console.log(`\nDone — ${results.length} assets → public/landing/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
