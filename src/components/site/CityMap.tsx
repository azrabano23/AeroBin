import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import columbia from '../../data/columbia.json'

export type SiteBin = { id: string; location: string; lat: number; lng: number; fill: number }

const COLUMBIA: SiteBin[] = columbia.map(({ id, location, lat, lng, fill }) => ({ id, location, lat, lng, fill }))

/* Real landmarks on Berkeley's central campus. Proposed siting, labelled
   as such on the page, not an installed fleet. */
const BERKELEY: SiteBin[] = [
  { id: 'UCB-01', location: 'Sproul Plaza', lat: 37.8695, lng: -122.2595, fill: 88 },
  { id: 'UCB-02', location: 'Doe Library', lat: 37.8722, lng: -122.2593, fill: 41 },
  { id: 'UCB-03', location: 'Memorial Glade', lat: 37.8733, lng: -122.259, fill: 64 },
  { id: 'UCB-04', location: 'Sather Tower', lat: 37.8721, lng: -122.2578, fill: 27 },
  { id: 'UCB-05', location: 'Wheeler Hall', lat: 37.8711, lng: -122.259, fill: 83 },
  { id: 'UCB-06', location: 'Moffitt Library', lat: 37.8729, lng: -122.2604, fill: 55 },
  { id: 'UCB-07', location: 'Valley Life Sciences', lat: 37.8714, lng: -122.2622, fill: 19 },
  { id: 'UCB-08', location: 'Haas School of Business', lat: 37.8718, lng: -122.2536, fill: 91 },
  { id: 'UCB-09', location: 'Soda Hall', lat: 37.8756, lng: -122.2588, fill: 34 },
  { id: 'UCB-10', location: 'Cory Hall', lat: 37.8752, lng: -122.2578, fill: 72 },
  { id: 'UCB-11', location: 'Recreational Sports Facility', lat: 37.8686, lng: -122.2625, fill: 86 },
  { id: 'UCB-12', location: 'Evans Hall', lat: 37.8738, lng: -122.2578, fill: 48 },
  { id: 'UCB-13', location: 'Hearst Mining Building', lat: 37.8746, lng: -122.257, fill: 22 },
  { id: 'UCB-14', location: 'Berkeley Art Museum', lat: 37.8686, lng: -122.258, fill: 69 },
  { id: 'UCB-15', location: 'Zellerbach Hall', lat: 37.8695, lng: -122.2614, fill: 93 },
  { id: 'UCB-16', location: 'Eshleman Hall', lat: 37.8692, lng: -122.2601, fill: 37 },
  { id: 'UCB-17', location: 'Hearst Gym', lat: 37.8684, lng: -122.2598, fill: 58 },
  { id: 'UCB-18', location: 'Li Ka Shing Center', lat: 37.8737, lng: -122.2652, fill: 45 },
  { id: 'UCB-19', location: 'Stanley Hall', lat: 37.8734, lng: -122.2566, fill: 77 },
  { id: 'UCB-20', location: 'Minor Hall', lat: 37.8703, lng: -122.2559, fill: 31 },
]

const CAMPUSES = [
  {
    key: 'columbia', short: 'Columbia', name: 'Columbia University',
    place: 'Morningside Heights, New York', bins: COLUMBIA.slice(0, 40),
    source: 'surveyed fleet coordinates', zoom: 16,
  },
  {
    key: 'berkeley', short: 'Berkeley', name: 'UC Berkeley',
    place: 'Central Campus, Berkeley', bins: BERKELEY,
    source: 'proposed siting at named landmarks', zoom: 16,
  },
]

const FULL = 80
/* validated status trio: good / warning / critical */
const col = (v: number) => (v >= FULL ? '#C0392B' : v >= 60 ? '#D6A215' : '#0E7A4A')
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* A stable pseudo-random week. Seeded off the bin id and the day, so the
   same campus always plays back the same week and the route genuinely
   differs morning to morning rather than jittering at random. */
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

function fillOn(b: SiteBin, day: number) {
  const rate = 7 + hash(b.id) * 17        // how fast this site fills
  const phase = hash(b.id + 'p') * 7      // where it sat at the start of the week
  const noise = (hash(b.id + String(day)) - 0.5) * 14
  const since = (day + phase) % (100 / rate + 1.6)
  return Math.max(3, Math.min(99, since * rate + noise + 10))
}

const TRUCK = L.divIcon({
  className: 'truck',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  html:
    '<svg viewBox="0 0 30 30" fill="none">' +
    '<circle cx="15" cy="15" r="13" fill="#14170F"/>' +
    '<path d="M7 12.5h9v6H7zM16 14h3.6l2.4 2.6v1.9H16z" fill="#FAFAF7"/>' +
    '<circle cx="10.2" cy="19.4" r="1.7" fill="#FAFAF7"/>' +
    '<circle cx="19.2" cy="19.4" r="1.7" fill="#FAFAF7"/>' +
    '</svg>',
})

/* Walks the truck along the tour so the route reads as a drive, not a
   drawing. Distance-parameterised, so it does not sprint the short legs. */
