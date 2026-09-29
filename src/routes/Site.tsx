import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/site.css'
import { CityMap } from '../components/site/CityMap'
import { FillCurve, StopDots, ContamBar, SavedArea } from '../components/site/Figures'
import { Guess } from '../components/site/Guess'
import icon from '../assets/logos/aerobin-icon.png'
import rutgers from '../assets/logos/rutgers-mark.png'
import columbiaL from '../assets/logos/columbia.png'
import qualcomm from '../assets/logos/qualcomm.png'
import winlab from '../assets/logos/winlab.png'
import nsfcss from '../assets/logos/nsf-css.png'
import njeda from '../assets/logos/njeda.png'
import nycedc from '../assets/logos/nycedc.png'
import nec from '../assets/logos/nec.png'
import njL from '../assets/logos/nj.png'

const CAL = 'https://calendar.app.google/rJh5jvabPLHewpj18'
const CONTACT = 'aerobin.contact@gmail.com'
const FOUNDER = 'azrabano.work@gmail.com'

/* ── cursor: a bin that fills as you read, lid opens on anything live ─── */

function BinCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0, tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY
      const t = e.target as Element | null
      el.classList.toggle('lock', !!t?.closest('a, button, .citymap, .mod, .bin-c'))
      el.classList.remove('hidden')
    }
    const out = () => el.classList.add('hidden')
    const tick = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2
      el.style.transform = `translate3d(${x}px,${y}px,0)`
      raf = requestAnimationFrame(tick)
    }
    const scroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight
      setP(h > 0 ? Math.min(1, scrollY / h) : 0)
    }
    addEventListener('pointermove', move, { passive: true })
    addEventListener('scroll', scroll, { passive: true })
    document.addEventListener('pointerleave', out)
    scroll(); tick()
    return () => {
      removeEventListener('pointermove', move)
      removeEventListener('scroll', scroll)
      document.removeEventListener('pointerleave', out)
      cancelAnimationFrame(raf)
    }
  }, [])
  const top = 12, bot = 28
  const h = (bot - top) * p
  return (
    <div className="bin-cur hidden" ref={ref} aria-hidden>
      <svg viewBox="0 0 30 34" fill="none">
        <circle className="ring" cx="15" cy="19" r="15" stroke="#1B6B45" strokeWidth="1" opacity=".45" />
        <rect x="7.4" width="15.2" y={bot - h} height={h} rx="1.3" fill={p > 0.85 ? '#C0432C' : '#1B6B45'} opacity=".9" />
        <path d="M6.6 10.8h16.8l-1.3 17.4a2.4 2.4 0 0 1-2.4 2.2h-9.4a2.4 2.4 0 0 1-2.4-2.2L6.6 10.8Z"
          stroke="#14170F" strokeWidth="1.7" strokeLinejoin="round" />
        <g className="lid">
          <path d="M4.6 9.9h20.8" stroke="#14170F" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M12 9.9V7.5a1.4 1.4 0 0 1 1.4-1.4h3.2A1.4 1.4 0 0 1 18 7.5v2.4"
            stroke="#14170F" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}

function useReveal() {
  useEffect(() => {
    const root = document.querySelector('.site')
    if (!root) return
    root.classList.add('js')
    const els = root.querySelectorAll('.rise')
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    )
    els.forEach((el) => io.observe(el))
    requestAnimationFrame(() =>
      els.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in') }))
    const t = setTimeout(() => els.forEach((el) => el.classList.add('in')), 2200)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])
}

/* ── bin types: what the sensor clips onto ────────────────────────────── */

