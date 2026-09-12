import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/site.css'

/* ── config ───────────────────────────────────────────────────────────────
   >>> CHANGE THIS to the address you want investors to reach you at. <<<
   ───────────────────────────────────────────────────────────────────────── */

const CONTACT_EMAIL = 'hello@aerobin.io'

/* ── ascii ─────────────────────────────────────────────────────────────── */

const WORDMARK = [
  ' █████  ███████ ██████   ██████  ██████  ██ ███    ██',
  '██   ██ ██      ██   ██ ██    ██ ██   ██ ██ ████   ██',
  '███████ █████   ██████  ██    ██ ██████  ██ ██ ██  ██',
  '██   ██ ██      ██   ██ ██    ██ ██   ██ ██ ██  ██ ██',
  '██   ██ ███████ ██   ██  ██████  ██████  ██ ██   ████',
].join('\n')

const SCHEDULE = `             MON    TUE    WED    THU    FRI    SAT    SUN
  truck      [x]    [x]    [x]    [x]    [x]    [x]    [x]     7 visits
  bin full    .      .      .      .     [!]     .      .      1 actually needed
             ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
             6 of 7 pickups burned labor, fuel and CO2 for nothing`

const SCHEDULE_SM = `       M   T   W   T   F   S   S
 truck[x] [x] [x] [x] [x] [x] [x]
 full  .   .   .   .  [!]  .   .
      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 7 truck visits, 1 actually needed
 6 of 7 burned fuel and labor`

const PIPELINE_SM = ` ╔═══════════╗
 ║    BIN    ║  any bin you own
 ╚═════╤═════╝
       │
 ╔═════▼═════╗
 ║  SENSOR   ║  ~$100, clips on
 ╚═════╤═════╝
       │
 ╔═════▼═════╗
 ║ REDCAP 5G ║  no trenching
 ╚═════╤═════╝
       │
 ╔═════▼═════╗
 ║  ROUTING  ║  predict + order
 ╚═════╤═════╝
       │
 ╔═════▼═════╗
 ║ DASHBOARD ║  routed crew
 ╚═══════════╝`

const BIN_SM = `      .-.
   ((  ●  ))  ~ ~ ~
      '-'
  ┌───────────┐
  │  AEROBIN  │
  ├───────────┤
  │███████████│
  │███████████│
  │███████████│
  │░░░░░░░░░░░│
  └───────────┘

  fill .......... 88%
  contamination .. clear
  battery ........ 97%
  uplink ......... redcap 5g
  verdict ........ COLLECT`

const PIPELINE = `  ╔═══════════╗   ╔═══════════╗   ╔═══════════╗   ╔═══════════╗   ╔═══════════╗
  ║    BIN    ║   ║  AEROBIN  ║   ║  VERIZON  ║   ║  ROUTING  ║   ║    OPS    ║
  ║  any bin  ║──>║  SENSOR   ║──>║ REDCAP 5G ║──>║  ENGINE   ║──>║ DASHBOARD ║
  ║  you own  ║   ║   ~$100   ║   ║  uplink   ║   ║ predict + ║   ║  routed   ║
  ║           ║   ║ fill+cont ║   ║ low power ║   ║   order   ║   ║   crew    ║
  ╚═══════════╝   ╚═══════════╝   ╚═══════════╝   ╚═══════════╝   ╚═══════════╝
    installed        clips on        no new         separately        what a
    yesterday        in minutes      trenching      tested repo       crew sees`

const BIN = `        .-.
     ((  ●  ))   ~ ~ ~
        '-'
    ┌───────────┐
    │  AEROBIN  │   fill .......... 88%
    ├───────────┤   contamination .. clear
    │███████████│   battery ........ 97%
    │███████████│   uplink ......... redcap 5g
    │███████████│   verdict ........ COLLECT
    │░░░░░░░░░░░│
    └───────────┘`

