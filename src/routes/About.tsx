import { Link } from 'react-router-dom'
import '../styles/about.css'

/* A manifesto page, not a product page. No eyebrows, no captions, no stat
   tiles, no checkmark lists. The argument carries itself or it does not.
   Everything here is prose we can stand behind without a footnote, which is
   why there are no numbers on this page at all. */

const SUPPORT = ['Rutgers University', 'Verizon', 'Qualcomm']
const WON = [
  ['Verizon Smart Campus Competition', '1st place, national'],
  ['Rutgers Shark Tank', 'Winner, university wide'],
]

export function About() {
  return (
    <div className="about">
      <nav className="ab-nav">
        <Link to="/" className="ab-mark">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5.5 8h13l-1.1 12.3a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5L5.5 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M10 7V5.6A1.2 1.2 0 0 1 11.2 4.4h1.6A1.2 1.2 0 0 1 14 5.6V7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="9.6" y="12" width="4.8" height="7" rx="1" fill="currentColor" />
          </svg>
          <span>AeroBin</span>
        </Link>
        <Link to="/" className="ab-back">Back to the product</Link>
      </nav>

      <main className="ab-wrap">
        <h1 className="ab-lead">Cities are blind.</h1>

        <div className="ab-body">
          <p>
            For as long as there has been garbage collection, a city has run it on a calendar. A
            truck leaves at the same hour, drives the same loop, and lifts the same containers
            whether they are full or empty. Nobody is being careless. Nothing on the outside of a
            bin tells you what is inside it, so there has never been anything else to run it on.
          </p>
          <p>
            Everything a city does well, it measures first. Traffic has loop detectors. Water has
            flow meters. Power has smart meters. Waste has a schedule and a complaint line, and the
            most expensive thing in the system, the truck, is routed on a guess.
          </p>
          <p>
            That ends with instrumentation, not with better trucks. A sensor small enough and cheap
            enough to go on every container a city already owns, reading how full it is and
            reporting continuously. No new bins, no new fleet, no trench, no procurement cycle for
            hardware a facilities team never asked to replace.
          </p>
          <p>
            Once a city can see its containers, the rest stops being hard. Routes build themselves
            out of fill instead of out of habit. Overflow gets predicted instead of reported.
            Contamination gets caught at the bin instead of at the sorting facility, where it costs
            the most to find. A truck stops driving to a bin that had nothing in it.
          </p>
          <p>
            We started on college campuses because that is the cleanest place to prove it:
            contained geography, one decision maker, a real sustainability mandate, and enough
            containers that the routing actually matters. What works on a campus is the same system
            a city runs.
          </p>
        </div>

        <p className="ab-end">
          Cities are blind.
          <br />
          We give them <span className="g">vision.</span>
        </p>

        <p className="ab-sig">We make trash talk.</p>
      </main>

      <footer className="ab-foot">
        <div className="ab-foot-g">
          <div className="ab-col">
            <h2>Supported by</h2>
            <ul>
              {SUPPORT.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="ab-col">
            <h2>Won</h2>
            <ul>
              {WON.map(([h, p]) => (
                <li key={h}>
                  {h}
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ab-foot-b">
          <span>AeroBin, est. 2025</span>
          <Link to="/">aerobin.io</Link>
        </div>
      </footer>
    </div>
  )
}
