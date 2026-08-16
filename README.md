# AeroBin — smart-waste operations dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

**AeroBin is a smart-waste startup I founded and lead.** A ~$100 clip-on sensor turns any existing bin into a connected one — measuring fill level and contamination over Verizon RedCap 5G — so collection crews are routed only to the bins that actually need it. We placed **1st in the national Verizon Smart Campus Competition**, went through **NSF I-Corps customer discovery (50+ interviews)**, and are advised by people from Rutgers, NEC Labs, and the NYC/NJ EDA.

This repository is the **operations dashboard** — the real-time map + analytics UI a facilities team actually looks at. The intelligence that decides *which bins to collect and in what order* is a separate, tested engine: **[aerobin-routing](https://github.com/azrabano23/aerobin-routing)** (87% → 0.5% wasteful pickups, −70% servicing events).

> **Roles & attribution.** Founder, product, and technical direction: **Azra Bano**. Dashboard front-end implementation: **Rish Dhingra**. The `aerobin-routing` engine is authored solely by Azra Bano.

---

## The problem

Waste collection runs on **fixed schedules** — trucks visit every bin every N days regardless of how full it is. That's expensive and dirty: collection (not disposal) is the **single largest line item in municipal solid-waste budgets**, and globally solid-waste spending runs into the hundreds of billions per year ([World Bank, *What a Waste 2.0*, 2018](https://datatopics.worldbank.org/what-a-waste/)). A large fraction of pickups happen at bins that are barely full, burning labor, fuel, and CO₂ for no reason — while the genuinely full bins overflow between visits. The root cause is simple: **the system is blind.** It can't see fill level, so it can't make a better decision than "visit everything on a timer."

## The market

Smart-waste management is an established and growing category — independent estimates put it in the low **single-digit billions of USD and growing at a double-digit CAGR** through the late 2020s (Grand View Research / MarketsandMarkets), driven by municipal sustainability mandates and labor costs. The incumbents (e.g. Bigbelly, Enevo) largely sell *new* connected bins — a capital-heavy rip-and-replace. AeroBin's wedge is the opposite: a **clip-on retrofit** that connects the bins a city already owns, plus the software that turns the sensor stream into routed work. The customer pain is real and we validated it directly — **50+ NSF I-Corps discovery interviews** with facilities and operations staff.

## The solution & what this dashboard does

The dashboard is where the sensor fleet becomes operational:

- **Live fleet map** — every bin on an interactive Leaflet map with marker clustering, color-coded by fill level, click-through to per-bin detail.
- **Analytics** — fill-trend and servicing charts (Recharts), so a manager can see patterns, not just current state.
- **ROI & cost comparison** — a panel that turns the routing engine's "−70% servicing events" into dollars against the customer's current fixed-schedule cost.
- **Alerts** — surfacing bins predicted to overflow or flagged for contamination.
- **Deployment vision** — citywide / smart-city coalition views for the expansion story, on real Rutgers and Columbia campus geography.

## Technical breakdown

A modern, typed React front end built to feel like an operations tool, not a demo:

- **React 19 + Vite + TypeScript** — fast, type-safe SPA; **Zustand** for app state; **Tailwind + shadcn/ui** for a consistent component system.
- **Geospatial UI** — **Leaflet / react-leaflet** with marker clustering to keep hundreds of bins legible at city zoom levels; custom markers and popovers for per-bin state.
- **Data visualization** — **Recharts** for fill-trend, cost, and servicing analytics; **Framer Motion** for the transitions that make a dashboard feel responsive.
- **Separation of concerns** — this repo is *presentation*; the prediction/routing logic is deliberately isolated in [`aerobin-routing`](https://github.com/azrabano23/aerobin-routing) so the algorithm is independently testable and the UI stays a thin, swappable layer over it.

**Skills demonstrated:** production React/TypeScript architecture, geospatial visualization at scale, dashboard/IA design for a real operational user, and the system-design judgment to split a product into a tested decision engine + a presentation layer rather than one tangled app.

## Business model & go-to-market

- **Who pays:** universities and corporate campuses first (contained geography, one facilities decision-maker, a clear sustainability mandate), then municipalities and waste haulers.
- **Model:** hardware at low/zero margin (the ~$100 retrofit sensor) to land, recurring **per-bin SaaS** for the routing + dashboard — the software is the margin and the lock-in.
- **Wedge & moat:** retrofit (no rip-and-replace) lowers the adoption barrier; the defensible asset is the routing engine plus the accumulating fill-history per site, which makes the predictions better over time.
- **Traction:** 1st place national (Verizon Smart Campus), 50+ I-Corps customer-discovery interviews, institutional advisors. This is a validated problem with a built product, not a deck.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

## License

MIT — see [LICENSE](LICENSE). Dashboard front-end by Rish Dhingra; product & direction by **Azra Bano**.