function useTruck(route: Array<[number, number]>, on: boolean) {
  const [pos, setPos] = useState<[number, number] | null>(null)
  useEffect(() => {
    if (!on || route.length < 2) return setPos(null)
    const seg = route.slice(1).map((p, i) => {
      const a = route[i]
      return Math.hypot(p[0] - a[0], p[1] - a[1])
    })
    const total = seg.reduce((x, y) => x + y, 0) || 1
    let raf = 0
    const t0 = performance.now()
    const dur = 5200
    const tick = (t: number) => {
      const p = ((t - t0) % dur) / dur
      let want = p * total
      let i = 0
      while (i < seg.length && want > seg[i]) { want -= seg[i]; i++ }
      const a = route[Math.min(i, route.length - 1)]
      const b = route[Math.min(i + 1, route.length - 1)]
      const k = seg[i] ? want / seg[i] : 0
      setPos([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k])
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [route, on])
  return pos
}

function Recenter({ bins, zoom }: { bins: SiteBin[]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    const lat = bins.map((b) => b.lat)
    const lng = bins.map((b) => b.lng)
    map.flyToBounds(
      [[Math.min(...lat), Math.min(...lng)], [Math.max(...lat), Math.max(...lng)]],
      { padding: [46, 46], maxZoom: zoom, duration: 0.9 },
    )
  }, [bins, map, zoom])
  return null
}

export function CityMap() {
  const [ci, setCi] = useState(0)
  const [tiles, setTiles] = useState<'ok' | 'blocked'>('ok')
  const [day, setDay] = useState(2)
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState<'sched' | 'aero'>('aero')
  const [sel, setSel] = useState<string | null>(null)
  const c = CAMPUSES[ci]

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setDay((d) => (d + 1) % 7), 1500)
    return () => clearInterval(t)
  }, [playing])

  const f = (b: SiteBin) => fillOn(b, day)

  /* stops per day across the week: the whole argument in one strip */
  const week = useMemo(
    () => DAYS.map((_, d) => c.bins.filter((b) => fillOn(b, d) >= FULL).length),
    [c],
  )
  const stops = useMemo(
    () => (mode === 'sched' ? c.bins : c.bins.filter((b) => fillOn(b, day) >= FULL)),
    [c, day, mode],
  )

  /* greedy nearest-neighbour tour, same ordering the routing engine uses */
  const route = useMemo(() => {
    if (stops.length < 2) return stops.map((b) => [b.lat, b.lng] as [number, number])
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
    return order.map((b) => [b.lat, b.lng] as [number, number])
  }, [stops])

  const truck = useTruck(route, mode === 'aero' && stops.length > 1)
  const selBin = c.bins.find((b) => b.id === sel) ?? stops[0] ?? c.bins[0]
  const pct = c.bins.length ? Math.round(((c.bins.length - stops.length) / c.bins.length) * 100) : 0
  const centre: [number, number] = [c.bins[0].lat, c.bins[0].lng]

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
        <div className={`cm-canvas${tiles === 'blocked' ? ' no-tiles' : ''}`}>
          <MapContainer
            center={centre}
            zoom={c.zoom}
            scrollWheelZoom={false}
            zoomControl
            attributionControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
              eventHandlers={{ tileerror: () => setTiles('blocked') }}
            />
            <Recenter bins={c.bins} zoom={c.zoom} />

            <Polyline
              positions={route}
              pathOptions={{ color: '#14170F', weight: 3, opacity: 0.75, dashArray: '7 7' }}
            />

            {truck && <Marker position={truck} icon={TRUCK} interactive={false} />}

            {c.bins.map((b) => {
              const v = f(b)
              const on = stops.some((s) => s.id === b.id)
              return (
                <CircleMarker
                  key={b.id}
                  center={[b.lat, b.lng]}
                  radius={selBin?.id === b.id ? 9 : on ? 7 : 5}
                  pathOptions={{
                    color: '#fff',
                    weight: 2,
                    fillColor: col(v),
                    fillOpacity: on ? 1 : 0.45,
                  }}
                  eventHandlers={{ mouseover: () => setSel(b.id), click: () => setSel(b.id) }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    {b.location} · {Math.round(v)}%
                  </Tooltip>
                </CircleMarker>
              )
            })}
          </MapContainer>
          {tiles === 'blocked' && (
            <div className="tile-warn">Basemap unavailable. Bin positions are exact.</div>
          )}
        </div>


        <aside className="cm-side">
          <div className="cm-place">
            <div className="cm-name">{c.name}</div>
            <div className="cm-sub">{c.place}</div>
            <div className="cm-coord">
              {selBin ? `${selBin.lat.toFixed(4)}° N   ${Math.abs(selBin.lng).toFixed(4)}° W` : ''}
            </div>
          </div>

          {selBin && (
            <div className="cm-card">
              <div className="ro-row"><span className="k">Bin</span><span className="v">{selBin.id}</span></div>
              <div className="ro-row"><span className="k">Site</span><span className="v">{selBin.location}</span></div>
              <div>
                <div className="ro-row" style={{ marginBottom: 9 }}>
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
            {c.bins.length} bins · {c.source} · fill levels modelled pre pilot
          </div>
        </aside>

        <div className="scrub">
          <button
            className={`scrub-play${playing ? ' on' : ''}`}
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the week' : 'Play the week'}
          >
            {playing ? (
              <svg viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/></svg>
            ) : (
              <svg viewBox="0 0 16 16"><path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1l-7.2-4.6a.6.6 0 0 0-.92.5Z" fill="currentColor"/></svg>
            )}
          </button>

          <div className="scrub-days">
            {DAYS.map((d, i) => (
              <button
                key={d}
                className={`scrub-d${i === day ? ' on' : ''}`}
                onClick={() => { setDay(i); setPlaying(false) }}
              >
                <span className="bar" style={{ height: `${8 + (week[i] / Math.max(...week, 1)) * 28}px` }} />
                <span className="n">{week[i]}</span>
                <span className="d">{d}</span>
              </button>
            ))}
          </div>

          <div className="scrub-note">
            Stops per morning. <b>The route is different every day,</b> which is exactly what a
            fixed schedule cannot be.
          </div>
        </div>
      </div>
    </div>
  )
}
