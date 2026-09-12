import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Site } from './routes/Site'

/* The dashboard pulls in Leaflet + Recharts. Keep it out of the marketing
   bundle so the public site is a fast first paint. */
const Landing = lazy(() => import('./routes/Landing').then((m) => ({ default: m.Landing })))
const Dashboard = lazy(() => import('./routes/Dashboard').then((m) => ({ default: m.Dashboard })))

function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#08090a',
        color: '#4ade80',
        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 13,
        letterSpacing: '0.16em',
      }}
    >
      loading aerobin…
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* public marketing site */}
          <Route path="/" element={<Site />} />
          {/* previous product landing page, kept reachable */}
          <Route path="/overview" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
