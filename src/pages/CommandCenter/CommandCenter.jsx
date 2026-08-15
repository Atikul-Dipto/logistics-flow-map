import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import FlowMap from '../../components/FlowMap'
import FilterBar from '../../components/FilterBar'
import HotspotList from '../../components/HotspotList'
import LiveBoard from '../../components/LiveBoard'
import KpiRow from './KpiRow'
import HubPanel from './HubPanel'
import ExceptionsPanel from './ExceptionsPanel'
import { computeCentrality } from '../../lib/centrality'
import { useOps } from '../../context/OpsDataContext'
import { LiveTracking } from '../../icons'
import './CommandCenter.css'

const MAX_EVENTS = 10
let eventKeySeq = 0

export default function CommandCenter() {
  const location = useLocation()
  const { data, geojson, hubOps, kpiSeries, exceptions, zoneStats, loading } = useOps()
  const [carrier, setCarrier] = useState('All')
  const [hoverInfo, setHoverInfo] = useState(null)
  const [events, setEvents] = useState([])
  const [selectedHub, setSelectedHub] = useState(null)
  const [activeKpiFilter, setActiveKpiFilter] = useState(null)

  // opened via the command palette (Ctrl+K -> select a hub result)
  useEffect(() => {
    const openHub = location.state?.openHub
    if (openHub && hubOps.length) {
      const found = hubOps.find((h) => h.hub === openHub)
      if (found) setSelectedHub(found)
    }
  }, [location.state, hubOps])

  const handleEvent = useCallback((raw) => {
    eventKeySeq += 1
    const timeLabel = new Date(performance.timeOrigin + raw.time).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const enriched = {
      key: eventKeySeq,
      type: raw.type,
      shipmentId: raw.shipmentId,
      sourceLabel: raw.edge?.sourceLabel,
      targetLabel: raw.edge?.targetLabel,
      carrier: raw.edge?.carrier,
      timeLabel,
    }
    setEvents((prev) => [enriched, ...prev].slice(0, MAX_EVENTS))
  }, [])

  const edges = useMemo(() => {
    if (!data) return []
    return carrier === 'All' ? data.edges : data.edges.filter((e) => e.carrier === carrier)
  }, [data, carrier])

  const centrality = useMemo(() => (data ? computeCentrality(data.nodes, edges) : []), [data, edges])

  // KPI click-to-filter: re-rank the sidebar list by the selected
  // KPI's real metric instead of default throughput centrality.
  const sideList = useMemo(() => {
    if (activeKpiFilter === 'slaRisk') {
      const ranked = [...hubOps].sort((a, b) => b.slaRiskCount - a.slaRiskCount).slice(0, 8)
      return {
        nodes: ranked.map((h) => ({ id: h.hub, label: h.hub, type: 'hub', totalVolume: h.slaRiskCount })),
        title: 'Hubs by SLA risk',
        caption: 'Shipments currently at elevated SLA risk, ranked highest first.',
      }
    }
    if (activeKpiFilter === 'delivered') {
      const ranked = [...hubOps].sort((a, b) => b.onTimeRate - a.onTimeRate).slice(0, 8)
      return {
        nodes: ranked.map((h) => ({ id: h.hub, label: h.hub, type: 'hub', totalVolume: Math.round(h.onTimeRate * 1000) })),
        title: 'Hubs by on-time rate',
        caption: 'Best-performing hubs by on-time delivery rate (index shown, not raw volume).',
      }
    }
    return { nodes: centrality.slice(0, 8), title: undefined, caption: undefined }
  }, [activeKpiFilter, hubOps, centrality])

  const emphasizeHubIds = useMemo(() => {
    if (!activeKpiFilter) return null
    return sideList.nodes.map((n) => n.label)
  }, [activeKpiFilter, sideList])

  if (loading) {
    return (
      <div className="command-center command-center--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading live network…</p>
      </div>
    )
  }

  return (
    <div className="command-center">
      <div className="command-center__header">
        <div>
          <h1>Command Center</h1>
          <p className="command-center__subtitle">Total network volume, operational health, and exceptions — at a glance.</p>
        </div>
        <FilterBar carriers={data.carriers} value={carrier} onChange={setCarrier} />
      </div>

      <KpiRow kpiSeries={kpiSeries} activeFilter={activeKpiFilter} onFilterChange={setActiveKpiFilter} />

      <div className="command-center__body">
        <div className="command-center__map-col">
          <div className="command-center__map-panel">
            <FlowMap
              geojson={geojson}
              nodes={data.nodes}
              edges={edges}
              onHover={setHoverInfo}
              onEvent={handleEvent}
              hubOps={hubOps}
              onSelectHub={setSelectedHub}
              emphasizeHubIds={emphasizeHubIds}
              zoneStats={zoneStats}
            />
            {hoverInfo?.kind === 'node' && (
              <div className="command-center__tooltip">
                <strong>{hoverInfo.label}</strong>
                <span>{hoverInfo.type === 'warehouse' ? 'Fulfillment warehouse' : `Regional hub — ${hoverInfo.region}`}</span>
                {hoverInfo.ops && <span>{hoverInfo.ops.capacityPct}% capacity · {hoverInfo.ops.slaRiskCount.toLocaleString()} at SLA risk</span>}
              </div>
            )}
            {hoverInfo?.kind === 'division' && (
              <div className="command-center__tooltip">
                <strong>{hoverInfo.name}</strong>
                <span>
                  {hoverInfo.volume.toLocaleString()} shipments · {(hoverInfo.onTimeRate * 100).toFixed(1)}% on-time
                </span>
              </div>
            )}
          </div>
          <ExceptionsPanel exceptions={exceptions} />
        </div>
        <div className="command-center__side">
          <LiveBoard events={events} />
          <HotspotList nodes={sideList.nodes} title={sideList.title} caption={sideList.caption} />
        </div>
      </div>

      <footer className="command-center__footer">
        <p>
          Simulated from {data.total_volume.toLocaleString()} historical shipments in the{' '}
          <a href="https://github.com/Atikul-Dipto/logistics-portal" target="_blank" rel="noreferrer">
            logistics-portal
          </a>{' '}
          dataset — not a live GPS feed. Dot motion is a seeded, weighted-by-volume simulation; hub capacity/SLA figures
          are a client-side simulation anchored to real per-hub shipment volume and on-time rate, not a live WMS.
        </p>
      </footer>

      <HubPanel open={!!selectedHub} onClose={() => setSelectedHub(null)} hub={selectedHub} />
    </div>
  )
}
