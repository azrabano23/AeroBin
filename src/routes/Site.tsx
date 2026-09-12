import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/site.css'

const CONTACT_EMAIL = 'azrabano.work@gmail.com'
const REPO = 'https://github.com/azrabano23/AeroBin'
const ENGINE = 'https://github.com/azrabano23/aerobin-routing'

/* ── ascii ─────────────────────────────────────────────────────────────── */

const WORDMARK = [
  ' █████  ███████ ██████   ██████  ██████  ██ ███    ██',
  '██   ██ ██      ██   ██ ██    ██ ██   ██ ██ ████   ██',
  '███████ █████   ██████  ██    ██ ██████  ██ ██ ██  ██',
  '██   ██ ██      ██   ██ ██    ██ ██   ██ ██ ██  ██ ██',
  '██   ██ ███████ ██   ██  ██████  ██████  ██ ██   ████',
].join('\n')

const SCHEDULE = `           MON   TUE   WED   THU   FRI   SAT   SUN
  truck    [x]   [x]   [x]   [x]   [x]   [x]   [x]    7 stops
  full      .     .     .     .    [!]    .     .     1 full
           ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
           six trips to bins nobody needed emptied`

const SCHEDULE_SM = `        M   T   W   T   F   S   S
 truck [x] [x] [x] [x] [x] [x] [x]
 full   .   .   .   .  [!]  .   .
       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 7 stops, 1 bin actually full`

const PIPELINE = `  ╔═══════════╗   ╔═══════════╗   ╔═══════════╗   ╔═══════════╗
  ║  SENSOR   ║──>║ REDCAP 5G ║──>║  ROUTING  ║──>║ DASHBOARD ║
  ║  ~$100    ║   ║  uplink   ║   ║  ENGINE   ║   ║  + crew   ║
  ╚═══════════╝   ╚═══════════╝   ╚═══════════╝   ╚═══════════╝
   clips onto      tells you       picks the       shows the
   your bin        it's full       stops           whole fleet`

const PIPELINE_SM = ` ╔═══════════╗
 ║  SENSOR   ║  clips on, ~$100
 ╚═════╤═════╝
 ╔═════▼═════╗
 ║ REDCAP 5G ║  says it's full
 ╚═════╤═════╝
 ╔═════▼═════╗
 ║  ROUTING  ║  picks the stops
 ╚═════╤═════╝
 ╔═════▼═════╗
 ║ DASHBOARD ║  crew sees it
 ╚═══════════╝`

const STREET = `   EVERY BIN, EVERY TIME              ONLY THE FULL ONES
   ┌──┬──┬──┬──┬──┬──┐               ┌──┬──┬──┬──┬──┬──┐
   │▓▓│░░│░░│▓▓│░░│░░│               │▓▓│░░│░░│▓▓│░░│░░│
   └┬─┴┬─┴┬─┴┬─┴┬─┴┬─┘               └┬─┴──┴──┴┬─┴──┴──┘
    ●  ●  ●  ●  ●  ●                  ●        ●
    six stops                         two stops

   ▓▓ full        ░░ not full        ● truck stops here`

const STREET_SM = ` EVERY BIN, EVERY TIME
 ┌──┬──┬──┬──┬──┬──┐
 │▓▓│░░│░░│▓▓│░░│░░│
 └┬─┴┬─┴┬─┴┬─┴┬─┴┬─┘
  ●  ●  ●  ●  ●  ●
  six stops

 ONLY THE FULL ONES
 ┌──┬──┬──┬──┬──┬──┐
 │▓▓│░░│░░│▓▓│░░│░░│
 └┬─┴──┴──┴┬─┴──┴──┘
  ●        ●
  two stops

 ▓▓ full   ░░ not full`