const BIN_TYPES = [
  {
    name: 'Indoor slim',
    note: 'Corridors, lecture halls, offices. The highest bin count on any campus.',
    art: (
      <svg viewBox="0 0 120 150" fill="none">
        <path d="M34 42h52l-5 90a8 8 0 0 1-8 7.4H47a8 8 0 0 1-8-7.4L34 42Z" fill="#F2F2ED" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="28" y="33" width="64" height="9" rx="4.5" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
        <rect x="50" y="24" width="20" height="9" rx="3" fill="#fff" stroke="#14170F" strokeWidth="2.2" />
        <path d="M44 62v62M60 62v62M76 62v62" stroke="#D2D4C9" strokeWidth="2" strokeLinecap="round" />
        <g><rect x="80" y="44" width="21" height="15" rx="4" fill="#1B6B45" /><path d="M86 41.5a6 6 0 0 1 9 0M83.5 38a10 10 0 0 1 14 0" stroke="#1B6B45" strokeWidth="2" strokeLinecap="round" /></g>
      </svg>
    ),
  },
  {
    name: 'Outdoor barrel',
    note: 'Quads, plazas, transit stops. Where overflow becomes a complaint.',
    art: (
      <svg viewBox="0 0 120 150" fill="none">
        <path d="M30 46h60l-6 88a8 8 0 0 1-8 7.4H44a8 8 0 0 1-8-7.4L30 46Z" fill="#F2F2ED" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M24 46c0-7 16-12 36-12s36 5 36 12" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
        <ellipse cx="60" cy="34" rx="30" ry="8" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
        <path d="M38 70l3 58M60 70v58M82 70l-3 58" stroke="#D2D4C9" strokeWidth="2" strokeLinecap="round" />
        <g><rect x="84" y="50" width="21" height="15" rx="4" fill="#1B6B45" /><path d="M90 47.5a6 6 0 0 1 9 0M87.5 44a10 10 0 0 1 14 0" stroke="#1B6B45" strokeWidth="2" strokeLinecap="round" /></g>
      </svg>
    ),
  },
  {
    name: 'Recycling stream',
    note: 'Paired streams where the expensive failure is contamination, not volume.',
    art: (
      <svg viewBox="0 0 120 150" fill="none">
        <path d="M14 48h44l-4 84a7 7 0 0 1-7 6.6H25a7 7 0 0 1-7-6.6L14 48Z" fill="#E8F2EC" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M62 48h44l-4 84a7 7 0 0 1-7 6.6H73a7 7 0 0 1-7-6.6L62 48Z" fill="#F2F2ED" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="10" y="40" width="52" height="8" rx="4" fill="#fff" stroke="#14170F" strokeWidth="2.2" />
        <rect x="58" y="40" width="52" height="8" rx="4" fill="#fff" stroke="#14170F" strokeWidth="2.2" />
        <path d="M30 64l6 10 6-10M36 74V62" stroke="#1B6B45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <g><rect x="94" y="52" width="20" height="14" rx="4" fill="#1B6B45" /><path d="M99.5 49.5a6 6 0 0 1 9 0" stroke="#1B6B45" strokeWidth="2" strokeLinecap="round" /></g>
      </svg>
    ),
  },
  {
    name: 'Dumpster',
    note: 'Loading docks and dining halls. One truck visit here is the costliest stop.',
    art: (
      <svg viewBox="0 0 120 150" fill="none">
        <path d="M14 62h92l-9 58H23L14 62Z" fill="#F2F2ED" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M10 54h100l-4 8H14l-4-8Z" fill="#fff" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M30 76l3 32M60 76v32M90 76l-3 32" stroke="#D2D4C9" strokeWidth="2" strokeLinecap="round" />
        <circle cx="33" cy="128" r="8" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
        <circle cx="87" cy="128" r="8" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
        <g><rect x="88" y="34" width="22" height="15" rx="4" fill="#1B6B45" /><path d="M94.5 31.5a6 6 0 0 1 9 0M92 28a10 10 0 0 1 14 0" stroke="#1B6B45" strokeWidth="2" strokeLinecap="round" /></g>
      </svg>
    ),
  },
]

const BACKED_BY: Array<[string, string] | string> = [
  [rutgers, 'Rutgers University'],
  'Verizon',
  [qualcomm, 'Qualcomm'],
]

/* Real marks where the deck carried one, set wordmarks where it did not. */
const TALENT: Array<[string, string] | string> = [
  'Google',
  'NASA',
  'Goldman Sachs',
  'Y Combinator',
  'MIT',
  'IEEE',
  'CCICADA',
  'Verizon',
  [columbiaL, 'Columbia University'],
  [rutgers, 'Rutgers University'],
  [winlab, 'WINLAB'],
  [nsfcss, 'NSF Center for Smart Streetscapes'],
  [nycedc, 'NYC EDC'],
  [njeda, 'New Jersey EDA'],
  [njL, 'State of New Jersey'],
  [nec, 'NEC Labs America'],
]

const AWARDS: Array<[string, string]> = [
  ['1st place, national', 'Verizon Smart Campus Competition'],
  ['Winner', 'Rutgers Shark Tank university-wide ideation competition'],
]

function LogoRow({ label, items }: { label: string; items: Array<[string, string] | string> }) {
  return (
    <>
      <div className="backed-l">{label}</div>
      <div className="backed-g">
        {items.map((it) =>
          typeof it === 'string' ? (
            <span className="wordmark" key={it}>{it}</span>
          ) : (
            <img key={it[1]} src={it[0]} alt={it[1]} title={it[1]} />
          ),
        )}
      </div>
    </>
  )
}

