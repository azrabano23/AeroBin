import { useMemo, useRef, useState } from 'react'
import columbia from '../../data/columbia.json'

/* Drag the handle: left of it is the calendar a crew drives today, right of
   it is the run AeroBin hands them. Same forty bins, same morning.
   Drawn from the real Columbia fleet coordinates, so it works with or
   without a basemap. */

type Bin = { id: string; lat: number; lng: number; fill: number }
const BINS: Bin[] = columbia.map(({ id, lat, lng, fill }) => ({ id, lat, lng, fill }))
const FULL = 80
const W = 900
const H = 520

function useProjected() {
  return useMemo(() => {
    const lat = BINS.map((b) => b.lat)
    const lng = BINS.map((b) => b.lng)
    const la0 = Math.min(...lat), la1 = Math.max(...lat)
    const ln0 = Math.min(...lng), ln1 = Math.max(...lng)
    const k = Math.cos(((la0 + la1) / 2) * (Math.PI / 180))
    const dLa = la1 - la0 || 1e-6
    const dLn = (ln1 - ln0) * k || 1e-6
    const pad = 64
    const s = Math.min((W - pad * 2) / dLn, (H - pad * 2) / dLa)
    const ox = (W - dLn * s) / 2
    const oy = (H - dLa * s) / 2
    return BINS.map((b) => ({
      ...b,
      x: ox + (b.lng - ln0) * k * s,
      y: H - oy - (b.lat - la0) * s,
    }))
  }, [])
}

function tour(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 2) return ''
  const left = [...pts]
  let cur = left.reduce((a, b) => (a.x < b.x ? a : b))
  const order = [cur]
  left.splice(left.indexOf(cur), 1)
  while (left.length) {
    let bi = 0, bd = Infinity
    left.forEach((n, i) => {
      const d = (n.x - cur.x) ** 2 + (n.y - cur.y) ** 2
      if (d < bd) { bd = d; bi = i }
    })
    cur = left[bi]; order.push(cur); left.splice(bi, 1)
  }
  return order.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

export function Swipe() {
  const pts = useProjected()
  const [pct, setPct] = useState(52)
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef(false)

  const all = useMemo(() => tour(pts), [pts])
  const few = useMemo(() => tour(pts.filter((b) => b.fill >= FULL)), [pts])
  const need = pts.filter((b) => b.fill >= FULL).length

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    setPct(Math.max(6, Math.min(94, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      className="swipe"
      ref={box}
      onPointerDown={(e) => { drag.current = true; move(e.clientX) }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={() => (drag.current = false)}
      onPointerLeave={() => (drag.current = false)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The same forty bins under a fixed schedule and under AeroBin">
        <defs>
          <clipPath id="sw-l"><rect x="0" y="0" width={(pct / 100) * W} height={H} /></clipPath>
          <clipPath id="sw-r"><rect x={(pct / 100) * W} y="0" width={W} height={H} /></clipPath>
          <pattern id="sw-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M52 0H0v52" fill="none" stroke="rgba(20,23,15,.06)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="var(--paper-2)" />
        <rect width={W} height={H} fill="url(#sw-grid)" />

        {/* left: every bin, every time */}
        <g clipPath="url(#sw-l)">
          <path d={all} fill="none" stroke="#14170F" strokeWidth="2.2" strokeDasharray="7 6" opacity=".65" />
          {pts.map((b) => (
            <circle key={`l${b.id}`} cx={b.x} cy={b.y} r="7" fill="#14170F" stroke="#fff" strokeWidth="2" />
          ))}
        </g>

        {/* right: only the full ones */}
        <g clipPath="url(#sw-r)">
          <path d={few} fill="none" stroke="#0E7A4A" strokeWidth="2.6" strokeDasharray="7 6" />
          {pts.map((b) => {
            const on = b.fill >= FULL
            return (
              <circle
                key={`r${b.id}`} cx={b.x} cy={b.y} r={on ? 7 : 4}
                fill={on ? '#C0392B' : 'none'}
                stroke={on ? '#fff' : 'rgba(20,23,15,.22)'}
                strokeWidth={on ? 2 : 1.5}
              />
            )
          })}
        </g>

        <line x1={(pct / 100) * W} y1="0" x2={(pct / 100) * W} y2={H} stroke="#fff" strokeWidth="3" />
      </svg>

      <span className="sw-tag l">Fixed schedule · <b>{pts.length} stops</b></span>
      <span className="sw-tag r">AeroBin · <b>{need} stops</b></span>

      <div className="sw-handle" style={{ left: `${pct}%` }} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M9.5 7.5L5.5 12l4 4.5M14.5 7.5l4 4.5-4 4.5" stroke="#14170F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <input
        className="sw-input" type="range" min="6" max="94" value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        aria-label="Drag between the fixed schedule and the AeroBin route"
      />
    </div>
  )
}
