import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/site.css'
import cad from '../assets/site/cad.png'
import { CityMap } from '../components/site/CityMap'

const EMAIL = 'azrabano.work@gmail.com'

/* ── the cursor is a bin.
      It fills as you read down the page, and its lid flips open over
      anything clickable. By the footer you have filled it.            */

function BinCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY
      const t = e.target as Element | null
      el.classList.toggle('lock', !!t?.closest('a, button, .demo, .mod, .hw-img'))
      el.classList.remove('hidden')
    }
    const out = () => el.classList.add('hidden')
    const tick = () => {
      x += (tx - x) * 0.19; y += (ty - y) * 0.19
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

  /* waste line: rises from the base of the bin as the page is consumed */
  const inner = { top: 13.5, bot: 30.5 }
  const h = (inner.bot - inner.top) * p
  const full = p > 0.85

  return (
    <div className="bin-cur hidden" ref={ref} aria-hidden>
      <svg viewBox="0 0 34 38" fill="none">
        {/* halo that pops on interactive targets */}
        <circle className="ring" cx="17" cy="21" r="16" stroke="var(--hv)" strokeWidth="1" opacity=".5" />

        {/* contents */}
        <rect
          className="fill"
          x="8.6" width="16.8"
          y={inner.bot - h} height={h}
          rx="1.4"
          fill={full ? 'var(--orange)' : 'var(--hv)'}
          opacity=".92"
        />

        {/* body */}
        <path
          className="body"
          d="M7.6 12.2h18.8l-1.5 19.1a2.6 2.6 0 0 1-2.6 2.4H11.7a2.6 2.6 0 0 1-2.6-2.4L7.6 12.2Z"
          stroke="var(--paint)" strokeWidth="1.7" strokeLinejoin="round"
        />
        <path d="M13.6 17.5v10M20.4 17.5v10" stroke="var(--paint)" strokeWidth="1.2" strokeLinecap="round" opacity=".45" />

        {/* lid — hinges open on hover */}
        <g className="lid">
          <path d="M5.4 11.2h23.2" stroke="var(--paint)" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M13.6 11.2V8.4a1.5 1.5 0 0 1 1.5-1.5h3.8a1.5 1.5 0 0 1 1.5 1.5v2.8" stroke="var(--paint)" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}

/* ── scroll reveal (content is visible without JS; this only animates) ─── */

function useReveal() {
  useEffect(() => {
    const root = document.querySelector('.site')
    if (!root) return
    root.classList.add('js')
    const els = root.querySelectorAll('.rise')
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    )
    els.forEach((el) => io.observe(el))
    // anything already on screen at load reveals immediately
    requestAnimationFrame(() => els.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight) el.classList.add('in')
    }))
    return () => io.disconnect()
  }, [])
}

/* ── count-up ──────────────────────────────────────────────────────────── */

function useCountUp(target: number, run: boolean, ms = 1100) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(target)
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return v
}

