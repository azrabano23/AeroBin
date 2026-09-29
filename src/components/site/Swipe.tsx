import { useEffect, useMemo, useRef } from 'react'
import columbia from '../../data/columbia.json'

/* Left of the wipe is the calendar a crew drives today, right of it is the
   run AeroBin hands them. Same forty bins, same morning.
   The wipe sweeps on its own so the comparison reads without anyone touching
   it; dragging takes it over, and it picks itself back up afterwards.
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

const LO = 10
const HI = 90
const START = 52
const PERIOD = 8200 // one full there-and-back sweep
const RESUME = 2200 // how long a hand on the handle holds the sweep off

const clamp = (v: number) => Math.max(6, Math.min(94, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
/* inverse of smooth, so a sweep that a pointer interrupted picks up from
   where the pointer left it instead of snapping back to the cycle start */
const unsmooth = (y: number) => 0.5 - Math.sin(Math.asin(1 - 2 * Math.min(1, Math.max(0, y))) / 3)
const phaseFor = (pct: number) => unsmooth((pct - LO) / (HI - LO)) / 2

export function Swipe() {
  const pts = useProjected()
  const box = useRef<HTMLDivElement>(null)
  const clipL = useRef<SVGRectElement>(null)
  const clipR = useRef<SVGRectElement>(null)
  const line = useRef<SVGLineElement>(null)
  const tagL = useRef<HTMLSpanElement>(null)
  const tagR = useRef<HTMLSpanElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const drag = useRef(false)
  const cur = useRef(START)
  /* null means the sweep owns the wipe; a timestamp means a pointer took it
     over, and the sweep takes it back RESUME later */
  const held = useRef<number | null>(null)

  /* the wipe is written straight to the DOM rather than held in state: at
     60fps, re-rendering eighty circles a frame is a stutter nobody needs */
  const apply = (p: number) => {
    cur.current = p
    const x = (p / 100) * W
    clipL.current?.setAttribute('width', String(x))
    clipR.current?.setAttribute('x', String(x))
    line.current?.setAttribute('x1', String(x))
    line.current?.setAttribute('x2', String(x))
    /* each label belongs to its side, so it fades out once the wipe has
       passed over it rather than sitting on top of the other side */
    const fade = (lo: number, hi: number) => String(Math.max(0, Math.min(1, (p - lo) / (hi - lo))))
    if (tagL.current) tagL.current.style.opacity = fade(16, 30)
    if (tagR.current) tagR.current.style.opacity = fade(88, 72)
    if (handle.current) handle.current.style.left = `${p}%`
    if (input.current) input.current.value = String(Math.round(p))
  }

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let t0 = performance.now() - phaseFor(START) * PERIOD
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (drag.current) return
      if (held.current !== null) {
        if (t - held.current < RESUME) return
        held.current = null
        t0 = t - phaseFor(cur.current) * PERIOD
      }
      const phase = ((t - t0) % PERIOD) / PERIOD
      // ease in and out of both ends so it never snaps at the turn
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2
      apply(LO + smooth(tri) * (HI - LO))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const all = useMemo(() => tour(pts), [pts])
  const few = useMemo(() => tour(pts.filter((b) => b.fill >= FULL)), [pts])
  const need = pts.filter((b) => b.fill >= FULL).length

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    held.current = performance.now()
    apply(clamp(((clientX - r.left) / r.width) * 100))
  }
  const release = () => { drag.current = false; held.current = performance.now() }

  return (
    <div
      className="swipe"
      ref={box}
      onPointerDown={(e) => { drag.current = true; move(e.clientX) }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={release}
      onPointerLeave={release}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The same forty bins under a fixed schedule and under AeroBin">
        <defs>
          <clipPath id="sw-l"><rect ref={clipL} x="0" y="0" width={(START / 100) * W} height={H} /></clipPath>
          <clipPath id="sw-r"><rect ref={clipR} x={(START / 100) * W} y="0" width={W} height={H} /></clipPath>
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

        <line ref={line} x1={(START / 100) * W} y1="0" x2={(START / 100) * W} y2={H} stroke="#fff" strokeWidth="3" />
      </svg>

      <span ref={tagL} className="sw-tag l">Fixed schedule · <b>{pts.length} stops</b></span>
      <span ref={tagR} className="sw-tag r">AeroBin · <b>{need} stops</b></span>

      <div ref={handle} className="sw-handle" style={{ left: `${START}%` }} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M9.5 7.5L5.5 12l4 4.5M14.5 7.5l4 4.5-4 4.5" stroke="#14170F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <input
        ref={input}
        className="sw-input" type="range" min="6" max="94" defaultValue={START}
        onChange={(e) => { held.current = performance.now(); apply(Number(e.target.value)) }}
        aria-label="Wipe between the fixed schedule and the AeroBin route"
      />
    </div>
  )
}