function Stat({ n, suffix, k, s }: { n: number; suffix: string; k: string; s: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const run = () => {
      const t0 = performance.now()
      const step = (t: number) => {
        const pr = Math.min(1, (t - t0) / 1100)
        setV(n * (1 - Math.pow(1 - pr, 3)))
        if (pr < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { run(); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    const t = setTimeout(run, 1800) // never leave a zero on screen
    return () => { io.disconnect(); clearTimeout(t); cancelAnimationFrame(raf) }
  }, [n])
  return (
    <div className="stat" ref={ref}>
      <div className="n">{Math.round(v)}{suffix}</div>
      <div className="k">{k}</div>
      <div className="s">{s}</div>
    </div>
  )
}

export function Site() {
  useReveal()
  useEffect(() => {
    const nav = document.querySelector('.nav')
    if (!nav) return
    const on = () => nav.classList.toggle('stuck', scrollY > 30)
    addEventListener('scroll', on, { passive: true })
    on()
    return () => removeEventListener('scroll', on)
  }, [])

  return (
    <div className="site">
      <BinCursor />

      <nav className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5.5 8h13l-1.1 12.3a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5L5.5 8Z" stroke="#14170F" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M4 7h16" stroke="#14170F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M10 7V5.6A1.2 1.2 0 0 1 11.2 4.4h1.6A1.2 1.2 0 0 1 14 5.6V7" stroke="#14170F" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="9.6" y="12" width="4.8" height="7" rx="1" fill="#1B6B45" />
            </svg>
            <span className="lock-up">
              <span className="a">AeroBin</span>
              <span className="b">We make trash talk.</span>
            </span>
          </Link>
          <div className="nav-links">
            <a href="#problem">Problem</a>
            <a href="#sensor">Sensor</a>
            <a href="#map">Map</a>
            <a href="#dashboard">Dashboard</a>
          </div>
          <a className="btn btn-sm btn-1" href={CAL} target="_blank" rel="noreferrer">Book a pilot call</a>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="wrap hero">
        <div className="hero-mark rise">
          <img src={icon} alt="" aria-hidden />
          <span>AeroBin</span>
        </div>
        <h1 className="rise d1">We make trash <span className="g">talk.</span></h1>
        <div className="hero-grid rise d2">
          <p className="lede">
            Collection trucks run on a fixed calendar, not on what is in the bin. AeroBin clips a
            sensor onto the bins a campus already owns, so every route is built from{' '}
            <b>real fill levels instead of a guess.</b>
          </p>
          <div className="hero-cta">
            <a className="btn btn-1" href={CAL} target="_blank" rel="noreferrer">Book a pilot call</a>
            <a className="btn" href="#map">See a live campus</a>
          </div>
        </div>
        <div className="rise d3" style={{ marginTop: 'clamp(36px,5vw,64px)' }} id="map">
          <CityMap />
        </div>
      </header>

      <section className="wrap backed">
        <LogoRow label="Backed by" items={BACKED_BY} />
        <div className="awards">
          {AWARDS.map(([k, v]) => (
            <div className="award" key={v}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M8 3h8v6a4 4 0 0 1-8 0V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M8 4.5H5.5a3 3 0 0 0 3 3M16 4.5H18.5a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 13v4M9 21h6M10.5 17h3l.6 4h-4.2l.6-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              <div>
                <b>{k}</b>
                <span>{v}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── problem ── */}
      <section className="sec" id="problem">
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">01 / The problem</div>
            <h2 className="t">Trucks run on a timer,<br />not on what is in the bin.</h2>
            <p className="lede">
              Every bin gets visited every few days whether it is full or empty. Nobody is being
              careless. The system simply cannot see fill level, so it cannot do better than
              visiting everything.
            </p>
          </div>
          <div className="rise d1">
            <Guess />
          </div>

          <div className="stats rise d2">
            <Stat n={200} suffix="B" k="Spent every year on waste management in the U.S." s="Figure under verification" />
            <Stat n={40} suffix="%" k="Of pickups happen at bins that are not even half full" s="Figure under verification" />
            <Stat n={100} suffix=" t" k="CO2 emitted per collection truck, per year" s="Figure under verification" />
          </div>
        </div>
      </section>

      {/* ── sensor ── */}
      <section className="sec" id="sensor">
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">02 / The sensor</div>
            <h2 className="t">One clip. Any bin you<br />already own.</h2>
            <p className="lede">
              It hooks under the rim in about a minute. Nothing enters the bin cavity, nothing gets
              trenched, and no container gets replaced. It reads how full the bin is and whether
              the wrong thing went in it, then reports over Verizon RedCap 5G.
            </p>
          </div>
          <div className="bins rise d1">
            {BIN_TYPES.map((b) => (
              <div className="bin-c" key={b.name}>
                {b.art}
                <div>
                  <h4>{b.name}</h4>
                  <p>{b.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="src rise">Sensor shown mounted under the rim. Enclosure is pre production.</div>
        </div>
      </section>

      {/* ── capabilities ── */}
      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">03 / What it answers</div>
            <h2 className="t">Four questions operations<br />could never answer before.</h2>
          </div>
          <div className="caps rise d1">
            {[
              { n: '01', h: 'How full is that bin, right now?', p: <>Capacity read continuously, not inferred from a collection log. <b>Every bin, every hour.</b></>, fig: <FillCurve /> },
              { n: '02', h: 'Which bins need a truck today?', p: <>The route is rebuilt each morning from live fill, so a crew drives a <b>shorter run than the calendar</b> would have given them.</>, fig: <StopDots /> },
              { n: '03', h: 'Did the wrong thing go in?', p: <>Contamination gets flagged at the bin instead of at the sorting facility, where it costs the most to find.</>, fig: <ContamBar /> },
              { n: '04', h: 'What is this actually saving?', p: <>Every skipped trip is logged against the old fixed schedule and costed, so the savings case is <b>already written when procurement asks.</b></>, fig: <SavedArea /> },
            ].map((c) => (
              <div className="cap" key={c.n}>
                <div className="num">{c.n}</div>
                <div><h3>{c.h}</h3><p>{c.p}</p></div>
                {c.fig}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── dashboard ── */}
      <section className="sec" id="dashboard">
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">04 / The dashboard</div>
            <h2 className="t">Every bin on campus,<br />on <span style={{ color: 'var(--grn)' }}>one screen.</span></h2>
            <p className="lede">
              The sensors are the easy half. The dashboard is where a facilities team actually
              lives: a live fleet map, the alerts that matter, and the savings case already made.
            </p>
          </div>
          <div className="mods rise d1">
            {[
              ['Fleet map', 'Every sensor on the campus map, coloured by fill. Click through to any bin.'],
              ['Fill analytics', 'Fill curves per building and per stream, so patterns show up before complaints do.'],
              ['Route builder', "The day's collection list, ordered, built from fill rather than from the calendar."],
              ['Alerts', 'Overflow predicted, contamination flagged, sensor gone quiet. Pushed, not polled.'],
              ['Savings case', 'Trips skipped against the old schedule, costed, exportable.'],
              ['Citywide view', 'Multiple campuses and a municipal fleet under one coalition view.'],
            ].map(([h, p]) => (
              <Link className="mod" to="/dashboard" key={h}>
                <div className="top"><h4>{h}</h4><span className="badge live">Live</span></div>
                <p>{p}</p>
                <span className="go">Open &#8599;</span>
              </Link>
            ))}
          </div>
          <div className="src rise">Dashboard runs on simulated campus data until the first pilot fleet is installed.</div>
        </div>
      </section>

      {/* ── where it runs ── */}
      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">05 / Where it runs</div>
            <h2 className="t">We started on college campuses.</h2>
            <p className="lede">
              A campus is the cleanest place to prove this. Contained geography, one facilities
              decision maker, a real sustainability mandate, and enough bins that the routing
              actually matters. What works there is the same system a city runs.
            </p>
          </div>
          <div className="path rise d1">
            {[
              { st: 'In progress', now: true, h: 'Columbia University', p: 'Closed campus. Controlled deployment, instrumented from the first day.' },
              { st: 'Next', now: false, h: 'Open campus', p: 'Public bins, real foot traffic, messier data and harder routing.' },
              { st: 'Then', now: false, h: 'Municipal fleet', p: 'The same sensors with a city collection fleet behind them.' },
            ].map((s) => (
              <div className={`step${s.now ? ' now' : ''}`} key={s.h}>
                <div className="st"><b />{s.st}</div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
          <p className="lede rise">
            Grounded in <b>50+ NSF I-Corps customer discovery interviews</b> with the facilities and
            operations staff who sign for this.
          </p>
        </div>
      </section>

      {/* ── close ── */}
      <section className="close">
        <div className="wrap">
          <h2 className="rise">We make trash <span className="g">talk.</span></h2>
          <p className="rise d1">
            If you build, buy or fund city infrastructure, we would like to show you the pilot.
          </p>
          <div className="hero-cta rise d2">
            <a className="btn btn-1" href={CAL} target="_blank" rel="noreferrer">Book a pilot call</a>
            <a className="btn" href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </div>
          <div className="src rise d3" style={{ marginTop: 22 }}>
            Founder: <a href={`mailto:${FOUNDER}`}>{FOUNDER}</a>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <LogoRow label="Built with talent from" items={TALENT} />
          <div className="foot-in">
            <span>AeroBin, est. 2025</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
