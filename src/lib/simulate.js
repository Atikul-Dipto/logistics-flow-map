import { mulberry32 } from './rng'

// Weighted-random particle simulation over the shipment lane graph.
// Spawn probability per edge is proportional to its real shipment
// volume (busier lanes spawn more dots), so *where* motion happens on
// screen is driven by the actual data, not arbitrary randomness.
export class FlowSimulation {
  constructor(edges, seed = 20260814) {
    this.rng = mulberry32(seed)
    this.particles = []
    this.nextId = 1
    this.setEdges(edges)
  }

  setEdges(edges) {
    this.edges = edges
    this.totalWeight = edges.reduce((sum, e) => sum + e.volume, 0) || 1
    // cumulative weights for O(log n) weighted pick
    let acc = 0
    this.cumulative = edges.map((e) => (acc += e.volume))
  }

  pickEdge() {
    if (this.edges.length === 0) return null
    const target = this.rng() * this.totalWeight
    let lo = 0
    let hi = this.cumulative.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.cumulative[mid] < target) lo = mid + 1
      else hi = mid
    }
    return this.edges[lo]
  }

  spawn() {
    const edge = this.pickEdge()
    if (!edge) return
    // longer real transit time -> slightly longer animated travel,
    // clamped to a readable visual range
    const durationMs = 2600 + Math.min(edge.avgHours ?? 24, 60) * 40 + this.rng() * 800
    this.particles.push({
      id: this.nextId++,
      edge,
      born: performance.now(),
      duration: durationMs,
      lane: this.rng() * 2 - 1, // slight perpendicular offset so parallel particles don't overlap exactly
    })
  }

  // advance the simulation: spawn new particles at `rate` per second,
  // drop ones that have completed their journey
  tick(now, rate) {
    const spawnChance = rate * (1 / 60) // called ~once per frame
    if (this.rng() < spawnChance) this.spawn()
    this.particles = this.particles.filter((p) => now - p.born < p.duration)
    return this.particles
  }

  positions(now) {
    return this.particles.map((p) => {
      const t = Math.min(1, (now - p.born) / p.duration)
      return { ...p, t, ...bezierPoint(p.edge, t, p.lane) }
    })
  }
}

// quadratic bezier with a perpendicular bow, so lanes read as curved
// flight paths rather than dead-straight lines
function bezierPoint(edge, t, lane) {
  const { sx, sy, tx, ty } = edge
  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2
  const dx = tx - sx
  const dy = ty - sy
  const dist = Math.hypot(dx, dy) || 1
  const bow = Math.min(dist * 0.18, 60)
  const nx = -dy / dist
  const ny = dx / dist
  const cx = mx + nx * bow + nx * lane * 6
  const cy = my + ny * bow + ny * lane * 6

  const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * tx
  const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ty
  return { x, y }
}
