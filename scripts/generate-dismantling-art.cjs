// Regenerates the vector art of the auto-dismantling page:
//   node scripts/generate-dismantling-art.cjs client/public/imgs/auto-dismantling
const fs = require('fs');
const path = require('path');
const out = process.argv[2];

const NAVY5 = '#0c121e', NAVY4 = '#19202e', NAVY3 = '#2b3342', NAVY2 = '#49556e', GREY = '#798192';
const n = (v) => +v.toFixed(2);

function gearPath(teeth, outer, inner, toothFrac = .45) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step - Math.PI / 2;
    const half = step * toothFrac / 2;
    const flank = step * .08;
    pts.push([inner, a - half - flank], [outer, a - half + flank * .4], [outer, a + half - flank * .4], [inner, a + half + flank]);
  }
  return `M ${pts.map(([r, a]) => `${n(Math.cos(a) * r)} ${n(Math.sin(a) * r)}`).join(' L ')} Z`;
}

// Hatchback side profile, facing right; wheels sit on y = 270.
const CAR_BODY = 'M 120 270 L 138 270 A 48 48 0 0 1 234 270 L 370 270 A 48 48 0 0 1 466 270 L 484 270 Q 498 270 498 256 L 496 232 Q 494 217 478 214 L 406 200 Q 393 198 383 190 L 342 160 Q 333 154 320 154 L 188 154 Q 171 154 159 165 L 122 206 Q 114 215 114 227 L 114 258 Q 114 270 120 270 Z';
const CAR_GLASS = 'M 178 168 L 316 168 Q 326 168 334 174 L 366 199 L 172 199 Q 156 199 163 186 Z';
const CAR_BELT = 'M 122 212 L 400 206';

const sharedDefs = `
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd877"/>
      <stop offset=".5" stop-color="#ffac00"/>
      <stop offset="1" stop-color="#d98a00"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffc94a"/>
      <stop offset="1" stop-color="#ffac00"/>
    </linearGradient>`;