const BIN = `        .-.
     ((  ●  ))   ~ ~ ~   redcap 5g
        '-'
    ┌───────────┐
    │  AEROBIN  │    fill ........... 88%
    ├───────────┤    contamination ... clear
    │███████████│    verdict ......... COLLECT
    │███████████│
    │███████████│
    │░░░░░░░░░░░│
    └───────────┘`

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
  contamination . clear
  verdict ....... COLLECT`

const TALK = [
  '████████ ██████   █████  ███████ ██   ██ ',
  '   ██    ██   ██ ██   ██ ██      ██   ██ ',
  '   ██    ██████  ███████ ███████ ███████ ',
  '   ██    ██   ██ ██   ██      ██ ██   ██ ',
  '   ██    ██   ██ ██   ██ ███████ ██   ██ ',
  '████████  █████  ██      ██   ██ ',
  '   ██    ██   ██ ██      ██  ██  ',
  '   ██    ███████ ██      █████   ',
  '   ██    ██   ██ ██      ██  ██  ',
  '   ██    ██   ██ ███████ ██   ██ ',
].join('\n')

function bar(pct: number, width = 44, fill = '█', empty = '·') {
  const n = Math.max(pct > 0 ? 1 : 0, Math.round((pct / 100) * width))
  return fill.repeat(n) + empty.repeat(Math.max(0, width - n))
}

/* [ wide label, narrow label, percent, readout ] */
const SERIES: Array<[string, string, number, string]> = [
  ['wasteful pickups, fixed schedule', 'wasteful, fixed schedule', 87, '87%'],
  ['wasteful pickups, aerobin', 'wasteful, aerobin', 0.5, '0.5%'],
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
  { id: 'BIN-0231', site: 'rec-center', fill: 74 },
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
    const rule = narrow ? 34 : 56
    const body = rows
      .map((r) => {
        const f = Math.round(r.fill)
        const verdict = f >= 80 ? 'COLLECT' : f >= 65 ? 'watch  ' : 'skip   '
        const id = narrow ? '' : `${r.id}  `
        return `  ${id}${r.site.padEnd(nameW)}[${bar(f, barW, '█', '░')}] ${String(f).padStart(3)}%  ${verdict}`
      })
      .join('\n')
    const collect = rows.filter((r) => r.fill >= 80).length
    return [
      '  $ aerobin tail --demo',
      '  ' + '─'.repeat(rule),
      body,
      '  ' + '─'.repeat(rule),
      `  route: ${collect} stop${collect === 1 ? '' : 's'} · ${rows.length - collect} skipped`,
    ].join('\n')
  }, [rows, narrow])

  return (
    <div className="ascii-box hero-term">
      <pre className="ascii">{text}</pre>
      <div className="caption">SIMULATED — SAMPLE DATA, NOT A LIVE DEPLOYMENT</div>
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
  const narrow = useNarrow()

  return (
    <div className="site">
      <nav className="nav">
        <div className="wrap nav-in">
          <div className="nav-mark">
            AEROBIN<span>.</span>
          </div>
          <div className="nav-links">
            <a href="#problem">problem</a>
            <a href="#how">how</a>
            <a href="#numbers">numbers</a>
            <a href="#model">model</a>
          </div>
          <Link to="/dashboard" className="btn btn-sm btn-primary">
            dashboard →
          </Link>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="wrap hero">
        <div className="hero-kicker">
          <i>●</i> smart-waste infrastructure
        </div>

        <pre className="wordmark">{WORDMARK}</pre>

        <h1>
          We make trash talk.<span className="cursor" />
        </h1>

        <p>
          A <b>~$100 clip-on sensor</b> tells you which bins are actually full, over{' '}
          <b>Verizon RedCap 5G</b>. Crews skip the rest.
        </p>

        <div className="hero-cta">
          <Link to="/dashboard" className="btn btn-primary">
            [ see the dashboard ]
          </Link>
          <a className="btn" href="#numbers">
            [ the numbers ]
          </a>
        </div>

        <Telemetry />
      </header>

      {/* ── proof ── */}
      <section className="proof">
        <div>
          <dt>Competition</dt>
          <dd>
            <b>1st, national</b> — Verizon Smart Campus
          </dd>
        </div>
        <div>
          <dt>Discovery</dt>
          <dd>
            <b>NSF I-Corps</b> — 50+ interviews
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
          <div className="sec-head">
            <Label n="01">the problem</Label>
            <h2 className="sec-title">Trucks run on a timer.</h2>
            <p className="sec-lede">
              Collection — not disposal — is the largest line item in municipal waste budgets (
              <a href="https://datatopics.worldbank.org/what-a-waste/" target="_blank" rel="noreferrer">
                World Bank, What a Waste 2.0
              </a>
              ). Most of those stops are at bins that aren't full. The system can't see fill level,
              so it can't do better than visiting everything.
            </p>
          </div>

          <div className="ascii-box">
            <pre className="ascii ascii-fg">{narrow ? SCHEDULE_SM : SCHEDULE}</pre>
          </div>
        </div>
      </section>

      {/* ── 02 how ── */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="sec-head">
            <Label n="02">how it works</Label>
            <h2 className="sec-title">Clip it on. It talks.</h2>
          </div>

          <div className="ascii-box">
            <pre className="ascii">{narrow ? PIPELINE_SM : PIPELINE}</pre>
          </div>

          <ul className="list steps">
            <li>
              <b>Sensor</b> — ~$100, clips onto a bin you already own. Reads fill and contamination.
            </li>
            <li>
              <b>RedCap 5G</b> — cellular uplink, so no new bins and no new network.
            </li>
            <li>
              <b>Routing engine</b> — decides which bins to collect and in what order. Lives in{' '}
              <a href={ENGINE} target="_blank" rel="noreferrer">
                its own tested repo
              </a>
              .
            </li>
            <li>
              <b>Dashboard</b> — live map, alerts, and cost against your current schedule.
            </li>
          </ul>

          <div className="ascii-box">
            <pre className="ascii">{narrow ? BIN_SM : BIN}</pre>
          </div>
        </div>
      </section>

      {/* ── 03 numbers ── */}
      <section className="sec" id="numbers">
        <div className="wrap">
          <div className="sec-head">
            <Label n="03">the numbers</Label>
            <h2 className="sec-title">Same bins. A third of the trips.</h2>
            <p className="sec-lede">
              <b>Benchmark, not a field result.</b> Measured against a fixed-schedule baseline in{' '}
              <a href={ENGINE} target="_blank" rel="noreferrer">
                aerobin-routing
              </a>
              .
            </p>
          </div>

          <div className="ascii-box">
            <pre className="ascii">{narrow ? STREET_SM : STREET}</pre>
          </div>

          <div className="grid grid-3">
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

          <div className="ascii-box">
            <pre className="ascii">{numbersChart(narrow)}</pre>
          </div>
        </div>
      </section>

      {/* ── 04 wedge ── */}
      <section className="sec" id="wedge">
        <div className="wrap">
          <div className="sec-head">
            <Label n="04">the wedge</Label>
            <h2 className="sec-title">They sell new bins. We connect yours.</h2>
            <p className="sec-lede">
              Bigbelly, Enevo and the rest largely sell new connected bins. We retrofit the ones a
              campus already owns.
            </p>
          </div>

          <div className="rows">
            <div className="row row-head">
              <div>vector</div>
              <div>aerobin</div>
              <div>incumbent</div>
            </div>
            <div className="row">
              <div>what you buy</div>
              <div className="ours">a ~$100 clip-on sensor</div>
              <div className="theirs">a whole new connected bin</div>
            </div>
            <div className="row">
              <div>your existing bins</div>
              <div className="ours">kept</div>
              <div className="theirs">replaced</div>
            </div>
            <div className="row">
              <div>where the value sits</div>
              <div className="ours">software + fill history</div>
              <div className="theirs">the steel</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 model ── */}
      <section className="sec" id="model">
        <div className="wrap">
          <div className="sec-head">
            <Label n="05">market &amp; model</Label>
            <h2 className="sec-title">Hardware to land. Software to earn.</h2>
          </div>
          <ul className="list">
            <li>
              <b>Campuses first</b> — contained geography, one facilities decision-maker. Then cities
              and haulers.
            </li>
            <li>
              <b>Hardware near cost, recurring per-bin SaaS</b> for the routing and the dashboard.
            </li>
            <li>
              <b>The moat is the engine plus per-site fill history</b> — the predictions sharpen the
              longer a site runs.
            </li>
            <li>
              Smart-waste is a <b>low-single-digit-billions</b> market growing at a double-digit CAGR
              (Grand View Research / MarketsandMarkets).
            </li>
          </ul>
        </div>
      </section>

      {/* ── 06 team ── */}
      <section className="sec" id="team">
        <div className="wrap">
          <div className="sec-head">
            <Label n="06">team</Label>
            <h2 className="sec-title">Who's building it.</h2>
          </div>
          <ul className="list">
            <li>
              <b>Azra Bano</b> — founder. Product, technical direction, and the routing engine.
            </li>
            <li>
              <b>Rish Dhingra</b> — dashboard front-end.
            </li>
          </ul>
        </div>
      </section>

      {/* ── cta ── */}
      <section className="sec cta">
        <div className="wrap">
          <div className="talk-kicker">we make</div>
          <pre className="wordmark talk">{TALK}</pre>
          <div className="hero-cta">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>
              [ {CONTACT_EMAIL} ]
            </a>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <span>AEROBIN © {new Date().getFullYear()}</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>email</a>
          <a href={REPO} target="_blank" rel="noreferrer">
            github
          </a>
          <a href={ENGINE} target="_blank" rel="noreferrer">
            routing engine
          </a>
        </div>
      </footer>
    </div>
  )
}
