// Shared decorative editorial artwork for story surfaces. These are abstract
// print-style plates — honest decoration for real headlines, never presented
// as photos of the events. Deterministic per index so nothing jumps between
// renders.
export const PLATES = [
  {
    label: "Trend plate",
    art: (
      <svg viewBox="0 0 640 360" aria-hidden="true">
        <rect width="640" height="360" fill="var(--paper-dim)" />
        <g stroke="var(--ink)" strokeWidth="1.4" fill="none">
          <path d="M40 300 L160 180 L280 240 L400 120 L520 200 L600 90" />
          <line x1="40" y1="320" x2="600" y2="320" />
        </g>
        <circle cx="400" cy="120" r="8" fill="var(--vermillion)" />
        <circle cx="600" cy="90" r="8" fill="var(--vermillion)" />
      </svg>
    ),
  },
  {
    label: "Markets plate",
    art: (
      <svg viewBox="0 0 480 300" aria-hidden="true">
        <rect width="480" height="300" fill="var(--paper-dim)" />
        <g fill="var(--ink)">
          <rect x="60" y="160" width="40" height="100" />
          <rect x="140" y="120" width="40" height="140" />
          <rect x="220" y="90" width="40" height="170" />
          <rect x="300" y="140" width="40" height="120" />
          <rect x="380" y="70" width="40" height="190" />
        </g>
      </svg>
    ),
  },
  {
    label: "Type plate",
    art: (
      <svg viewBox="0 0 360 225" aria-hidden="true">
        <rect width="360" height="225" fill="var(--paper-dim)" />
        <text x="180" y="150" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="120" fontWeight="900" fill="var(--ink)">Aa</text>
      </svg>
    ),
  },
  {
    label: "City plate",
    art: (
      <svg viewBox="0 0 360 225" aria-hidden="true">
        <rect width="360" height="225" fill="var(--paper-dim)" />
        <g fill="var(--ink)">
          <rect x="60" y="120" width="50" height="105" />
          <rect x="130" y="80" width="50" height="145" />
          <rect x="200" y="140" width="50" height="85" />
          <rect x="270" y="100" width="40" height="125" />
        </g>
      </svg>
    ),
  },
  {
    label: "Signal plate",
    art: (
      <svg viewBox="0 0 360 225" aria-hidden="true">
        <rect width="360" height="225" fill="var(--paper-dim)" />
        <g stroke="var(--ink)" strokeWidth="2" fill="none">
          <path d="M50 60 Q180 20 310 60" />
          <path d="M50 110 Q180 70 310 110" />
          <path d="M50 160 Q180 120 310 160" />
        </g>
        <circle cx="310" cy="60" r="7" fill="var(--vermillion)" />
      </svg>
    ),
  },
];

export default function Plate({ index }) {
  return <div className="thumb">{PLATES[index % PLATES.length].art}</div>;
}