function hero() {
  const wheel = (cx, cy, id = '') => `
    <g transform="translate(${cx} ${cy})"${id}>
      <circle r="35" fill="#141a26"/>
      <circle r="35" fill="none" stroke="#3a4356" stroke-width="2"/>
      <circle r="22" fill="#232a38"/>
      <circle r="21" stroke="url(#rim)" stroke-width="3.5"/>
      ${[0, 72, 144, 216, 288].map((a) => `<path d="M 0 -6 L 0 -19" stroke="#eaa21a" stroke-width="3.2" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}
      <circle r="6.5" fill="url(#rim)"/>
      <circle r="2.5" fill="${NAVY4}"/>
    </g>`;

  const callout = (x, y, tx, ty, label, barW) => `
    <g>
      <path d="M ${x} ${y} L ${x} ${ty + 15}" stroke="#ffac00" stroke-width="1.5" stroke-dasharray="3 4" opacity=".6"/>
      <circle cx="${x}" cy="${y}" r="9" fill="#ffac00" opacity=".18"/>
      <circle cx="${x}" cy="${y}" r="4.5" fill="url(#gold)" stroke="${NAVY5}" stroke-width="2"/>
      <rect x="${tx}" y="${ty}" width="${barW + 54}" height="30" rx="15" fill="${NAVY3}" stroke="#ffffff" stroke-opacity=".12"/>
      <text x="${tx + 14}" y="${ty + 19.5}" font-family="'Fira Sans Condensed', 'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#ffac00" letter-spacing=".04em">${label}</text>
      <rect x="${tx + 42}" y="${ty + 12}" width="${barW}" height="6" rx="3" fill="${GREY}" opacity=".8"/>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-28 0 684 480" width="684" height="480" fill="none">
  <defs>${sharedDefs}
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY3}"/>
      <stop offset=".55" stop-color="${NAVY4}"/>
      <stop offset="1" stop-color="${NAVY5}"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="18%" r="62%">
      <stop offset="0" stop-color="#ffac00" stop-opacity=".22"/>
      <stop offset=".45" stop-color="#ffac00" stop-opacity=".05"/>
      <stop offset="1" stop-color="#ffac00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a5469"/>
      <stop offset=".45" stop-color="#2f3747"/>
      <stop offset="1" stop-color="#1b2130"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6c7893" stop-opacity=".9"/>
      <stop offset=".6" stop-color="#252d3d"/>
      <stop offset="1" stop-color="#151b27"/>
    </linearGradient>
    <radialGradient id="rim" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#ffe29a"/>
      <stop offset=".55" stop-color="#ffac00"/>
      <stop offset="1" stop-color="#b87400"/>
    </radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" stroke="#ffffff" stroke-opacity=".045" stroke-width="1"/>
    </pattern>
    <clipPath id="cardClip"><rect x="40" y="24" width="576" height="360" rx="28"/></clipPath>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="${NAVY5}" flood-opacity=".22"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>

  <rect x="40" y="24" width="576" height="360" rx="28" fill="url(#card)" filter="url(#soft)"/>
  <g clip-path="url(#cardClip)">
    <rect x="40" y="24" width="576" height="360" fill="url(#grid)"/>
    <rect x="40" y="24" width="576" height="360" fill="url(#glow)"/>
    <path d="M 40 330 L 616 330" stroke="#ffffff" stroke-opacity=".08"/>
  </g>
  <rect x="40.5" y="24.5" width="575" height="359" rx="27.5" stroke="#ffffff" stroke-opacity=".08"/>

  <g transform="translate(14 -6)">
    <ellipse cx="300" cy="304" rx="196" ry="9" fill="#000" opacity=".45" filter="url(#blur)"/>
    <path d="${CAR_BODY}" fill="url(#body)"/>
    <path d="${CAR_BODY}" stroke="url(#goldLine)" stroke-width="1.6" stroke-linejoin="round" opacity=".55"/>
    <path d="M 192 158 L 318 158 Q 330 158 338 164" stroke="#ffffff" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/>
    <path d="${CAR_GLASS}" fill="url(#glass)"/>
    <path d="M 262 168 L 262 199" stroke="#1b2130" stroke-width="5"/>
    <path d="${CAR_BELT}" stroke="#ffac00" stroke-width="2" stroke-linecap="round" opacity=".9"/>
    <path d="M 262 206 L 262 262 M 360 204 L 368 262" stroke="#0c121e" stroke-opacity=".55" stroke-width="1.5"/>
    <path d="M 474 220 L 492 224 L 490 236 L 470 232 Z" fill="url(#gold)"/>
    <path d="M 116 222 L 126 220 L 126 236 L 116 238 Z" fill="#ffac00" opacity=".7"/>
    <rect x="300" y="214" width="20" height="4" rx="2" fill="#ffac00" opacity=".8"/>
    ${wheel(186, 270)}
    <circle cx="418" cy="270" r="35" stroke="#ffac00" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="4 5"/>
    <circle cx="418" cy="270" r="15" fill="#141a26" stroke="#3a4356" stroke-width="2"/>
    <circle cx="418" cy="270" r="5" fill="url(#gold)"/>
    <path d="M 404 256 A 20 20 0 0 1 432 256" stroke="url(#gold)" stroke-width="6" stroke-linecap="round"/>
    <path d="M 458 300 C 478 316, 500 318, 516 304" stroke="#ffac00" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="3 4"/>
    <path d="M 510 296 L 518 303 L 508 308" stroke="#ffac00" stroke-opacity=".8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${wheel(552, 264, ' opacity="1"')}
    ${callout(486, 226, 436, 100, '01', 40)}
    ${callout(300, 232, 236, 52, '02', 60)}
    ${callout(552, 230, 516, 166, '03', 30)}
  </g>

  <g filter="url(#soft)">
    <rect x="8" y="314" width="250" height="118" rx="20" fill="#ffffff"/>
  </g>
  <rect x="28" y="332" width="44" height="44" rx="12" fill="${NAVY3}"/>
  <g transform="translate(22.5 335) scale(.09)">
    <path d="${CAR_BODY}" fill="url(#gold)"/>
  </g>
  <rect x="84" y="336" width="64" height="7" rx="3.5" fill="#d4d4d4"/>
  <text x="84" y="366" font-family="ui-monospace, 'Cascadia Mono', Consolas, Menlo, monospace" font-size="14" font-weight="600" fill="${NAVY5}" letter-spacing=".06em">WVWZZZ1KZBW417</text>
  <path d="M 28 390 L 238 390" stroke="#eceef2"/>
  <rect x="28" y="404" width="50" height="8" rx="4" fill="#d4d4d4"/>
  <rect x="88" y="404" width="70" height="8" rx="4" fill="${NAVY2}"/>
  <rect x="176" y="398" width="62" height="20" rx="10" fill="#ffac00" fill-opacity=".16"/>
  <circle cx="190" cy="408" r="4" fill="#ffac00"/>
  <rect x="200" y="405" width="28" height="6" rx="3" fill="#c98200"/>
