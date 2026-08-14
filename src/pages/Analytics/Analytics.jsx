import { useMemo } from 'react'
import { useOps } from '../../context/OpsDataContext'
import BarChart from '../../components/BarChart'
import TrendChart from '../../components/TrendChart'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './Analytics.css'

export default function Analytics() {
  const { opsData, hubOps, kpiSeries, loading } = useOps()

  const hubThroughput = useMemo(
    () => (opsData ? [...opsData.hub_stats].sort((a, b) => b.shipment_count - a.shipment_count).map((h) => ({ label: h.hub, value: h.shipment_count })) : []),
    [opsData],
  )

  const delayBreakdown = useMemo(
    () => (opsData ? [...opsData.network_delay_reasons.breakdown].sort((a, b) => b.count - a.count).map((d) => ({ label: d.reason, value: d.count })) : []),
    [opsData],
  )

  const carrierOnTime = useMemo(
    () =>
      opsData
        ? [...opsData.carrier_stats].sort((a, b) => b.on_time_rate - a.on_time_rate).map((c) => ({ label: c.carrier, value: Math.round(c.on_time_rate * 100) }))
        : [],
    [opsData],
  )

  const trendLabels = useMemo(() => Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`), [])

  const networkOnTime = useMemo(() => {
    if (!opsData) return 0
    return opsData.hub_stats.reduce((s, h) => s + h.on_time_rate * h.shipment_count, 0) / opsData.total_shipments
  }, [opsData])

  if (loading || !opsData) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading analytics…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Analytics</h1>
          <p className="module-page__subtitle">Trends, SLA, hub and carrier performance — computed from the real shipments dataset and today's live network snapshot.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{opsData.total_shipments.toLocaleString()}</div>
          <div className="module-page__stat-label">Total historical shipments</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{Math.round(networkOnTime * 100)}%</div>
          <div className="module-page__stat-label">Network on-time rate</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(opsData.total_order_value)}</div>
          <div className="module-page__stat-label">Total order value</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{hubOps.length}</div>
          <div className="module-page__stat-label">Hubs tracked</div>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Network volume — last 14 days</div>
        <p className="module-page__panel-caption">Shipments created vs. delivered, from the same simulation that drives the Command Center KPIs.</p>
        {kpiSeries && (
          <TrendChart
            labels={trendLabels}
            series={[
              { name: 'Shipments Today', color: 'var(--accent)', values: kpiSeries.shipmentsToday },
              { name: 'Delivered', color: 'var(--status-good)', values: kpiSeries.delivered },
            ]}
          />
        )}
      </div>

      <div className="analytics__grid">
        <div className="module-page__panel">
          <div className="module-page__panel-title">Hub throughput</div>
          <p className="module-page__panel-caption">Total shipment volume by hub, historical dataset.</p>
          <BarChart items={hubThroughput} />
        </div>

        <div className="module-page__panel">
          <div className="module-page__panel-title">Delay reason breakdown</div>
          <p className="module-page__panel-caption">Network-wide root cause of delayed shipments.</p>
          <BarChart items={delayBreakdown} color="var(--status-warning)" />
        </div>

        <div className="module-page__panel">
          <div className="module-page__panel-title">Carrier on-time rate</div>
          <p className="module-page__panel-caption">Ranked highest to lowest — real carrier performance from the dataset.</p>
          <BarChart items={carrierOnTime} valueFormat={(v) => `${v}%`} color="var(--status-good)" />
        </div>
      </div>
    </div>
  )
}
