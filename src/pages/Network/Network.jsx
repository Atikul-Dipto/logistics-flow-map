import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import FlowMap from '../../components/FlowMap'
import DataTable from '../../components/DataTable'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './Network.css'

export default function Network() {
  const { data, geojson, hubOps, zoneStats, loading } = useOps()
  const [hoverInfo, setHoverInfo] = useState(null)

  const zoneCoverage = useMemo(() => {
    const byRegion = new Map()
    for (const h of hubOps) {
      if (!byRegion.has(h.region)) byRegion.set(h.region, { region: h.region, hubCount: 0, avgCapacity: 0, activeRiders: 0, totalCapacity: 0 })
      const e = byRegion.get(h.region)
      e.hubCount += 1
      e.totalCapacity += h.capacityPct
      e.activeRiders += h.activeRiders
    }
    return Array.from(byRegion.values()).map((e) => ({ ...e, avgCapacity: Math.round(e.totalCapacity / e.hubCount) }))
  }, [hubOps])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading network topology…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Network</h1>
          <p className="module-page__subtitle">Network-wide topology and capacity planning across the full hub graph.</p>
        </div>
      </div>

      <div className="network__map-panel">
        <FlowMap geojson={geojson} nodes={data.nodes} edges={data.edges} onHover={setHoverInfo} hubOps={hubOps} zoneStats={zoneStats} />
        {hoverInfo?.kind === 'node' && (
          <div className="network__tooltip">
            <strong>{hoverInfo.label}</strong>
            <span>{hoverInfo.type === 'warehouse' ? 'Fulfillment warehouse' : `Regional hub — ${hoverInfo.region}`}</span>
          </div>
        )}
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Zone coverage &amp; capacity planning</div>
        <p className="module-page__panel-caption">Hub density and average capacity utilization, grouped by region.</p>
        <DataTable
          keyField="region"
          defaultSort={{ key: 'avgCapacity', dir: 'desc' }}
          columns={[
            { key: 'region', label: 'Region', sortable: true },
            { key: 'hubCount', label: 'Hubs', align: 'right', sortable: true },
            { key: 'avgCapacity', label: 'Avg Capacity', align: 'right', sortable: true, render: (r) => `${r.avgCapacity}%` },
            { key: 'activeRiders', label: 'Active Riders', align: 'right', sortable: true },
          ]}
          rows={zoneCoverage}
        />
      </div>
    </div>
  )
}