</svg>
`;
}

function record() {
  const rows = [
    ['vin'],
    [96], [74], [110], [64], [88],
  ];
  const rowY = (i) => 214 + i * 38;
  const rowsSvg = rows.map((row, i) => {
    const y = rowY(i);
    const label = `<rect x="92" y="${y - 4}" width="${[44, 52, 40, 58, 46, 50][i]}" height="8" rx="4" fill="#d4d4d4"/>`;
    const value = row[0] === 'vin'
      ? `<text x="176" y="${y + 5}" font-family="ui-monospace, 'Cascadia Mono', Consolas, Menlo, monospace" font-size="13.5" font-weight="600" fill="${NAVY5}" letter-spacing=".05em">WVWZZZ1KZBW417</text>`
      : `<rect x="176" y="${y - 5}" width="${row[0]}" height="10" rx="5" fill="${i === 5 ? '#ffac00' : NAVY2}"${i === 5 ? '' : ' opacity=".85"'}/>`;
    const divider = i < rows.length - 1 ? `<path d="M 92 ${y + 19} L 340 ${y + 19}" stroke="#eef0f3"/>` : '';
    return label + value + divider;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 530" width="420" height="530" fill="none">
  <defs>${sharedDefs}
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY3}"/>
      <stop offset="1" stop-color="${NAVY5}"/>
    </linearGradient>
    <radialGradient id="headGlow" cx="85%" cy="0%" r="90%">
      <stop offset="0" stop-color="#ffac00" stop-opacity=".25"/>
      <stop offset="1" stop-color="#ffac00" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M 18 0 L 0 0 0 18" stroke="#ffffff" stroke-opacity=".05"/>
    </pattern>
    <clipPath id="headClip"><path d="M 60 172 L 60 66 Q 60 42 84 42 L 336 42 Q 360 42 360 66 L 360 172 Z"/></clipPath>
    <filter id="soft" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="${NAVY5}" flood-opacity=".18"/>
    </filter>
    <filter id="badge" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#c98200" flood-opacity=".35"/>
    </filter>
  </defs>

  <rect x="78" y="58" width="290" height="400" rx="26" fill="#d9dce3" transform="rotate(5 223 258)"/>
  <rect x="66" y="50" width="294" height="404" rx="26" fill="#e7e9ee" transform="rotate(-3 213 252)"/>

  <g filter="url(#soft)">
    <rect x="60" y="42" width="300" height="412" rx="24" fill="#ffffff"/>
  </g>
  <g clip-path="url(#headClip)">
    <rect x="60" y="42" width="300" height="130" fill="url(#head)"/>
    <rect x="60" y="42" width="300" height="130" fill="url(#grid)"/>
    <rect x="60" y="42" width="300" height="130" fill="url(#headGlow)"/>
  </g>
  <g transform="translate(66 -4) scale(.47)">
    <ellipse cx="306" cy="306" rx="200" ry="7" fill="#000" opacity=".35"/>
    <path d="${CAR_BODY}" fill="#3a4356"/>
    <path d="${CAR_BODY}" stroke="url(#goldLine)" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="${CAR_GLASS}" fill="#1b2130" stroke="#ffac00" stroke-opacity=".5" stroke-width="2"/>
    <path d="${CAR_BELT}" stroke="#ffac00" stroke-width="4" stroke-linecap="round"/>
    <circle cx="186" cy="270" r="34" fill="#141a26"/><circle cx="186" cy="270" r="19" fill="url(#gold)"/><circle cx="186" cy="270" r="6" fill="#141a26"/>
    <circle cx="418" cy="270" r="34" fill="#141a26"/><circle cx="418" cy="270" r="19" fill="url(#gold)"/><circle cx="418" cy="270" r="6" fill="#141a26"/>
  </g>
  <rect x="84" y="62" width="34" height="18" rx="9" fill="#ffffff" fill-opacity=".1"/>
  <circle cx="96" cy="71" r="3.5" fill="#ffac00"/>
  <rect x="103" y="69" width="9" height="4" rx="2" fill="#ffffff" fill-opacity=".5"/>

  ${rowsSvg}

  <g filter="url(#badge)">
    <circle cx="346" cy="430" r="36" fill="url(#gold)"/>
  </g>
  <circle cx="346" cy="430" r="35" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.5"/>
  <path d="M 330 431 L 341 442 L 363 419" stroke="${NAVY5}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
}

function catalog() {
  const S = 'url(#gold)';
  const icons = {
    gear: `<path d="${gearPath(9, 25, 19)}" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/><circle r="8" stroke="${S}" stroke-width="2.4"/>`,
    disc: `<circle r="24" stroke="${S}" stroke-width="2.4"/><circle r="9" stroke="${S}" stroke-width="2.4"/>${[0, 72, 144, 216, 288].map((a) => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${n(Math.cos(r) * 16)}" cy="${n(Math.sin(r) * 16)}" r="2.2" fill="#ffac00"/>`; }).join('')}<path d="M 9 -26 A 27 27 0 0 1 27 -6" stroke="#ffac00" stroke-width="8" stroke-linecap="round"/>`,
    piston: `<rect x="-17" y="-28" width="34" height="24" rx="5" stroke="${S}" stroke-width="2.4"/><path d="M -17 -20 L 17 -20 M -17 -14 L 17 -14" stroke="#ffac00" stroke-width="2"/><path d="M -7 -4 L -5 16 M 7 -4 L 5 16" stroke="#ffac00" stroke-width="2.4" stroke-linecap="round"/><circle cy="24" r="9" stroke="${S}" stroke-width="2.4"/><circle cy="24" r="3" fill="#ffac00"/>`,
    wheel: `<circle r="26" stroke="${S}" stroke-width="2.4"/><circle r="17" stroke="${S}" stroke-width="2"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M 0 -5 L 0 -16" stroke="#ffac00" stroke-width="2.4" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}<circle r="4" fill="#ffac00"/>`,
    battery: `<rect x="-26" y="-16" width="52" height="36" rx="6" stroke="${S}" stroke-width="2.4"/><rect x="-18" y="-23" width="10" height="7" rx="2" stroke="${S}" stroke-width="2.2"/><rect x="8" y="-23" width="10" height="7" rx="2" stroke="${S}" stroke-width="2.2"/><path d="M -18 2 L -8 2 M -13 -3 L -13 7 M 8 2 L 18 2" stroke="#ffac00" stroke-width="2.4" stroke-linecap="round"/>`,
    light: `<path d="M -26 -10 Q -26 -18 -18 -18 L 16 -14 Q 27 -12 25 0 L 21 11 Q 19 18 10 18 L -18 18 Q -26 18 -26 10 Z" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="-6" cy="0" r="8" stroke="${S}" stroke-width="2.2"/><circle cx="-6" cy="0" r="2.5" fill="#ffac00"/><path d="M 8 -6 L 16 -6 M 8 2 L 18 2 M 8 10 L 14 10" stroke="#ffac00" stroke-width="2" stroke-linecap="round"/>`,
    
  };
  const order = ['gear', 'piston', 'disc', 'light', 'wheel', 'battery'];
  const tiles = order.map((key, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 44 + col * 136, y = 98 + row * 132;
    const active = key === 'piston';
    const lift = active ? -8 : 0;
    return `
  <g transform="translate(0 ${lift})"${active ? ' filter="url(#lift)"' : ''}>
    <rect x="${x}" y="${y}" width="120" height="118" rx="16" fill="${active ? '#323b4d' : NAVY3}"${active ? ' stroke="#ffac00" stroke-width="1.5"' : ' stroke="#ffffff" stroke-opacity=".06"'}/>
    <g transform="translate(${x + 60} ${y + 50})"${active ? '' : ' opacity=".8"'}>${icons[key]}</g>
    <rect x="${x + 16}" y="${y + 92}" width="${[52, 60, 44, 56, 40, 48][i]}" height="7" rx="3.5" fill="${GREY}" opacity=".7"/>
    <rect x="${x + 82}" y="${y + 91}" width="22" height="9" rx="4.5" fill="#ffac00" opacity="${active ? 1 : .55}"/>
    ${active ? `<circle cx="${x + 112}" cy="${y + 8}" r="13" fill="url(#gold)" stroke="${NAVY4}" stroke-width="3"/><path d="M ${x + 106} ${y + 8} L ${x + 110.5} ${y + 12.5} L ${x + 118} ${y + 4}" stroke="${NAVY5}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 384" width="480" height="384" fill="none">
  <defs>${sharedDefs}
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#222a39"/>
      <stop offset="1" stop-color="${NAVY4}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#ffac00" stop-opacity=".14"/>
      <stop offset="1" stop-color="#ffac00" stop-opacity="0"/>
    </radialGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#ffac00" flood-opacity=".22"/>
    </filter>
  </defs>
  <ellipse cx="240" cy="200" rx="240" ry="190" fill="url(#glow)"/>
  <rect x="20" y="20" width="440" height="348" rx="26" fill="url(#panel)"/>
  <rect x="20.5" y="20.5" width="439" height="347" rx="25.5" stroke="#ffffff" stroke-opacity=".09"/>
  <rect x="44" y="44" width="250" height="34" rx="17" fill="${NAVY3}"/>
  <circle cx="64" cy="60" r="6.5" stroke="#ffac00" stroke-width="2"/>
  <path d="M 69 65 L 74 70" stroke="#ffac00" stroke-width="2" stroke-linecap="round"/>
  <rect x="86" y="57" width="110" height="7" rx="3.5" fill="${GREY}" opacity=".6"/>
  <rect x="306" y="44" width="62" height="34" rx="17" fill="#ffac00"/>
  <rect x="321" y="57.5" width="32" height="7" rx="3.5" fill="${NAVY5}" opacity=".75"/>
  <rect x="380" y="44" width="56" height="34" rx="17" stroke="${NAVY2}" stroke-width="1.5"/>
  <rect x="394" y="57.5" width="28" height="7" rx="3.5" fill="${GREY}" opacity=".7"/>
  ${tiles}
</svg>
`;
}

fs.writeFileSync(path.join(out, 'dismantling-car.svg'), hero());
fs.writeFileSync(path.join(out, 'vehicle-record.svg'), record());
fs.writeFileSync(path.join(out, 'parts-catalog.svg'), catalog());
console.log('written');
