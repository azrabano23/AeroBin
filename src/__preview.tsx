import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Site } from './routes/Site'
const Dashboard = lazy(() => import('./routes/Dashboard').then((m) => ({ default: m.Dashboard })))
createRoot(document.getElementById('root')!).render(
  <StrictMode><HashRouter><Suspense fallback={<div style={{padding:40}}>loading…</div>}>
    <Routes><Route path="/" element={<Site />} /><Route path="/dashboard" element={<Dashboard />} /></Routes>
  </Suspense></HashRouter></StrictMode>,
)
