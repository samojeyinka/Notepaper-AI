// ── Template definitions ──────────────────────────────────────────────────────
// Each template provides: default colours, a suggested font, and an SVG
// decorator rendered behind the card content.

export const TEMPLATES = {
    girlies: {
        label: 'Girlies',
        defaultBg: '#fff0f6',
        defaultText: '#7c3a5e',
        font: 'Caveat',
        preview: '#ffd6e8',
        Decoration: () => (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
                {/* top-left flowers */}
                <g opacity="0.18" fill="#e879a0">
                    <circle cx="30" cy="22" r="7"/><circle cx="44" cy="14" r="5"/><circle cx="20" cy="12" r="4"/>
                    <circle cx="18" cy="30" r="5"/><circle cx="36" cy="36" r="6"/><circle cx="30" cy="22" r="4" fill="#fff"/>
                    <circle cx="60" cy="10" r="4"/><circle cx="10" cy="48" r="4"/><circle cx="52" cy="30" r="3"/>
                </g>
                {/* top-right */}
                <g opacity="0.18" fill="#e879a0" transform="translate(400,0) scale(-1,1)">
                    <circle cx="30" cy="22" r="7"/><circle cx="44" cy="14" r="5"/><circle cx="20" cy="12" r="4"/>
                    <circle cx="18" cy="30" r="5"/><circle cx="36" cy="36" r="6"/><circle cx="30" cy="22" r="4" fill="#fff"/>
                    <circle cx="60" cy="10" r="4"/><circle cx="10" cy="48" r="4"/>
                </g>
                {/* bottom-left */}
                <g opacity="0.18" fill="#e879a0" transform="translate(0,260) scale(1,-1)">
                    <circle cx="24" cy="20" r="6"/><circle cx="38" cy="12" r="5"/><circle cx="14" cy="14" r="4"/>
                    <circle cx="16" cy="32" r="5"/><circle cx="40" cy="36" r="5"/>
                </g>
                {/* bottom-right */}
                <g opacity="0.18" fill="#e879a0" transform="translate(400,260) scale(-1,-1)">
                    <circle cx="24" cy="20" r="6"/><circle cx="38" cy="12" r="5"/><circle cx="14" cy="14" r="4"/>
                    <circle cx="16" cy="32" r="5"/><circle cx="40" cy="36" r="5"/>
                </g>
                {/* hearts scattered */}
                <g opacity="0.10" fill="#e879a0">
                    <path d="M200 50 c0-6 9-6 9 0 c0 5-9 10-9 10 c0 0-9-5-9-10 c0-6 9-6 9 0z"/>
                    <path d="M340 190 c0-5 7-5 7 0 c0 4-7 8-7 8 c0 0-7-4-7-8 c0-5 7-5 7 0z"/>
                    <path d="M60 180 c0-4 6-4 6 0 c0 3-6 7-6 7 c0 0-6-4-6-7 c0-4 6-4 6 0z"/>
                </g>
            </svg>
        ),
    },

    nature: {
        label: 'Nature',
        defaultBg: '#f0fdf4',
        defaultText: '#166534',
        font: 'sans',
        preview: '#bbf7d0',
        Decoration: () => (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
                {/* leaf top-left */}
                <g opacity="0.15" fill="#16a34a">
                    <ellipse cx="12" cy="30" rx="10" ry="28" transform="rotate(-30 12 30)"/>
                    <ellipse cx="30" cy="10" rx="8" ry="22" transform="rotate(20 30 10)"/>
                    <ellipse cx="50" cy="22" rx="6" ry="18" transform="rotate(50 50 22)"/>
                    <line x1="12" y1="30" x2="24" y2="52" stroke="#16a34a" strokeWidth="1.5" fill="none"/>
                    <line x1="30" y1="10" x2="38" y2="28" stroke="#16a34a" strokeWidth="1.2" fill="none"/>
                </g>
                {/* leaf bottom-right */}
                <g opacity="0.15" fill="#16a34a" transform="translate(400,260) rotate(180)">
                    <ellipse cx="12" cy="30" rx="10" ry="28" transform="rotate(-30 12 30)"/>
                    <ellipse cx="30" cy="10" rx="8" ry="22" transform="rotate(20 30 10)"/>
                    <ellipse cx="50" cy="22" rx="6" ry="18" transform="rotate(50 50 22)"/>
                </g>
                {/* small dots like dew */}
                <g opacity="0.12" fill="#4ade80">
                    <circle cx="200" cy="20" r="3"/><circle cx="215" cy="15" r="2"/>
                    <circle cx="185" cy="245" r="3"/><circle cx="198" cy="248" r="2"/>
                    <circle cx="380" cy="130" r="3"/><circle cx="20" cy="130" r="3"/>
                </g>
            </svg>
        ),
    },

    tech: {
        label: 'Tech',
        defaultBg: '#0f172a',
        defaultText: '#e2e8f0',
        font: 'mono',
        preview: '#1e293b',
        Decoration: () => (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
                {/* circuit grid lines */}
                <g opacity="0.12" stroke="#38bdf8" strokeWidth="1" fill="none">
                    <line x1="0"   y1="40"  x2="80"  y2="40"/><circle cx="80"  cy="40"  r="3" fill="#38bdf8"/>
                    <line x1="80"  y1="40"  x2="80"  y2="80"/><circle cx="80"  cy="80"  r="3" fill="#38bdf8"/>
                    <line x1="80"  y1="80"  x2="140" y2="80"/>
                    <line x1="320" y1="40"  x2="400" y2="40"/><circle cx="320" cy="40"  r="3" fill="#38bdf8"/>
                    <line x1="320" y1="40"  x2="320" y2="90"/><circle cx="320" cy="90"  r="3" fill="#38bdf8"/>
                    <line x1="320" y1="90"  x2="260" y2="90"/>
                    <line x1="0"   y1="220" x2="60"  y2="220"/><circle cx="60"  cy="220" r="3" fill="#38bdf8"/>
                    <line x1="60"  y1="220" x2="60"  y2="180"/><circle cx="60"  cy="180" r="3" fill="#38bdf8"/>
                    <line x1="60"  y1="180" x2="120" y2="180"/>
                    <line x1="340" y1="220" x2="400" y2="220"/><circle cx="340" cy="220" r="3" fill="#38bdf8"/>
                    <line x1="340" y1="220" x2="340" y2="170"/><circle cx="340" cy="170" r="3" fill="#38bdf8"/>
                </g>
                {/* small squares like chips */}
                <g opacity="0.10" fill="none" stroke="#38bdf8" strokeWidth="1">
                    <rect x="4"   y="4"   width="16" height="16" rx="2"/>
                    <rect x="380" y="4"   width="16" height="16" rx="2"/>
                    <rect x="4"   y="240" width="16" height="16" rx="2"/>
                    <rect x="380" y="240" width="16" height="16" rx="2"/>
                </g>
                {/* binary hints */}
                <g opacity="0.06" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                    <text x="170" y="14">01001110</text>
                    <text x="170" y="252">01110000</text>
                </g>
            </svg>
        ),
    },

    cars: {
        label: 'Cars',
        defaultBg: '#fff7ed',
        defaultText: '#7c2d12',
        font: 'sans',
        preview: '#fed7aa',
        Decoration: () => (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
                {/* speed lines left */}
                <g opacity="0.13" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="0" y1="90"  x2="55" y2="90"/>
                    <line x1="0" y1="100" x2="70" y2="100"/>
                    <line x1="0" y1="110" x2="45" y2="110"/>
                    <line x1="0" y1="120" x2="80" y2="120"/>
                    <line x1="0" y1="130" x2="50" y2="130"/>
                    <line x1="0" y1="140" x2="65" y2="140"/>
                    <line x1="0" y1="150" x2="40" y2="150"/>
                    <line x1="0" y1="160" x2="60" y2="160"/>
                    <line x1="0" y1="170" x2="48" y2="170"/>
                </g>
                {/* speed lines right */}
                <g opacity="0.13" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="400" y1="90"  x2="345" y2="90"/>
                    <line x1="400" y1="100" x2="330" y2="100"/>
                    <line x1="400" y1="110" x2="355" y2="110"/>
                    <line x1="400" y1="120" x2="320" y2="120"/>
                    <line x1="400" y1="130" x2="350" y2="130"/>
                    <line x1="400" y1="140" x2="335" y2="140"/>
                    <line x1="400" y1="150" x2="360" y2="150"/>
                    <line x1="400" y1="160" x2="340" y2="160"/>
                    <line x1="400" y1="170" x2="352" y2="170"/>
                </g>
                {/* checkered flag corners */}
                <g opacity="0.12" fill="#1c1917">
                    {[0,1,2,3,4].map(col => [0,1].map(row => (
                        <rect key={`tl-${col}-${row}`} x={col*8} y={row*8} width="8" height="8"
                            fill={(col + row) % 2 === 0 ? '#1c1917' : 'transparent'}/>
                    )))}
                    {[0,1,2,3,4].map(col => [0,1].map(row => (
                        <rect key={`br-${col}-${row}`} x={400 - 40 + col*8} y={260 - 16 + row*8} width="8" height="8"
                            fill={(col + row) % 2 === 0 ? '#1c1917' : 'transparent'}/>
                    )))}
                </g>
            </svg>
        ),
    },
};

export const FONT_OPTIONS = [
    { label: 'Sans',    value: 'sans',   style: { fontFamily: 'ui-sans-serif, system-ui, sans-serif' } },
    { label: 'Serif',   value: 'serif',  style: { fontFamily: 'ui-serif, Georgia, serif' } },
    { label: 'Mono',    value: 'mono',   style: { fontFamily: 'ui-monospace, monospace' } },
    { label: 'Cursive', value: 'Caveat', style: { fontFamily: "'Caveat', cursive" } },
];

export const FONT_SIZE_OPTIONS = [14, 16, 18, 20, 24, 28, 32];

export function getFontStyle(fontValue) {
    return FONT_OPTIONS.find(f => f.value === fontValue)?.style ?? FONT_OPTIONS[0].style;
}
