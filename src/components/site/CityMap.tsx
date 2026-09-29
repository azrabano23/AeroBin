import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet'
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
    source: 'live fleet coordinates', zoom: 16,
  },
  {
    key: 'berkeley', short: 'Berkeley', name: 'UC Berkeley',
    place: 'Central Campus, Berkeley', bins: BERKELEY,
    source: 'proposed siting at named landmarks', zoom: 16,
  },
]

const FULL = 80
const col = (v: number) => (v >= FULL ? '#C0432C' : v >= 60 ? '#B8792A' : '#1B6B45')

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
  const [mode, setMode] = useState<'sched' | 'aero'>('aero')
  const [sel, setSel] = useState<string | null>(null)
  const c = CAMPUSES[ci]

  const [fills, setFills] = useState<Record<string, number>>({})
  useEffect(() => setFills(Object.fromEntries(c.bins.map((b) => [b.id, b.fill]))), [c])
  useEffect(() => {
    const t = setInterval(
      () => setFills((p) => {
        const n: Record<string, number> = {}
        for (const k in p) {
          const v = p[k] + Math.random() * 3.2 - 0.6
          n[k] = v > 99 ? 4 + Math.random() * 9 : Math.max(3, v)
        }
        return n
      }),
      2200,
    )
    return () => clearInterval(t)
  }, [])

  const f = (b: SiteBin) => fills[b.id] ?? b.fill
  const stops = useMemo(
    () => (mode === 'sched' ? c.bins : c.bins.filter((b) => f(b) >= FULL)),
    [c, fills, mode],
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
            <div className="tile-warn">basemap blocked on this network, loads on deploy</div>
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
            {c.bins.length} bins · {c.source} · fill levels simulated
          </div>
        </aside>
      </div>
    </div>
  )
}
