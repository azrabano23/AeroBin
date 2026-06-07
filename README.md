# AeroBin — Smart Waste Management Platform

**AeroBin is a smart-waste startup I founded and lead.** A $100 clip-on sensor turns any existing bin into a connected one — measuring fill level and contamination over Verizon RedCap 5G, and routing collection crews only to the bins that actually need it. We placed 1st in the national Verizon Smart Campus Competition, went through NSF I-Corps customer discovery (50+ interviews), and are backed by advisors from Rutgers, NEC Labs, and the NYC/NJ EDA.

This repository is the **operations dashboard** (a real-time map + analytics UI). The prediction/routing intelligence that decides *which bins to collect and in what order* lives in a separate, standalone engine: **[aerobin-routing](https://github.com/azrabano23/aerobin-routing)**.

> **Roles & attribution.** Founder, product, and technical direction: **Azra Bano**. Dashboard front-end implementation: **Rish Dhingra**. The `aerobin-routing` engine is authored solely by Azra Bano.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/azrabano23/AeroBin.git
cd aerobin
```

2. Install dependencies:
```bash
npm install
```

## Running the Program

Start the development server:
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Leaflet + react-leaflet
- Recharts
- Framer Motion