const FOOT_BIN = `   ┌─────────┐
   │▓▓▓▓▓▓▓▓▓│
   │▓▓▓▓▓▓▓▓▓│
   └─────────┘`

function bar(pct: number, width = 44, fill = '█', empty = '·') {
  const n = Math.max(pct > 0 ? 1 : 0, Math.round((pct / 100) * width))
  return fill.repeat(n) + empty.repeat(Math.max(0, width - n))
}

/* [ wide label, narrow label, percent, readout ] — percent < 0 is a spacer */
const SERIES: Array<[string, string, number, string]> = [
  ['wasteful pickups, fixed schedule', 'wasteful, fixed schedule', 87, '87%'],
  ['wasteful pickups, aerobin routing', 'wasteful, aerobin', 0.5, '0.5%'],
  ['', '', -1, ''],
  ['servicing events, before', 'servicing, before', 100, '100'],
  ['servicing events, after', 'servicing, after', 30, '30  (-70%)'],
]

function numbersChart(narrow: boolean) {
  if (!narrow) {
    return SERIES.map(([label, , pct, val]) =>
      pct < 0 ? '' : `  ${label.padEnd(34)}${bar(pct, 44)}  ${val}`,
    ).join('\n')
  }
  // stack the label above a shorter bar so it stays legible on a phone
  return SERIES.map(([, label, pct, val]) =>
    pct < 0 ? '' : `  ${label}\n  ${bar(pct, 18)}  ${val}`,
  ).join('\n')
}

/* ── viewport ──────────────────────────────────────────────────────────── */

function useNarrow(query = '(max-width: 720px)') {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    on()
    return () => mq.removeEventListener('change', on)
  }, [query])
  return narrow
}

/* ── simulated telemetry ───────────────────────────────────────────────── */

type Row = { id: string; site: string; fill: number }

const SEED: Row[] = [
  { id: 'BIN-0142', site: 'quad-north', fill: 52 },
  { id: 'BIN-0187', site: 'dining-hall', fill: 88 },
  { id: 'BIN-0203', site: 'library-plaza', fill: 19 },
  { id: 'BIN-0231', site: 'busch-student', fill: 74 },
]

function Telemetry() {
  const [rows, setRows] = useState(SEED)
  const narrow = useNarrow()

  useEffect(() => {
    const t = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const next = r.fill + Math.random() * 2.2 - 0.55
          return { ...r, fill: next > 99 ? 6 : Math.max(2, next) }
        }),
      )
    }, 1600)
    return () => clearInterval(t)
  }, [])

  const text = useMemo(() => {
    const nameW = narrow ? 14 : 15
    const barW = narrow ? 8 : 16
    const rule = narrow ? 34 : 60
    const body = rows
      .map((r) => {
        const f = Math.round(r.fill)
        const verdict = f >= 80 ? 'COLLECT' : f >= 65 ? 'watch  ' : 'ok     '
        const id = narrow ? '' : `${r.id}  `
        return `  ${id}${r.site.padEnd(nameW)}[${bar(f, barW, '█', '░')}] ${String(f).padStart(3)}%  ${verdict}`
      })
      .join('\n')
    const collect = rows.filter((r) => r.fill >= 80).length
    return [
      narrow ? '  $ aerobin tail --rutgers' : '  $ aerobin tail --site rutgers-livingston',
      '  ' + '─'.repeat(rule),
      body,
      '  ' + '─'.repeat(rule),
      `  route: ${collect} stop${collect === 1 ? '' : 's'} · ${rows.length - collect} skipped`,
    ].join('\n')
  }, [rows, narrow])

  return (
    <div className="ascii-box" style={{ marginTop: 34 }}>
      <pre className="ascii" style={{ fontSize: 11.5 }}>
        {text}
      </pre>
      <div style={{ marginTop: 14, fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--dim)' }}>
        SIMULATED STREAM — THE REAL ONE LIVES IN THE DASHBOARD
      </div>
    </div>
  )
}

