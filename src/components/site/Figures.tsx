/* Small figures that sit beside each capability. Status colours are the
   validated trio: good #0E7A4A, warning #D6A215, critical #C0392B.
   Every figure carries its own labels, which is also the relief the
   amber's sub-3:1 contrast against the paper requires. */

const GOOD = '#0E7A4A'
const WARN = '#D6A215'
const CRIT = '#C0392B'
const INK = '#14170F'
const GRID = '#E4E5DE'
const MUT = '#767C6E'

/* 01 — a week of readings on one bin, crossing the collect threshold */
export function FillCurve() {
  const pts = [14, 23, 31, 44, 52, 63, 71, 78, 86, 93]
  const W = 260, H = 116, PL = 6, PR = 30, PT = 10, PB = 20
  const x = (i: number) => PL + (i / (pts.length - 1)) * (W - PL - PR)
  const y = (v: number) => PT + (1 - v / 100) * (H - PT - PB)
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${d} L${x(pts.length - 1).toFixed(1)} ${y(0)} L${x(0)} ${y(0)} Z`
  const cross = pts.findIndex((v) => v >= 80)
  return (
    <figure className="fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="One bin filling across a week, crossing the collect threshold on day nine">
        <line x1={PL} y1={y(80)} x2={W - PR} y2={y(80)} stroke={CRIT} strokeWidth="1" strokeDasharray="3 3" />
        <text x={W - PR + 4} y={y(80) + 3.5} fill={CRIT} fontSize="9" fontFamily="var(--mono)">80%</text>
        <path d={area} fill={GOOD} opacity=".09" />
        <path d={d} fill="none" stroke={GOOD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(cross)} cy={y(pts[cross])} r="4.5" fill={CRIT} stroke="#fff" strokeWidth="2" />
        <text x={x(cross)} y={y(pts[cross]) - 9} fill={INK} fontSize="9" textAnchor="middle" fontFamily="var(--mono)">collect</text>
        <text x={PL} y={H - 5} fill={MUT} fontSize="9" fontFamily="var(--mono)">mon</text>
        <text x={W - PR} y={H - 5} fill={MUT} fontSize="9" textAnchor="end" fontFamily="var(--mono)">sun</text>
      </svg>
      <figcaption>Continuous fill on a single bin</figcaption>
    </figure>
  )
}

/* 02 — the stop list, before and after */
export function StopDots() {
  const total = 40, need = 6
  const cell = (n: number, on: (i: number) => boolean, c: string) =>
    Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={6 + (i % 10) * 12} cy={6 + Math.floor(i / 10) * 12}
        r={on(i) ? 4 : 2.6} fill={on(i) ? c : GRID} />
    ))
  return (
    <figure className="fig">
      <div className="fig-2">
        <div>
          <svg viewBox="0 0 122 54" role="img" aria-label="Fixed schedule visits all forty bins">
            {cell(total, () => true, INK)}
          </svg>
          <span><b>40</b> stops, every bin</span>
        </div>
        <div>
          <svg viewBox="0 0 122 54" role="img" aria-label="AeroBin visits only the six bins that are full">
            {cell(total, (i) => i % 7 === 0, CRIT)}
          </svg>
          <span><b style={{ color: GOOD }}>{need}</b> stops, only the full ones</span>
        </div>
      </div>
      <figcaption>One morning on a 40 bin campus</figcaption>
    </figure>
  )
}

/* 03 — where contamination gets caught */
export function ContamBar() {
  const rows: Array<[string, number, string]> = [
    ['Clean', 82, GOOD],
    ['Flagged at the bin', 13, WARN],
    ['Missed, found at sorting', 5, CRIT],
  ]
  let acc = 0
  return (
    <figure className="fig">
      <svg viewBox="0 0 260 96" role="img" aria-label="Share of loads clean, flagged at the bin, or missed until sorting">
        {rows.map(([, v, c], i) => {
          const x = (acc / 100) * 256
          const w = (v / 100) * 256 - (i < rows.length - 1 ? 2 : 0)
          acc += v
          return <rect key={i} x={x} y="8" width={Math.max(w, 2)} height="16" rx="4" fill={c} />
        })}
        {rows.map(([label, v, c], i) => (
          <g key={label} transform={`translate(0 ${40 + i * 18})`}>
            <rect x="0" y="-7" width="9" height="9" rx="2.5" fill={c} />
            <text x="15" y="1" fill={MUT} fontSize="10" fontFamily="var(--sans)">{label}</text>
            <text x="256" y="1" fill={INK} fontSize="10" textAnchor="end" fontFamily="var(--mono)">{v}%</text>
          </g>
        ))}
      </svg>
      <figcaption>Illustrative split, not measured</figcaption>
    </figure>
  )
}

/* 04 — trips avoided, accumulating */
export function SavedArea() {
  const pts = [0, 9, 21, 30, 44, 58, 69, 85, 96, 112, 127, 141]
  const W = 260, H = 116, PL = 6, PR = 34, PT = 12, PB = 20
  const max = 150
  const x = (i: number) => PL + (i / (pts.length - 1)) * (W - PL - PR)
  const y = (v: number) => PT + (1 - v / max) * (H - PT - PB)
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <figure className="fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Truck trips avoided accumulating across a term">
        {[50, 100, 150].map((g) => (
          <g key={g}>
            <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke={GRID} strokeWidth="1" />
            <text x={W - PR + 4} y={y(g) + 3.5} fill={MUT} fontSize="9" fontFamily="var(--mono)">{g}</text>
          </g>
        ))}
        <path d={`${d} L${x(pts.length - 1).toFixed(1)} ${y(0)} L${x(0)} ${y(0)} Z`} fill={GOOD} opacity=".1" />
        <path d={d} fill="none" stroke={GOOD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="4.5" fill={GOOD} stroke="#fff" strokeWidth="2" />
        <text x={PL} y={H - 5} fill={MUT} fontSize="9" fontFamily="var(--mono)">week 1</text>
        <text x={W - PR} y={H - 5} fill={MUT} fontSize="9" textAnchor="end" fontFamily="var(--mono)">week 12</text>
      </svg>
      <figcaption>Truck trips avoided, cumulative</figcaption>
    </figure>
  )
}
