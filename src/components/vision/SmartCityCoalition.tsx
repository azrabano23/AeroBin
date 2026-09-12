import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Network, ArrowRight, Building2 } from 'lucide-react'
import { useMemo } from 'react'

const coalitionSites = [
  { name: 'Rutgers University', lat: 40.522, lng: -74.459, level: 'University', status: 'active' },
  { name: 'Columbia University', lat: 40.8075, lng: -73.9626, level: 'University', status: 'active' },
  { name: 'New Brunswick', lat: 40.4862, lng: -74.4518, level: 'City', status: 'planned' },
  { name: 'Newark', lat: 40.7357, lng: -74.1724, level: 'City', status: 'planned' },
  { name: 'New York City', lat: 40.7128, lng: -74.006, level: 'Metro', status: 'planned' },
  { name: 'New Jersey', lat: 40.2989, lng: -74.5210, level: 'State', status: 'planned' },
] as const

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createCoalitionIcon(status: 'active' | 'planned', level: string) {
  const colors = {
    active: '#10b981', // emerald-500
    planned: level === 'Metro' ? '#ef4444' : '#f59e0b', // red for Metro, amber for others
  }

  return L.divIcon({
    className: 'coalition-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: ${colors[status]};
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export function SmartCityCoalition() {

  const mapCenter = useMemo(() => [40.65, -74.2] as [number, number], [])

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Network className="h-6 w-6 text-emerald-500" />
          Smart City Coalition Expansion
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Connecting universities → cities → states → national network
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[500px] rounded-lg border bg-card relative overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Coalition site markers */}
            {coalitionSites.map((site) => (
              <Marker
                key={site.name}
                position={[site.lat, site.lng]}
                icon={createCoalitionIcon(site.status, site.level)}
              />
            ))}
          </MapContainer>
          
          {/* Expansion Roadmap Overlay */}
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-md p-4 rounded-lg border border-border shadow-lg z-[1000] max-w-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">Expansion Roadmap</span>
              </div>
              <div className="space-y-2 text-xs">
                {coalitionSites.map((site, idx) => (
                  <div key={site.name} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        site.status === 'active'
                          ? 'bg-emerald-500'
                          : site.level === 'Metro'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                      }`}
                    />
                    <span className="flex-1">{site.name}</span>
                    <span className="text-muted-foreground">{site.level}</span>
                    {idx < coalitionSites.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Sites', value: '2', icon: Building2, color: 'emerald' },
            { label: 'Planned Sites', value: '4', icon: Network, color: 'amber' },
            { label: 'Total Bins', value: '190', icon: Building2, color: 'blue' },
            { label: 'Network Reach', value: 'NJ → NY', icon: Network, color: 'purple' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-muted/50 text-center"
            >
              <stat.icon className={`h-6 w-6 mx-auto mb-2 text-${stat.color}-500`} />
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 p-6 rounded-lg border border-emerald-500/20">
          <h3 className="font-semibold mb-2">Expansion Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Phase 1 (2025): University Pilots - Columbia & Rutgers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Phase 2 (2026): City Expansion - New Brunswick & Newark</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Phase 3 (2027): Metro Expansion - NYC Metro Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Phase 4 (2028+): State & National Network</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