/* ── section helper ────────────────────────────────────────────────────── */

function Label({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="sec-label">
      <i>[{n}]</i>
      {children}
    </div>
  )
}

/* ── page ──────────────────────────────────────────────────────────────── */

export function Site() {
  const root = useRef<HTMLDivElement>(null)
  const narrow = useNarrow()

  useEffect(() => {
    const els = root.current?.querySelectorAll('.rv')
    if (!els?.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="site" ref={root}>
      {/* ── nav ── */}
      <nav className="nav">
        <div className="wrap nav-in">
          <div className="nav-mark">
            AEROBIN<span>.</span>
          </div>
          <div className="nav-links">
            <a href="#problem">problem</a>
            <a href="#system">system</a>
            <a href="#numbers">numbers</a>
            <a href="#market">market</a>
            <a href="#team">team</a>
          </div>
          <Link to="/dashboard" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }}>
            live dashboard →
          </Link>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="wrap hero">
        <div className="hero-kicker">
          <i>●</i> smart-waste infrastructure — retrofit, not rip-and-replace
        </div>

        <pre className="wordmark">{WORDMARK}</pre>

        <h1>
          Cities collect garbage <em>blind.</em>
          <br />
          We give every bin eyes.
          <span className="cursor" />
        </h1>

        <p>
          A <b>~$100 clip-on sensor</b> turns any bin a campus or city already owns into a connected
          one — reporting fill level and contamination over <b>Verizon RedCap 5G</b> — so crews get
          routed only to the bins that actually need collection.
        </p>
        <p>
          No new bins. No trenching. No rip-and-replace. Install it this afternoon and stop paying
          trucks to visit empty containers.
        </p>

        <div className="hero-cta">
          <Link to="/dashboard" className="btn btn-primary">
            [ open the live dashboard ]
          </Link>
          <a className="btn" href="#problem">
            [ read the thesis ]
          </a>
        </div>

        <Telemetry />
      </header>

      {/* ── proof ── */}
      <section className="proof">
        <div>
          <dt>Competition</dt>
          <dd>
            <b>1st place, national</b> — Verizon Smart Campus Competition
          </dd>
        </div>
        <div>
          <dt>Validation</dt>
          <dd>
            <b>NSF I-Corps</b> — 50+ customer-discovery interviews
          </dd>
        </div>
        <div>
          <dt>Advisors</dt>
          <dd>
            <b>Rutgers</b> · NEC Labs · NYC/NJ EDA
          </dd>
        </div>
      </section>

      {/* ── 01 problem ── */}
      <section className="sec" id="problem">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="01">the problem</Label>
            <h2 className="sec-title">Waste collection still runs on a timer.</h2>
            <p className="sec-lede">
              Trucks visit every bin every N days regardless of how full it is. That's expensive and
              dirty: <b>collection — not disposal — is the single largest line item</b> in municipal
              solid-waste budgets, and global solid-waste spending runs into the hundreds of billions
              per year (
              <a
                href="https://datatopics.worldbank.org/what-a-waste/"
                target="_blank"
                rel="noreferrer"
              >
                World Bank, What a Waste 2.0
              </a>
              ).
            </p>
            <p className="sec-lede">
              A large fraction of pickups happen at bins that are barely full — burning labor, fuel
              and CO₂ for nothing — while the genuinely full ones overflow between visits. The root
              cause is simple: <b>the system is blind.</b> It can't see fill level, so it can't make
              a better decision than "visit everything on a timer."
            </p>
          </div>

          <div className="ascii-box rv">
            <pre className="ascii ascii-fg">{narrow ? SCHEDULE_SM : SCHEDULE}</pre>
          </div>
        </div>
      </section>

      {/* ── 02 system ── */}
      <section className="sec" id="system">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="02">the system</Label>
            <h2 className="sec-title">Sensor → uplink → decision → crew.</h2>
            <p className="sec-lede">
              Four moving parts, one loop. The hardware is deliberately dumb and cheap; the value
              compounds in the routing engine and the fill history it accumulates per site.
            </p>
          </div>

          <div className="ascii-box rv" style={{ marginBottom: 34 }}>
            <pre className="ascii">{narrow ? PIPELINE_SM : PIPELINE}</pre>
          </div>

          <div className="grid grid-4 rv">
            <div className="cell">
              <h3>
                <i>01</i>Retrofit sensor
              </h3>
              <p>
                ~$100, clips onto the bin you already own. Measures <b>fill level</b> and{' '}
                <b>contamination</b>. Minutes to install, zero capital replacement.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>02</i>RedCap 5G
              </h3>
              <p>
                Low-power cellular uplink built for exactly this class of device — citywide coverage
                with no gateways, no mesh, no trenching.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>03</i>Routing engine
              </h3>
              <p>
                Decides <b>which bins to collect and in what order</b>. Isolated in its own tested
                repo so the algorithm is independently verifiable.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>04</i>Operations dashboard
              </h3>
              <p>
                Live fleet map, fill analytics, overflow and contamination alerts, and a ROI panel
                priced against the customer's current fixed schedule.
              </p>
            </div>
          </div>

          <div className="ascii-box rv" style={{ marginTop: 34 }}>
            <pre className="ascii">{narrow ? BIN_SM : BIN}</pre>
          </div>
        </div>
      </section>

      {/* ── 03 numbers ── */}
      <section className="sec" id="numbers">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="03">the numbers</Label>
            <h2 className="sec-title">Same bins. Same crew. A third of the trips.</h2>
            <p className="sec-lede">
              Measured against the fixed-schedule baseline by our routing engine, which lives and is
              tested in its own repository — not buried in the UI.
            </p>
          </div>

          <div className="grid grid-3 rv" style={{ marginBottom: 34 }}>
            <div className="cell stat">
              <span className="n">87% → 0.5%</span>
              <span className="k">wasteful pickups</span>
            </div>
            <div className="cell stat">
              <span className="n">−70%</span>
              <span className="k">servicing events</span>
            </div>
            <div className="cell stat">
              <span className="n">~$100</span>
              <span className="k">per bin, retrofit</span>
            </div>
          </div>

          <div className="ascii-box rv">
            <pre className="ascii">{numbersChart(narrow)}</pre>
          </div>
        </div>
      </section>

      {/* ── 04 wedge ── */}
      <section className="sec" id="wedge">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="04">the wedge</Label>
            <h2 className="sec-title">The incumbents sell you new bins. We connect yours.</h2>
            <p className="sec-lede">
              Bigbelly, Enevo and the rest largely sell <b>new connected bins</b> — a capital-heavy
              rip-and-replace that a facilities director has to fight for in a budget cycle. Our
              wedge is the opposite, and it's why the sales cycle is short.
            </p>
          </div>

          <div className="rows rv">
            <div className="row row-head">
              <div>vector</div>
              <div>aerobin</div>
              <div>rip-and-replace incumbent</div>
            </div>
            <div className="row">
              <div>unit cost</div>
              <div className="ours">~$100 clip-on sensor</div>
              <div className="theirs">a whole new connected bin</div>
            </div>
            <div className="row">
              <div>install</div>
              <div className="ours">minutes, no tools of consequence</div>
              <div className="theirs">procurement, removal, placement</div>
            </div>
            <div className="row">
              <div>existing assets</div>
              <div className="ours">kept and upgraded</div>
              <div className="theirs">written off</div>
            </div>
            <div className="row">
              <div>coverage math</div>
              <div className="ours">whole campus in one PO</div>
              <div className="theirs">pilot a corner, expand over years</div>
            </div>
            <div className="row">
              <div>where value lives</div>
              <div className="ours">software + accumulating fill history</div>
              <div className="theirs">the steel</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 market + model ── */}
      <section className="sec" id="market">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="05">market &amp; model</Label>
            <h2 className="sec-title">Land on hardware. Earn on software.</h2>
            <p className="sec-lede">
              Smart-waste management is an established, growing category — independent estimates put
              it in the <b>low single-digit billions USD growing at a double-digit CAGR</b> through
              the late 2020s (Grand View Research / MarketsandMarkets), pushed by sustainability
              mandates and labor cost.
            </p>
          </div>

          <div className="grid grid-2 rv">
            <div className="cell">
              <h3>
                <i>»</i>Who pays
              </h3>
              <p>
                <b>Universities and corporate campuses first</b> — contained geography, one
                facilities decision-maker, an explicit sustainability mandate. Then municipalities
                and waste haulers.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>»</i>How we charge
              </h3>
              <p>
                Hardware at <b>low-to-zero margin</b> to land the site. Recurring{' '}
                <b>per-bin SaaS</b> for routing + dashboard. The software is the margin and the
                stickiness.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>»</i>Why it compounds
              </h3>
              <p>
                Retrofit removes the adoption barrier. The defensible asset is the routing engine
                plus <b>per-site fill history</b> — every week deployed makes the predictions
                sharper and the switch costlier.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>»</i>Where it goes
              </h3>
              <p>
                Campus → city → coalition. The dashboard already models citywide deployment and
                multi-institution smart-city views on real Rutgers and Columbia geography.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 traction ── */}
      <section className="sec" id="traction">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="06">traction</Label>
            <h2 className="sec-title">A validated problem with a built product.</h2>
            <p className="sec-lede">Not a deck.</p>
          </div>
          <ul className="list rv">
            <li>
              <b>1st place, national</b> — Verizon Smart Campus Competition.
            </li>
            <li>
              <b>NSF I-Corps</b> — 50+ customer-discovery interviews with facilities and operations
              staff, done directly by the founding team.
            </li>
            <li>
              <b>Institutional advisors</b> from Rutgers, NEC Labs, and the NYC/NJ EDA.
            </li>
            <li>
              <b>Shipped software</b> — a routing engine with measured results and a production
              operations dashboard you can open right now.
            </li>
          </ul>
        </div>
      </section>

      {/* ── 07 team ── */}
      <section className="sec" id="team">
        <div className="wrap">
          <div className="sec-head rv">
            <Label n="07">team</Label>
            <h2 className="sec-title">Who's building it.</h2>
          </div>
          <div className="grid grid-2 rv">
            <div className="cell">
              <h3>
                <i>»</i>Azra Bano — Founder
              </h3>
              <p>
                Product and technical direction. Sole author of the routing engine. Led the I-Corps
                discovery work and the Verizon Smart Campus win.
              </p>
            </div>
            <div className="cell">
              <h3>
                <i>»</i>Rish Dhingra — Front-end
              </h3>
              <p>Implementation of the operations dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── cta ── */}
      <section className="sec cta">
        <div className="wrap">
          <pre className="ascii rv">{FOOT_BIN}</pre>
          <h2 className="rv">The operating layer for waste collection.</h2>
          <p className="rv">
            We're raising to put sensors on the next ten thousand bins. If you invest in
            infrastructure, climate, or unglamorous operations software — let's talk.
          </p>
          <div className="hero-cta rv">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>
              [ contact the founder ]
            </a>
            <Link className="btn" to="/dashboard">
              [ see the product ]
            </Link>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="foot">
        <div className="wrap foot-in">
          <span>AEROBIN © {new Date().getFullYear()}</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href="https://github.com/azrabano23/aerobin" target="_blank" rel="noreferrer">
            github
          </a>
          <a href="https://github.com/azrabano23/aerobin-routing" target="_blank" rel="noreferrer">
            routing engine
          </a>
          <span className="spacer">Built in New Jersey.</span>
        </div>
      </footer>
    </div>
  )
}