function Ticker() {
  const items = [
    ['AB-021', 'dining hall', '89%', 'COLLECT'],
    ['AB-118', 'south lot', '94%', 'COLLECT'],
    ['AB-033', 'library plaza', '22%', 'skip'],
    ['AB-090', 'dorm row a', '83%', 'COLLECT'],
    ['AB-125', 'greenhouse', '12%', 'skip'],
    ['AB-061', 'rec center', '91%', 'COLLECT'],
    ['AB-081', 'arts building', '17%', 'skip'],
    ['AB-103', 'bus loop', '73%', 'watch'],
  ]
  const row = [...items, ...items]
  return (
    <div className="tick" aria-hidden>
      <div className="tick-in">
        {row.map(([id, place, pct, verdict], i) => (
          <span key={i}>
            <i>{id}</i>
            {place}
            <b>{pct}</b>
            <i>{verdict}</i>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── the page ──────────────────────────────────────────────────────────── */

const BACKERS = [
  'Rutgers', 'Columbia', 'WINLAB', 'UC Berkeley', 'NSF', 'Verizon',
  'NJEDA', 'NYCEDC', 'NEC Labs', 'Middlesex County', 'Center for Smart Streetscapes',
  'Florida Atlantic',
]

function Stat({ n, suffix, k, src }: { n: number; suffix: string; k: string; src: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (e) => e[0].isIntersecting && (setRun(true), io.disconnect()),
      { threshold: 0.3 },
    )
    io.observe(el)
    if (el.getBoundingClientRect().top < innerHeight) setRun(true)
    /* belt and braces: if the observer never fires (odd embed, no scroll)
       the number must still land on its real value rather than sit at 0 */
    const t = setTimeout(() => setRun(true), 1600)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])
  const v = useCountUp(n, run)
  return (
    <div className="stat" ref={ref}>
      <div className="n">
        {Math.round(v)}
        {suffix}
      </div>
      <div className="k">{k}</div>
      <div className="s">{src}</div>
    </div>
  )
}

export function Site() {
  useReveal()
  useEffect(() => {
    const nav = document.querySelector('.nav')
    if (!nav) return
    const on = () => nav.classList.toggle('stuck', scrollY > 40)
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
              <path d="M5 8h14l-1.2 12.5a1.5 1.5 0 0 1-1.5 1.4H7.7a1.5 1.5 0 0 1-1.5-1.4L5 8Z" stroke="var(--acc)" strokeWidth="1.5" />
              <path d="M12 5.5V3" stroke="var(--acc)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9.2 3.4a4 4 0 0 1 5.6 0M7 1.6a7 7 0 0 1 10 0" stroke="var(--acc)" strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
            </svg>
            <span className="lock-up">
              <span className="a">AEROBIN</span>
              <span className="b">we make trash talk</span>
            </span>
          </Link>
          <div className="nav-links">
            <a href="#problem">problem</a>
            <a href="#product">product</a>
            <a href="#hardware">hardware</a>
            <a href="#platform">platform</a>
            <a href="#path">path</a>
          </div>
          <a className="btn btn-sm btn-1" href={`mailto:${EMAIL}`}>
            Talk to us
          </a>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="hero">
        <div className="wrap">
          <div className="boot rise">
            <span className="dot" />
            smart-waste infrastructure · pilot stage · new brunswick, nj
          </div>

          <h1 className="rise d1">
            We make trash <span className="mark-hi">talk.</span>
          </h1>

          <div className="hero-grid rise d2">
            <p className="lede">
              A clip-on sensor that tells operations exactly when a bin needs attention — so
              collection trucks stop running on a timer and start running on <b>what's actually
              in the bin.</b>
            </p>
            <div className="hero-cta">
              <a className="btn btn-1" href="#product">
                See it working
              </a>
              <a className="btn" href={`mailto:${EMAIL}`}>
                Talk to us
              </a>
            </div>
          </div>

          <div className="rise d3" style={{ marginTop: 'clamp(38px,5vw,64px)' }}>
            <CityMap />
          </div>
        </div>

        <div className="hazard" style={{ marginTop: 'clamp(28px,4vw,44px)' }} />
        <Ticker />
      </header>

      {/* ── backed by ── */}
      <section className="wrap backed">
        <div className="backed-l">Backed by</div>
        <div className="backed-g">
          {BACKERS.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </section>

      {/* ── 01 problem ── */}
      <section className="sec" id="problem">
        <span className="ghost" aria-hidden>01</span>
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">
              <i>01</i> the problem
            </div>
            <h2 className="t">
              What's the one thing in every room
              <br />
              you walked into today?
            </h2>
            <p className="lede">
              Trash. The most ignored object in the building, emptied on a schedule that was set
              years ago and never checked against reality. <b>Waste systems are blind.</b> They
              cannot see how full a bin is, so they cannot do better than visiting everything.
            </p>
          </div>

          <div className="stats rise d1">
            <Stat
              n={200}
              suffix="B"
              k="Spent every year on waste management in the U.S."
              src="Figure under verification — source pending"
            />
            <Stat
              n={40}
              suffix="%"
              k="Of pickups happen at bins that aren't even half full"
              src="Figure under verification — source pending"
            />
            <Stat
              n={100}
              suffix=" t"
              k="CO₂ emitted per collection truck, per year"
              src="Figure under verification — source pending"
            />
          </div>
        </div>
      </section>

      {/* ── 02 product ── */}
      <section className="sec" id="product">
        <span className="ghost" aria-hidden>02</span>
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">
              <i>02</i> the product
            </div>
            <h2 className="t">
              Which bins actually need
              <br />
              a truck <em>today?</em>
            </h2>
            <p className="lede">
              Clip a sensor onto a bin the campus already owns. It reads fill level and
              contamination, sends it over <b>Verizon RedCap 5G</b>, and the route rebuilds itself
              around the bins that are genuinely full.
            </p>
          </div>

          <div className="caps rise d1">
            {[
              {
                n: '01',
                h: 'How full is it, really?',
                p: (
                  <>
                    A sensor inside the rim measures <b>capacity and contamination</b> — not a
                    guess from a collection log. Every bin, every hour.
                  </>
                ),
                tags: ['fill level', 'contamination', 'tamper'],
              },
              {
                n: '02',
                h: 'How does it phone home?',
                p: (
                  <>
                    <b>Verizon RedCap 5G</b> — low-power cellular built for exactly this class of
                    device. No campus WiFi, no gateways, no new bins.
                  </>
                ),
                tags: ['redcap 5g', 'low power', 'no wifi'],
              },
              {
                n: '03',
                h: 'Who gets picked up today?',
                p: (
                  <>
                    The routing engine decides <b>which bins to collect and in what order</b>, and
                    hands the crew a shorter run than the one on the calendar.
                  </>
                ),
                tags: ['prediction', 'routing', 'alerts'],
              },
              {
                n: '04',
                h: 'What did it save?',
                p: (
                  <>
                    Every skipped trip is logged against the old fixed schedule, so the savings
                    case writes itself — <b>in the format procurement needs.</b>
                  </>
                ),
                tags: ['roi', 'esg reporting', 'sla'],
              },
            ].map((c) => (
              <div className="cap" key={c.n}>
                <div className="num">{c.n}</div>
                <div>
                  <h3>{c.h}</h3>
                  <p>{c.p}</p>
                </div>
                <div className="side">
                  <div className="chips">
                    {c.tags.map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 hardware ── */}
      <section className="sec" id="hardware">
        <span className="ghost" aria-hidden>03</span>
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">
              <i>03</i> the hardware
            </div>
            <h2 className="t">
              It clips on in <em>sixty seconds.</em>
            </h2>
            <p className="lede">
              A sealed, solar-assisted enclosure that hooks under the rim of a bin you already own.
              Nothing enters the bin interior. Nothing gets trenched. Nothing gets replaced.
            </p>
          </div>

          <div className="hw rise d1">
            <div className="hw-img">
              <img src={cad} alt="AeroBin sensor — front, right, top and isometric engineering views" />
            </div>
            <div className="spec">
              {[
                ['Footprint', '140 × 100 × 65–70 mm'],
                ['Mount', 'Cantilever spring clip, under-rim'],
                ['Interior', 'Nothing enters the bin cavity'],
                ['Power', 'Solar panel + internal battery pack'],
                ['Uplink', 'Verizon RedCap 5G · ThingSpace'],
                ['Senses', 'Fill capacity · contamination'],
                ['Housing', 'Gasketed, weather-sealed, tamper-resistant'],
                ['Install', '~60 seconds, no tools of consequence'],
              ].map(([k, v]) => (
                <div className="spec-r" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="src rise">
            Engineering drawing, AeroBin V1. Dimensions in millimetres. Pre-production.
          </div>
        </div>
      </section>

      {/* ── 04 platform ── */}
      <section className="sec" id="platform">
        <span className="ghost" aria-hidden>04</span>
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">
              <i>04</i> the platform
            </div>
            <h2 className="t">
              Every bin on campus,
              <br />
              on <em>one screen.</em>
            </h2>
            <p className="lede">
              The sensors are the easy half. The dashboard is where a facilities team actually
              lives — a live fleet map, the alerts that matter, and the savings case already
              written up for procurement.
            </p>
          </div>

          <div className="rise d1">
            <div className="backed-l">Clips onto what you already own</div>
            <div className="feeds">
              {[
                'indoor slim bins', 'outdoor barrels', 'dumpsters', 'compactors',
                'recycling streams', 'dining-hall waste', 'residence-hall chutes',
              ].map((f) => (
                <span className="feed" key={f}>{f}</span>
              ))}
              <span className="feed more">no new containers</span>
            </div>
          </div>

          <div className="mods rise d2">
            {[
              {
                h: 'Fleet map', b: 'live',
                p: 'Every sensor on the campus map, coloured by fill. Click through to any bin.',
                to: '/dashboard',
              },
              {
                h: 'Fill analytics', b: 'live',
                p: 'Fill curves per building and per stream, so patterns show up before complaints do.',
                to: '/dashboard',
              },
              {
                h: 'Route builder', b: 'live',
                p: 'The day\u2019s collection list, ordered — built from fill, not from the calendar.',
                to: '/dashboard',
              },
              {
                h: 'Alerts', b: 'live',
                p: 'Overflow predicted, contamination flagged, sensor gone quiet. Pushed, not polled.',
                to: '/dashboard',
              },
              {
                h: 'Savings case', b: 'live',
                p: 'Trips skipped against the old fixed schedule, costed — the file procurement asks for.',
                to: '/dashboard',
              },
              {
                h: 'Citywide view', b: 'beta',
                p: 'Multiple campuses and a municipal fleet under one coalition view.',
                to: '/dashboard',
              },
            ].map((m) => (
              <Link className="mod" to={m.to} key={m.h}>
                <div className="top">
                  <h4>{m.h}</h4>
                  <span className={`badge ${m.b}`}>{m.b === 'live' ? 'Live' : 'Beta'}</span>
                </div>
                <p>{m.p}</p>
                <span className="go">Open &#8599;</span>
              </Link>
            ))}
          </div>

          <div className="src rise">
            Dashboard runs on simulated campus data until the first pilot fleet is installed.
          </div>
        </div>
      </section>

      {/* ── 05 path ── */}
      <section className="sec" id="path">
        <span className="ghost" aria-hidden>05</span>
        <div className="wrap">
          <div className="head rise">
            <div className="eyebrow">
              <i>05</i> the path
            </div>
            <h2 className="t">Land one campus. Then the city around it.</h2>
            <p className="lede">
              Closed campus first — contained geography, one facilities decision-maker, a real
              sustainability mandate. Prove the savings, then widen the ring.
            </p>
          </div>

          <div className="path rise d1">
            {[
              {
                st: 'Testing & development',
                now: true,
                h: 'Columbia University',
                p: 'Closed campus. Controlled deployment, instrumented from day one.',
              },
              {
                st: 'Next',
                now: false,
                h: 'Rutgers University',
                p: 'Open campus — public bins, real foot traffic, messier data.',
              },
              {
                st: 'Then',
                now: false,
                h: 'New Brunswick, NJ',
                p: 'City integration. The same sensors, a municipal fleet behind them.',
              },
            ].map((s) => (
              <div className={`step${s.now ? ' now' : ''}`} key={s.h}>
                <div className="st">
                  <b />
                  {s.st}
                </div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            ))}
          </div>

          <p className="lede rise">
            Grounded in <b>50+ NSF I-Corps customer discovery interviews</b> with the facilities
            and operations staff who actually sign for this.
          </p>
        </div>
      </section>

      {/* ── close ── */}
      <section className="sec close">
        <div className="wrap">
          <h2 className="rise">
            We make trash <span className="mark-hi">talk.</span>
          </h2>
          <p className="rise d1">
            We're a student-founded team out of Rutgers and Columbia, building the data layer
            under an industry that never had one.
          </p>
          <div className="hero-cta rise d2">
            <a className="btn btn-1" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <span>AEROBIN © {new Date().getFullYear()}</span>
          <a href={`mailto:${EMAIL}`}>email</a>
          <a href="https://github.com/azrabano23/AeroBin" target="_blank" rel="noreferrer">
            github
          </a>
          <Link to="/dashboard">dashboard</Link>
          <span className="sp">New Brunswick, NJ</span>
        </div>
      </footer>
    </div>
  )
}
