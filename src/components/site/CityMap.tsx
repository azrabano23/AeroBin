import { useEffect, useMemo, useState } from 'react'
import { CAMPUSES, type Campus, type Pt, type SiteBin } from '../../data/campuses'
import columbia from '../../data/columbia.json'

/* the live fleet, straight out of the same file the dashboard reads */
const COLUMBIA_BINS: SiteBin[] = columbia.map(({ id, location, lat, lng, fill }) => ({
  id,
  location,
  lat,
  lng,
  fill,
}))

const FULL = 80
const W = 1000
const H = 620
const PAD = 52

function binsFor(c: Campus): SiteBin[] {
  return c.bins ?? COLUMBIA_BINS
}

function useProjection(c: Campus, bins: SiteBin[]) {
  return useMemo(() => {
    /* frame on the FLEET, not the whole street network — otherwise the
       bins bunch into one corner while empty blocks fill the canvas.
       Streets that fall outside simply clip at the viewport edge. */
    const lat = bins.map((b) => b.lat)
    const lng = bins.map((b) => b.lng)
    const mLa = (Math.max(...lat) - Math.min(...lat)) * 0.28 || 0.001
    const mLn = (Math.max(...lng) - Math.min(...lng)) * 0.28 || 0.001
    const la0 = Math.min(...lat) - mLa, la1 = Math.max(...lat) + mLa
    const ln0 = Math.min(...lng) - mLn, ln1 = Math.max(...lng) + mLn
    /* a degree of longitude is shorter than one of latitude by cos(lat);
       without that the city comes out stretched sideways */
    const k = Math.cos(((la0 + la1) / 2) * (Math.PI / 180))
    const dLat = la1 - la0 || 1e-6
    const dLng = (ln1 - ln0) * k || 1e-6
    const s = Math.min((W - PAD * 2) / dLng, (H - PAD * 2) / dLat)
    const ox = (W - dLng * s) / 2
    const oy = (H - dLat * s) / 2
    return (p: Pt): [number, number] => [
      ox + (p[1] - ln0) * k * s,
      H - oy - (p[0] - la0) * s,
    ]
  }, [c, bins])
}

