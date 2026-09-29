/* ── Real places, real coordinates ───────────────────────────────────────
   Morningside Heights base map is derived, not eyeballed: the Manhattan
   grid is regular, so two surveyed anchors fix the whole network —
     Broadway & W 110th   40.8029, -73.9678
     Broadway & W 116th   40.8076, -73.9640
     Amsterdam & W 116th  40.8064, -73.9620
   giving a per-cross-street step and a per-avenue step. Every other
   intersection is those two vectors from the origin, so block shapes and
   the ~29° grid rotation come out correct.

   Berkeley's central campus sits inside an orthogonal street grid, so its
   bounding streets (Hearst / Bancroft / Oxford / Gayley) are straight runs
   at their real latitudes and longitudes.

   Bin coordinates: Columbia's are the live fleet from columbia.json.
   Berkeley's are proposed siting at named campus landmarks — real places,
   not yet an installed fleet, and labelled that way on the page.
   ───────────────────────────────────────────────────────────────────── */

export type Pt = [number, number] // [lat, lng]
export type Street = { name: string; pts: Pt[]; major?: boolean; water?: boolean }
export type SiteBin = { id: string; location: string; lat: number; lng: number; fill: number }

/* ── Morningside Heights ─────────────────────────────────────────────── */
const O: Pt = [40.8029, -73.9678]
const U: Pt = [0.00078, 0.00063]
const V: Pt = [-0.0012, 0.002]
const at = (ave: number, st: number): Pt => [
  O[0] + U[0] * st + V[0] * ave,
  O[1] + U[1] * st + V[1] * ave,
]

const MORNINGSIDE: Street[] = [
  ...([['Riverside Dr', -1.15], ['Claremont Ave', -0.62], ['Broadway', 0], ['Amsterdam Ave', 1.0], ['Morningside Dr', 1.95]] as Array<[string, number]>).map(
    ([name, a]) => ({ name, pts: [at(a, 0), at(a, 15)] as Pt[], major: name === 'Broadway' || name === 'Amsterdam Ave' }),
  ),
  ...[110, 112, 114, 116, 118, 120, 122, 125].map((n) => ({
    name: `W ${n}${n === 110 ? 'th' : n === 112 ? 'th' : n === 122 ? 'nd' : 'th'} St`,
    pts: [at(-1.15, n - 110), at(1.95, n - 110)] as Pt[],
    major: n === 116 || n === 125 || n === 110,
  })),
]

export const COLUMBIA_BLOCK: Pt[] = [at(0, 4), at(1, 4), at(1, 10), at(0, 10)]

/* ── Berkeley ────────────────────────────────────────────────────────── */
const BERKELEY: Street[] = [
  { name: 'Hearst Ave', pts: [[37.8748, -122.2695], [37.8753, -122.2525]], major: true },
  { name: 'Bancroft Way', pts: [[37.8682, -122.2695], [37.8687, -122.2515]], major: true },
  { name: 'University Ave', pts: [[37.8719, -122.2805], [37.8718, -122.2668]], major: true },
  { name: 'Oxford St', pts: [[37.8668, -122.2663], [37.8752, -122.2670]], major: true },
  { name: 'Shattuck Ave', pts: [[37.8598, -122.2678], [37.8762, -122.2690]], major: true },
  { name: 'Telegraph Ave', pts: [[37.8596, -122.2584], [37.8682, -122.2589]], major: true },
  { name: 'Gayley Rd', pts: [[37.8689, -122.2531], [37.8751, -122.2541]] },
  { name: 'Piedmont Ave', pts: [[37.8636, -122.2521], [37.869, -122.2531]] },
  { name: 'Center St', pts: [[37.8702, -122.2702], [37.87, -122.2666]] },
  { name: 'Durant Ave', pts: [[37.8674, -122.2698], [37.8678, -122.2536]] },
  { name: 'Dwight Way', pts: [[37.865, -122.2698], [37.8654, -122.2536]] },
  { name: 'Euclid Ave', pts: [[37.8752, -122.2603], [37.8806, -122.2601]] },
  { name: 'Strawberry Creek', pts: [[37.8706, -122.2666], [37.8713, -122.2622], [37.8709, -122.2572], [37.8701, -122.2532]], water: true },
]

