import { sparklinePath } from '../../lib/sparkline'
import { formatCompact } from '../../lib/format'
import './KpiCard.css'

// polarity: 'positive' (up = good), 'negative' (up = bad), 'neutral' (no direction judgement)
function deltaClass(deltaPct, polarity) {
  if (polarity === 'neutral' || deltaPct === 0) return 'kpi-card__delta--neutral'
  const rising = deltaPct > 0
  const good = polarity === 'positive' ? rising : !rising
  return good ? 'kpi-card__delta--good' : 'kpi-card__delta--bad'
}

export default function KpiCard({ label, value, prefix = '', suffix = '', deltaPct, series, polarity = 'neutral', icon, active, onClick }) {
  const { line, lastPoint } = series && series.length > 1 ? sparklinePath(series, 96, 30) : { line: '', lastPoint: null }

  return (
    <button type="button" className={'kpi-card' + (active ? ' kpi-card--active' : '')} onClick={onClick}>
      <div className="kpi-card__top">
        <div className="kpi-card__icon">{icon}</div>
        {series && series.length > 1 && (
          <svg width="96" height="30" className="kpi-card__spark">
            <path d={line} className="kpi-card__spark-line" />
            {lastPoint && <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.6" className="kpi-card__spark-dot" />}
          </svg>
        )}
      </div>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">
        {prefix}
        {typeof value === 'number' ? formatCompact(value) : value}
        {suffix}
      </div>
      {typeof deltaPct === 'number' && (
        <div className={`kpi-card__delta ${deltaClass(deltaPct, polarity)}`}>
          {deltaPct > 0 ? '▲' : deltaPct < 0 ? '▼' : '–'} {Math.abs(deltaPct).toFixed(1)}% vs yesterday
        </div>
      )}
    </button>
  )
}