export function CityMap() {
  const [ci, setCi] = useState(0)
  const [mode, setMode] = useState<'sched' | 'aero'>('aero')
  const [sel, setSel] = useState<string | null>(null)
  const c = CAMPUSES[ci]
  const base = useMemo(() => binsFor(c).slice(0, 40), [c])

  const [fills, setFills] = useState<Record<string, number>>({})
  useEffect(() => setFills(Object.fromEntries(base.map((b) => [b.id, b.fill]))), [base])
  useEffect(() => {
    const t = setInterval(
      () =>
        setFills((p) => {
          const n: Record<string, number> = {}
          for (const k in p) {
            const v = p[k] + Math.random() * 3.2 - 0.6
            n[k] = v > 99 ? 4 + Math.random() * 9 : Math.max(3, v)
          }
          return n
        }),
      2100,
    )
    return () => clearInterval(t)
  }, [])

  const proj = useProjection(c, base)
  const f = (b: SiteBin) => fills[b.id] ?? b.fill
  const stops = useMemo(
    () => (mode === 'sched' ? base : base.filter((b) => f(b) >= FULL)),
    [base, fills, mode],
  )

  const route = useMemo(() => {
    if (!stops.length) return ''
    const left = [...stops]
    let cur = left.reduce((a, b) => (a.lng < b.lng ? a : b))
    const order = [cur]
    left.splice(left.indexOf(cur), 1)
    while (left.length) {
      let bi = 0, bd = Infinity
      left.forEach((n, i) => {
        const d = (n.lat - cur.lat) ** 2 + (n.lng - cur.lng) ** 2
        if (d < bd) { bd = d; bi = i }
      })
      cur = left[bi]; order.push(cur); left.splice(bi, 1)
    }
    return order.map((b, i) => `${i ? 'L' : 'M'}${proj([b.lat, b.lng]).map((v) => v.toFixed(1)).join(' ')}`).join(' ')
  }, [stops, proj])

  const selBin = base.find((b) => b.id === sel) ?? stops[0] ?? base[0]
  const saved = base.length - stops.length
  const pct = base.length ? Math.round((saved / base.length) * 100) : 0
  const col = (v: number) => (v >= FULL ? 'var(--orange)' : v >= 60 ? 'var(--amber)' : 'var(--hv)')

  return (
    <div className="citymap">
      <div className="cm-h">
        <div className="cm-tabs">
          {CAMPUSES.map((x, i) => (
            <button key={x.key} className={i === ci ? 'on' : ''} onClick={() => { setCi(i); setSel(null) }}>
              {x.short}
            </button>
          ))}
        </div>
        <div className="seg">
          <button className={mode === 'sched' ? 'on' : ''} onClick={() => setMode('sched')}>Fixed schedule</button>
          <button className={mode === 'aero' ? 'on' : ''} onClick={() => setMode('aero')}>AeroBin</button>
        </div>
      </div>

      <div className="cm-body">
        <div className="cm-canvas">
          <svg viewBox={`0 0 ${W} ${H}`} className="cm-svg" role="img" aria-label={`${c.name} bin map`}>
            <polygon
              points={c.block.map((p) => proj(p).join(',')).join(' ')}
              fill="rgba(201,245,63,.055)" stroke="var(--hv-dark)" strokeWidth="1.1" strokeDasharray="6 5"
            />
            {c.streets.map((s) => (
              <path
                key={s.name}
                d={s.pts.map((p, i) => `${i ? 'L' : 'M'}${proj(p).join(' ')}`).join(' ')}
                fill="none"
                stroke={s.water ? '#1E4A5A' : s.major ? '#3B4634' : '#262E21'}
                strokeWidth={s.water ? 8 : s.major ? 4 : 2.2}
                strokeLinecap="round"
              />
            ))}
            {c.streets.map((s) => {
              const [x, y] = proj(s.pts[Math.floor(s.pts.length / 2)])
              return <text key={`t${s.name}`} x={x + 8} y={y - 7} className="cm-lbl">{s.name}</text>
            })}

            <path d={route} className="cm-route" fill="none" />

            {base.map((b) => {
              const [x, y] = proj([b.lat, b.lng])
              const v = f(b)
              const on = stops.some((s) => s.id === b.id)
              const isSel = selBin?.id === b.id
              return (
                <g key={b.id} onMouseEnter={() => setSel(b.id)} className="cm-bin">
                  <circle cx={x} cy={y} r="14" fill="transparent" />
                  {on && <circle cx={x} cy={y} r="9.5" fill="none" stroke={col(v)} strokeWidth="1.3" opacity=".45" />}
                  <circle cx={x} cy={y} r={isSel ? 5.6 : 4.1} fill={on ? col(v) : 'var(--asphalt-2)'} stroke={col(v)} strokeWidth="1.7" />
                </g>
              )
            })}
          </svg>
          <div className="cm-scale">
            <span /> 200 m
          </div>
        </div>

        <aside className="cm-side">
          <div className="cm-place">
            <div className="cm-name">{c.name}</div>
            <div className="cm-sub">{c.place}</div>
            <div className="cm-coord">
              {selBin ? `${selBin.lat.toFixed(4)}° N   ${Math.abs(selBin.lng).toFixed(4)}° W` : '—'}
            </div>
          </div>

          {selBin && (
            <div className="cm-card">
              <div className="ro-row"><span className="k">Bin</span><span className="v">{selBin.id}</span></div>
              <div className="ro-row"><span className="k">Site</span><span className="v">{selBin.location}</span></div>
              <div style={{ marginTop: 6 }}>
                <div className="ro-row" style={{ marginBottom: 8 }}>
                  <span className="k">Fill</span>
                  <span className="v" style={{ color: col(f(selBin)) }}>{Math.round(f(selBin))}%</span>
                </div>
                <div className="meter">
                  <i style={{ width: `${Math.round(f(selBin))}%`, background: col(f(selBin)) }} />
                </div>
              </div>
            </div>
          )}

          <div className="tally">
            <div>
              <div className="n">{stops.length}</div>
              <div className="k">stops today</div>
            </div>
            <div>
              <div className={`n ${mode === 'aero' ? 'acc' : ''}`}>{mode === 'aero' ? `${pct}%` : '0%'}</div>
              <div className="k">trips avoided</div>
            </div>
          </div>

          <div className="cm-note">
            {base.length} bins ·{' '}
            {c.source === 'fleet' ? 'fleet coordinates' : 'proposed siting at named landmarks'} ·{' '}
            {c.baseMap} · fill levels simulated
          </div>
        </aside>
      </div>
    </div>
  )
}
