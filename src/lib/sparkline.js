// Hand-rolled inline-SVG sparkline path builder -- at 8 KPI cards ×
// ~14 points single-series each, a charting library is unjustified
// weight. No axes/gridlines/labels: a stat-tile sparkline carries no
// chart chrome (dataviz skill).
export function sparklinePath(values, width, height, padding = 2) {
  if (!values.length) return { line: '', area: '' }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const points = values.map((v, i) => {
    const x = padding + (i / Math.max(1, values.length - 1)) * innerW
    const y = padding + innerH - ((v - min) / range) * innerH
    return [x, y]
  })

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')
  const area = `${line}L${points[points.length - 1][0].toFixed(1)},${height}L${points[0][0].toFixed(1)},${height}Z`

  return { line, area, lastPoint: points[points.length - 1] }
}
