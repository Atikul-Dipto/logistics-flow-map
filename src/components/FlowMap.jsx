import { useEffect, useMemo, useRef, useState } from 'react'
import { createProjection, project, geometryToPath } from '../lib/projection'
import { FlowSimulation } from '../lib/simulate'
import { dbscan } from '../lib/cluster'

const CLUSTER_INTERVAL_MS = 3000
const CLUSTER_EPSILON_PX = 34
const CLUSTER_MIN_PTS = 5

function readCssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export default function FlowMap({ geojson, nodes, edges, onHover }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const simRef = useRef(null)
  const rafRef = useRef(null)
  const themeRef = useRef({ particle: '#5b8def', land: '#1b1e26', border: 'rgba(255,255,255,0.14)' })
  const [size, setSize] = useState({ width: 900, height: 620 })
  const [clusters, setClusters] = useState([])
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const box = entries[0].contentRect
      setSize({ width: Math.max(320, box.width), height: Math.max(360, box.height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { divisionPaths, projectedNodes, projectedEdges } = useMemo(() => {
    if (!geojson || size.width === 0) return { divisionPaths: [], projectedNodes: [], projectedEdges: [] }
    const { projection } = createProjection(geojson, size.width, size.height)
    const divisionPaths = geojson.features.map((f) => ({
      id: f.properties.division,
      d: geometryToPath(f.geometry, projection),
    }))
    const byId = new Map()
    const projectedNodes = nodes.map((n) => {
      const p = project(projection, n.lat, n.lon)
      byId.set(n.id, p)
      return { ...n, ...p }
    })
    const projectedEdges = edges
      .map((e) => {
        const s = byId.get(e.source)
        const t = byId.get(e.target)
        if (!s || !t) return null
        return { ...e, sx: s.x, sy: s.y, tx: t.x, ty: t.y, avgHours: e.avg_hours }
      })
      .filter(Boolean)
    return { divisionPaths, projectedNodes, projectedEdges }
  }, [geojson, nodes, edges, size])

  // theme colors, re-read whenever the OS color scheme flips
  useEffect(() => {
    const update = () => {
      themeRef.current = {
        particle: readCssVar('--particle', '#5b8def'),
        land: readCssVar('--map-land', '#1b1e26'),
        border: readCssVar('--map-border', 'rgba(255,255,255,0.14)'),
      }
    }
    update()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // (re)create the simulation whenever the eligible edge set changes
  // (e.g. filters), keep existing in-flight particles otherwise
  useEffect(() => {
    if (!simRef.current) {
      simRef.current = new FlowSimulation(projectedEdges)
    } else {
      simRef.current.setEdges(projectedEdges)
    }
  }, [projectedEdges])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !simRef.current) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.width * dpr
    canvas.height = size.height * dpr
    ctx.scale(dpr, dpr)

    let lastCluster = 0
    const totalVolume = projectedEdges.reduce((s, e) => s + e.volume, 0)
    const spawnRate = Math.min(28, Math.max(6, totalVolume / 90))

    const frame = (now) => {
      const sim = simRef.current
      sim.tick(now, spawnRate)
      const points = sim.positions(now)

      ctx.clearRect(0, 0, size.width, size.height)
      ctx.fillStyle = themeRef.current.particle
      for (const p of points) {
        const fade = p.t < 0.08 ? p.t / 0.08 : p.t > 0.9 ? (1 - p.t) / 0.1 : 1
        ctx.globalAlpha = 0.25 + 0.65 * fade
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (now - lastCluster > CLUSTER_INTERVAL_MS) {
        lastCluster = now
        setClusters(dbscan(points, CLUSTER_EPSILON_PX, CLUSTER_MIN_PTS).slice(0, 6))
      }

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [projectedEdges, size])

  return (
    <div ref={containerRef} className="flow-map">
      <svg width={size.width} height={size.height} className="flow-map__base">
        <g>
          {divisionPaths.map((f) => (
            <path key={f.id} d={f.d} className="flow-map__division" />
          ))}
        </g>
        <g>
          {projectedEdges.map((e, i) => (
            <path
              key={i}
              d={laneSvgPath(e)}
              className="flow-map__lane"
              style={{ opacity: 0.12 + Math.min(0.35, e.volume / 300) }}
            />
          ))}
        </g>
      </svg>

      <canvas ref={canvasRef} className="flow-map__canvas" style={{ width: size.width, height: size.height }} />

      <svg width={size.width} height={size.height} className="flow-map__overlay">
        {clusters.map((c) => (
          <circle key={c.id} cx={c.x} cy={c.y} r={14 + c.size} className="flow-map__cluster-ring" />
        ))}
        {projectedNodes.map((n) => (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            className={`flow-map__node flow-map__node--${n.type}`}
            onMouseEnter={() => {
              setHoveredNode(n)
              onHover?.(n)
            }}
            onMouseLeave={() => {
              setHoveredNode(null)
              onHover?.(null)
            }}
          >
            <circle r={n.type === 'warehouse' ? 6 : 4} />
            {hoveredNode?.id === n.id && (
              <text x={10} y={4} className="flow-map__node-label">
                {n.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

function laneSvgPath(edge) {
  const { sx, sy, tx, ty } = edge
  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2
  const dx = tx - sx
  const dy = ty - sy
  const dist = Math.hypot(dx, dy) || 1
  const bow = Math.min(dist * 0.18, 60)
  const nx = -dy / dist
  const ny = dx / dist
  const cx = mx + nx * bow
  const cy = my + ny * bow
  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`
}
