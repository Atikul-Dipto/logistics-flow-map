import { useMemo, useState } from 'react'
import './TrendChart.css'

const WIDTH = 640
const HEIGHT = 200
const PAD = 24

// Hand-rolled multi-line trend chart -- one shared y-axis (both series
// are shipment counts, never dual-axis per the dataviz skill), a
// legend since there are 2 series, and a hover crosshair + tooltip.
export default function TrendChart({ series, labels }) {
  const [hoverIdx, setHoverIdx] = useState(null)

  const { paths, points } = useMemo(() => {
    const all = series.flatMap((s) => s.values)
    const min = Math.min(...all)
    const max = Math.max(...all)
    const range = max - min || 1
    const n = series[0]?.values.length || 1
    const innerW = WIDTH - PAD * 2
    const innerH = HEIGHT - PAD * 2
    const xFor = (i) => PAD + (i / Math.max(1, n - 1)) * innerW
    const yFor = (v) => PAD + innerH - ((v - min) / range) * innerH

    const paths = series.map((s) => {
      const pts = s.values.map((v, i) => [xFor(i), yFor(v)])
      const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')
      return { name: s.name, color: s.color, line, pts }
    })
    const points = series[0]?.values.map((_, i) => xFor(i)) || []
    return { paths, points }
  }, [series])

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((px, i) => {
      const d = Math.abs(px - x)
      if (d < closestDist) {
        closestDist = d
        closest = i
      }
    })
    setHoverIdx(closest)
  }

  return (
    <div className="trend-chart">
      <div className="trend-chart__legend">
        {series.map((s) => (
          <span key={s.name} className="trend-chart__legend-item">
            <span className="trend-chart__swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="trend-chart__canvas">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trend-chart__svg" onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)} preserveAspectRatio="none">
          {paths.map((p) => (
            <path key={p.name} d={p.line} fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {hoverIdx != null && <line x1={points[hoverIdx]} x2={points[hoverIdx]} y1={PAD} y2={HEIGHT - PAD} className="trend-chart__crosshair" />}
          {hoverIdx != null &&
            paths.map((p) => <circle key={p.name} cx={p.pts[hoverIdx][0]} cy={p.pts[hoverIdx][1]} r="3.5" fill={p.color} />)}
        </svg>
        {hoverIdx != null && (
          <div className="trend-chart__tooltip" style={{ left: `${(points[hoverIdx] / WIDTH) * 100}%` }}>
            <div className="trend-chart__tooltip-label">{labels[hoverIdx]}</div>
            {series.map((s) => (
              <div key={s.name} className="trend-chart__tooltip-row">
                <span style={{ color: s.color }}>{s.name}</span>
                <strong>{s.values[hoverIdx].toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
