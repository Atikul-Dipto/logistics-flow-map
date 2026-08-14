import KpiCard from './KpiCard'
import { Shipments, Truck, Hub, Delivery, DeliveryRate, FailedDelivery, Sla, Cod } from '../../icons'
import { formatCompact } from '../../lib/format'
import './KpiRow.css'

function pctDelta(series) {
  if (!series || series.length < 2) return 0
  const today = series[series.length - 1]
  const yesterday = series[series.length - 2]
  if (!yesterday) return 0
  return ((today - yesterday) / yesterday) * 100
}

export default function KpiRow({ kpiSeries, activeFilter, onFilterChange }) {
  if (!kpiSeries) {
    return (
      <div className="kpi-row">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="kpi-row__skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { key: 'shipmentsToday', label: 'Shipments Today', icon: <Shipments />, polarity: 'neutral' },
    { key: 'inTransit', label: 'In Transit', icon: <Truck />, polarity: 'neutral' },
    { key: 'atHub', label: 'At Hub', icon: <Hub />, polarity: 'neutral' },
    { key: 'outForDelivery', label: 'Out for Delivery', icon: <Delivery />, polarity: 'neutral' },
    { key: 'delivered', label: 'Delivered', icon: <DeliveryRate />, polarity: 'positive', filterable: true },
    { key: 'failedDelivery', label: 'Failed Delivery', icon: <FailedDelivery />, polarity: 'negative' },
    { key: 'slaRisk', label: 'SLA Risk', icon: <Sla />, polarity: 'negative', filterable: true },
    { key: 'codOutstanding', label: 'COD Outstanding', icon: <Cod />, polarity: 'negative', prefix: 'BDT ' },
  ]

  return (
    <div className="kpi-row">
      {cards.map((c) => {
        const series = kpiSeries[c.key]
        const value = series[series.length - 1]
        return (
          <KpiCard
            key={c.key}
            label={c.label}
            value={c.prefix ? formatCompact(value) : value}
            prefix={c.prefix}
            deltaPct={pctDelta(series)}
            series={series}
            polarity={c.polarity}
            icon={c.icon}
            active={c.filterable && activeFilter === c.key}
            onClick={() => c.filterable && onFilterChange(activeFilter === c.key ? null : c.key)}
          />
        )
      })}
    </div>
  )
}