export const BERKELEY_BLOCK: Pt[] = [
  [37.8687, -122.2664], [37.8688, -122.2538], [37.8751, -122.2539], [37.875, -122.2666],
]

/* Proposed siting at real Berkeley landmarks */
const BERKELEY_BINS: SiteBin[] = [
  { id: 'UCB-01', location: 'Sproul Plaza', lat: 37.8695, lng: -122.2595, fill: 88 },
  { id: 'UCB-02', location: 'Doe Library', lat: 37.8722, lng: -122.2593, fill: 41 },
  { id: 'UCB-03', location: 'Memorial Glade', lat: 37.8733, lng: -122.259, fill: 64 },
  { id: 'UCB-04', location: 'Sather Tower', lat: 37.8721, lng: -122.2578, fill: 27 },
  { id: 'UCB-05', location: 'Wheeler Hall', lat: 37.8711, lng: -122.259, fill: 83 },
  { id: 'UCB-06', location: 'Moffitt Library', lat: 37.8729, lng: -122.2604, fill: 55 },
  { id: 'UCB-07', location: 'Valley Life Sciences', lat: 37.8714, lng: -122.2622, fill: 19 },
  { id: 'UCB-08', location: 'Haas School of Business', lat: 37.8718, lng: -122.2536, fill: 91 },
  { id: 'UCB-09', location: 'Soda Hall', lat: 37.8756, lng: -122.2588, fill: 34 },
  { id: 'UCB-10', location: 'Cory Hall', lat: 37.8752, lng: -122.2578, fill: 72 },
  { id: 'UCB-11', location: 'Recreational Sports Facility', lat: 37.8686, lng: -122.2625, fill: 86 },
  { id: 'UCB-12', location: 'Evans Hall', lat: 37.8738, lng: -122.2578, fill: 48 },
  { id: 'UCB-13', location: 'Hearst Mining Building', lat: 37.8746, lng: -122.257, fill: 22 },
  { id: 'UCB-14', location: 'Berkeley Art Museum', lat: 37.8686, lng: -122.258, fill: 69 },
  { id: 'UCB-15', location: 'Zellerbach Hall', lat: 37.8695, lng: -122.2614, fill: 93 },
  { id: 'UCB-16', location: 'Eshleman Hall', lat: 37.8692, lng: -122.2601, fill: 37 },
  { id: 'UCB-17', location: 'Hearst Gym', lat: 37.8684, lng: -122.2598, fill: 58 },
  { id: 'UCB-18', location: 'Li Ka Shing Center', lat: 37.8737, lng: -122.2652, fill: 45 },
  { id: 'UCB-19', location: 'Stanley Hall', lat: 37.8734, lng: -122.2566, fill: 77 },
  { id: 'UCB-20', location: 'Minor Hall', lat: 37.8703, lng: -122.2559, fill: 31 },
]

export type Campus = {
  key: string
  name: string
  short: string
  place: string
  streets: Street[]
  block: Pt[]
  bins?: SiteBin[]
  source: 'fleet' | 'proposed'
  baseMap: string
}

export const CAMPUSES: Campus[] = [
  {
    key: 'columbia',
    name: 'Columbia University',
    short: 'Columbia',
    place: 'Morningside Heights, New York, NY',
    streets: MORNINGSIDE,
    block: COLUMBIA_BLOCK,
    source: 'fleet',
    baseMap: 'grid derived from surveyed anchors',
  },
  {
    key: 'berkeley',
    name: 'UC Berkeley',
    short: 'Berkeley',
    place: 'Central Campus, Berkeley, CA',
    streets: BERKELEY,
    block: BERKELEY_BLOCK,
    bins: BERKELEY_BINS,
    source: 'proposed',
    baseMap: 'streets at surveyed latitudes and longitudes',
  },
]
