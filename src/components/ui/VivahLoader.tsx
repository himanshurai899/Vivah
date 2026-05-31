"use client"

interface VivahLoaderProps {
  size?: number
}

export function VivahLoader({ size = 200 }: VivahLoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="img"
    >
      <defs>
        <radialGradient id="vortexGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1a1a1a" stopOpacity="0.08" />
          <stop offset="60%"  stopColor="#1a1a1a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
        </radialGradient>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0a0a0a" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Whirl arms */}
      <g style={{ transformOrigin: "100px 100px" }}>
        <animateTransform attributeName="transform" type="rotate"
          from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
        {[
          "M100,100 Q130,60 160,55",
          "M100,100 Q145,90 155,120",
          "M100,100 Q120,145 100,160",
          "M100,100 Q65,140 45,130",
          "M100,100 Q50,105 42,78",
          "M100,100 Q72,55 95,42",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#1a1a1a" strokeWidth="1.5" fill="none"
            strokeOpacity="0.18" strokeLinecap="round" />
        ))}
      </g>

      {/* Counter-rotating dashed ring */}
      <g style={{ transformOrigin: "100px 100px" }}>
        <animateTransform attributeName="transform" type="rotate"
          from="360 100 100" to="0 100 100" dur="12s" repeatCount="indefinite" />
        {[
          "M100,22 A78,78 0 0,1 178,100",
          "M178,100 A78,78 0 0,1 100,178",
          "M100,178 A78,78 0 0,1 22,100",
          "M22,100  A78,78 0 0,1 100,22",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#1a1a1a" strokeWidth="1" fill="none"
            strokeOpacity="0.1" strokeDasharray="6 10" strokeLinecap="round" />
        ))}
      </g>

      {/* King card orbit */}
      <g style={{ transformOrigin: "100px 100px" }}>
        <animateTransform attributeName="transform" type="rotate"
          from="0 100 100" to="360 100 100" dur="3.2s" repeatCount="indefinite" />
        <g transform="translate(100,62)" filter="url(#cardShadow)">
          <animateTransform attributeName="transform" type="rotate"
            from="0" to="-360" dur="3.2s" repeatCount="indefinite" additive="sum" />
          <rect x="-18" y="-26" width="36" height="52" rx="4" fill="white" stroke="#1a1a1a" strokeWidth="1.8"/>
          <text x="-14" y="-16" fontFamily="Georgia,serif" fontSize="9" fill="#1a1a1a" fontWeight="bold">K</text>
          <text x="-14" y="-8"  fontFamily="Arial,sans-serif" fontSize="8" fill="#1a1a1a">♠</text>
          <text x="14" y="22" fontFamily="Georgia,serif" fontSize="9" fill="#1a1a1a" fontWeight="bold"
            transform="rotate(180,7,17)">K</text>
          <text x="14" y="14" fontFamily="Arial,sans-serif" fontSize="8" fill="#1a1a1a"
            transform="rotate(180,7,9)">♠</text>
          <path d="M-8,-6 L-8,2 L0,-2 L8,2 L8,-6 L5,-4 L0,-8 L-5,-4 Z" fill="#1a1a1a"/>
          <circle cx="-8" cy="-6" r="1.5" fill="#1a1a1a"/>
          <circle cx="0"  cy="-8" r="1.5" fill="#1a1a1a"/>
          <circle cx="8"  cy="-6" r="1.5" fill="#1a1a1a"/>
          <ellipse cx="0" cy="5" rx="6" ry="7" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
          <circle cx="-2.5" cy="3.5" r="1" fill="#1a1a1a"/>
          <circle cx="2.5"  cy="3.5" r="1" fill="#1a1a1a"/>
          <path d="M-4,7 Q-1,6 0,7 Q1,6 4,7" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <path d="M-4,8 Q0,12 4,8" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <line x1="0" y1="12" x2="0" y2="18" stroke="#1a1a1a" strokeWidth="1.2"/>
          <circle cx="0" cy="11.5" r="1.5" fill="#1a1a1a"/>
        </g>
      </g>

      {/* Queen card orbit */}
      <g style={{ transformOrigin: "100px 100px" }}>
        <animateTransform attributeName="transform" type="rotate"
          from="180 100 100" to="-180 100 100" dur="3.2s" repeatCount="indefinite" />
        <g transform="translate(100,138)" filter="url(#cardShadow)">
          <animateTransform attributeName="transform" type="rotate"
            from="0" to="360" dur="3.2s" repeatCount="indefinite" additive="sum" />
          <rect x="-18" y="-26" width="36" height="52" rx="4" fill="white" stroke="#1a1a1a" strokeWidth="1.8"/>
          <text x="-14" y="-16" fontFamily="Georgia,serif" fontSize="9" fill="#1a1a1a" fontWeight="bold">Q</text>
          <text x="-14" y="-8"  fontFamily="Arial,sans-serif" fontSize="8" fill="#1a1a1a">♥</text>
          <text x="14" y="22" fontFamily="Georgia,serif" fontSize="9" fill="#1a1a1a" fontWeight="bold"
            transform="rotate(180,7,17)">Q</text>
          <text x="14" y="14" fontFamily="Arial,sans-serif" fontSize="8" fill="#1a1a1a"
            transform="rotate(180,7,9)">♥</text>
          <path d="M-9,-7 L-9,1 L-5,-3 L0,-7 L5,-3 L9,1 L9,-7 L6,-5 L3,-9 L0,-5 L-3,-9 L-6,-5 Z" fill="#1a1a1a"/>
          <circle cx="-9" cy="-7" r="1.2" fill="#1a1a1a"/>
          <circle cx="0"  cy="-9" r="1.2" fill="#1a1a1a"/>
          <circle cx="9"  cy="-7" r="1.2" fill="#1a1a1a"/>
          <ellipse cx="0" cy="5" rx="6" ry="7" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
          <path d="M-4,3 Q-2.5,2 -1,3 Q-2.5,4 -4,3Z" fill="#1a1a1a"/>
          <path d="M1,3 Q2.5,2 4,3 Q2.5,4 1,3Z" fill="#1a1a1a"/>
          <path d="M-3,8 Q0,10 3,8" stroke="#1a1a1a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
          <circle cx="-3" cy="13" r="0.8" fill="#1a1a1a"/>
          <circle cx="0"  cy="14" r="0.8" fill="#1a1a1a"/>
          <circle cx="3"  cy="13" r="0.8" fill="#1a1a1a"/>
          <line x1="0" y1="12" x2="0" y2="18" stroke="#1a1a1a" strokeWidth="1.2"/>
          <circle cx="0"  cy="11.5" r="1.2" fill="#1a1a1a"/>
          <circle cx="-2" cy="10"   r="0.8" fill="#1a1a1a"/>
          <circle cx="2"  cy="10"   r="0.8" fill="#1a1a1a"/>
        </g>
      </g>

      {/* Central vortex */}
      <circle cx="100" cy="100" r="18" fill="url(#vortexGrad)" />
      <circle cx="100" cy="100" r="3.5" fill="#1a1a1a" opacity="0.6"/>
      <circle cx="100" cy="100" r="1.8" fill="white"/>
    </svg>
  )
}
