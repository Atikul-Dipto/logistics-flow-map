import './BarChart.css'

// Hand-rolled horizontal magnitude bar list -- single sequential hue,
// direct value labels, no chart-library weight at this data scale
// (dataviz skill: sequential = one hue, rounded data-ends).
export default function BarChart({ items, valueFormat = (v) => v.toLocaleString(), color = 'var(--accent)' }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div key={item.label} className="bar-chart__row">
          <span className="bar-chart__label" title={item.label}>
            {item.label}
          </span>
          <div className="bar-chart__track">
            <div className="bar-chart__fill" style={{ width: `${Math.max(2, (item.value / max) * 100)}%`, background: color }} />
          </div>
          <span className="bar-chart__value">{valueFormat(item.value)}</span>
        </div>
      ))}
    </div>
  )
}
