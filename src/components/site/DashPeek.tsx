import { useEffect, useState } from 'react'
import overview from '../../assets/dash/overview.png'
import analytics from '../../assets/dash/analytics.png'
import roi from '../../assets/dash/roi.png'
import bins from '../../assets/dash/bins.png'

/* The real dashboard, in a browser frame, tab by tab. These are captures of
   the app running, not mockups. */

const TABS: Array<{ k: string; src: string; note: string }> = [
  { k: 'Overview', src: overview, note: 'Fleet at a glance, with the bins about to overflow pushed to the top.' },
  { k: 'Analytics', src: analytics, note: 'Fill distribution and overflow incidents, per building and per stream.' },
  { k: 'ROI', src: roi, note: 'Trips skipped against the old fixed schedule, costed for procurement.' },
  { k: 'Bins', src: bins, note: 'Every sensor, its last reading, its battery and when it was last emptied.' },
]

export function DashPeek() {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => setI((n) => (n + 1) % TABS.length), 4200)
    return () => clearInterval(t)
  }, [auto])

  return (
    <div className="peek" onMouseEnter={() => setAuto(false)}>
      <div className="peek-chrome">
        <span className="dots"><i /><i /><i /></span>
        <span className="url">aerobin.com/dashboard</span>
        <div className="peek-tabs">
          {TABS.map((t, n) => (
            <button key={t.k} className={n === i ? 'on' : ''} onClick={() => { setI(n); setAuto(false) }}>
              {t.k}
            </button>
          ))}
        </div>
      </div>

      <div className="peek-shot">
        {TABS.map((t, n) => (
          <img key={t.k} src={t.src} alt={`AeroBin dashboard, ${t.k} tab`} className={n === i ? 'on' : ''} loading="lazy" />
        ))}
      </div>

      <div className="peek-note">
        <b>{TABS[i].k}.</b> {TABS[i].note}
      </div>
    </div>
  )
}
