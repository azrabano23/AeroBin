import { useState } from 'react'

/* The hook. Three bins that look identical from the outside. You pick the
   one you think needs collecting, and the reveal is that you cannot tell,
   which is the entire thesis of the company in one interaction. */

type Bin = { id: string; site: string; fill: number; liner: string }

const BINS: Bin[] = [
  { id: 'A', site: 'Lerner Hall, north door', fill: 31, liner: '#E9E9E2' },
  { id: 'B', site: 'Butler Library, level 3', fill: 94, liner: '#E9E9E2' },
  { id: 'C', site: 'Dodge Fitness, lobby', fill: 47, liner: '#E9E9E2' },
]

const FULL = 80
const GOOD = '#0E7A4A'
const CRIT = '#C0392B'

function BinArt({ fill, reveal, liner }: { fill: number; reveal: boolean; liner: string }) {
  /* the sack only shows once the sensor has told you it is there */
  const h = reveal ? 52 * (fill / 100) : 0
  const hot = fill >= FULL
  return (
    <svg viewBox="0 0 110 132" className="guess-art" aria-hidden>
      <rect x="26" y="34" width="58" height="76" rx="5" fill={liner} />
      {reveal && (
        <rect
          x="29" y={107 - h} width="52" height={h} rx="3"
          fill={hot ? CRIT : GOOD} opacity=".85"
          style={{ transition: 'height .6s cubic-bezier(.22,1,.36,1), y .6s cubic-bezier(.22,1,.36,1)' }}
        />
      )}
      <path d="M26 34h58l-4 74a6 6 0 0 1-6 5.6H36a6 6 0 0 1-6-5.6L26 34Z"
        fill="none" stroke="#14170F" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="20" y="26" width="70" height="9" rx="4.5" fill="#fff" stroke="#14170F" strokeWidth="2.4" />
      <rect x="44" y="17" width="22" height="9" rx="3" fill="#fff" stroke="#14170F" strokeWidth="2.2" />
      <g opacity={reveal ? 1 : 0} style={{ transition: 'opacity .35s .15s' }}>
        <rect x="78" y="38" width="20" height="14" rx="4" fill={GOOD} />
        <path d="M83.5 35.5a6 6 0 0 1 9 0" stroke={GOOD} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

export function Guess() {
  const [picked, setPicked] = useState<string | null>(null)
  const reveal = picked !== null
  const answer = BINS.reduce((a, b) => (a.fill > b.fill ? a : b))
  const right = picked === answer.id

  return (
    <div className="guess">
      <div className="guess-q">
        <span className="eyebrow">A quick one</span>
        <h3>Which of these needs a truck today?</h3>
        <p>Same building, same morning, same three bins a crew would drive past.</p>
      </div>

      <div className="guess-row">
        {BINS.map((b) => {
          const hot = b.fill >= FULL
          return (
            <button
              key={b.id}
              className={`guess-c${picked === b.id ? ' picked' : ''}${reveal && hot ? ' hot' : ''}`}
              onClick={() => setPicked(b.id)}
              disabled={reveal}
              aria-label={`Bin ${b.id}, ${b.site}`}
            >
              <BinArt fill={b.fill} reveal={reveal} liner={b.liner} />
              <div className="guess-lbl">
                <b>Bin {b.id}</b>
                <span>{b.site}</span>
              </div>
              <div className={`guess-val${reveal ? ' on' : ''}`}>
                {reveal ? (
                  <>
                    <span style={{ color: hot ? CRIT : GOOD }}>{b.fill}%</span>
                    <i>{hot ? 'collect' : 'skip'}</i>
                  </>
                ) : (
                  <span className="q">?</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className={`guess-a${reveal ? ' on' : ''}`} aria-live="polite">
        {reveal ? (
          <p>
            {right ? <b>Right, but you had a one in three chance.</b> : <b>It was Bin {answer.id}.</b>}{' '}
            Nothing on the outside of a bin tells you what is inside it. A crew on a fixed route
            drives past all three and empties all three, because guessing is the only option they
            have. <b>That is the entire problem.</b>
          </p>
        ) : (
          <p>Pick one.</p>
        )}
        {reveal && (
          <button className="guess-reset" onClick={() => setPicked(null)}>
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
