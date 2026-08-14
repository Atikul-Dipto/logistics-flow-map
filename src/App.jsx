import { useCallback, useEffect, useMemo, useState } from 'react'
import FlowMap from './components/FlowMap'
import StatCards from './components/StatCards'
import FilterBar from './components/FilterBar'
import HotspotList from './components/HotspotList'
import LiveBoard from './components/LiveBoard'
import { computeCentrality } from './lib/centrality'
import { LiveTracking } from './icons'
import './App.css'

const MAX_EVENTS = 10
let eventKeySeq = 0

export default function App() {
  const [data, setData] = useState(null)
  const [geojson, setGeojson] = useState(null)
  const [carrier, setCarrier] = useState('All')
  const [hoverInfo, setHoverInfo] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([fetch(`${base}data/flow_data.json`).then((r) => r.json()), fetch(`${base}data/bd_divisions.geojson`).then((r) => r.json())]).then(
      ([flow, geo]) => {
        setData(flow)
        setGeojson(geo)
      },
    )
  }, [])

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

  const totalVolume = useMemo(() => edges.reduce((s, e) => s + e.volume, 0), [edges])

  const avgOnTime = useMemo(() => {
    if (!totalVolume) return 0
    return edges.reduce((s, e) => s + e.on_time_rate * e.volume, 0) / totalVolume
  }, [edges, totalVolume])

  const avgCost = useMemo(() => {
    if (!totalVolume) return 0
    return edges.reduce((s, e) => s + e.avg_shipping_cost * e.volume, 0) / totalVolume
  }, [edges, totalVolume])

  const centrality = useMemo(() => (data ? computeCentrality(data.nodes, edges) : []), [data, edges])

  if (!data || !geojson) {
    return (
      <div className="app app--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading live network…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title">
          <LiveTracking className="icon icon--accent icon--pulse" />
          <div>
            <h1>Live Logistics Flow Map</h1>
            <p className="app__subtitle">Simulated real-time package movement across a Bangladesh shipment network</p>
          </div>
        </div>
        <FilterBar carriers={data.carriers} value={carrier} onChange={setCarrier} />
      </header>

      <StatCards totalVolume={totalVolume} avgOnTime={avgOnTime} avgCost={avgCost} hubCount={centrality.length} />

      <div className="app__body">
        <div className="app__map-panel">
          <FlowMap geojson={geojson} nodes={data.nodes} edges={edges} onHover={setHoverInfo} onEvent={handleEvent} />
          {hoverInfo?.kind === 'node' && (
            <div className="app__tooltip">
              <strong>{hoverInfo.label}</strong>
              <span>{hoverInfo.type === 'warehouse' ? 'Fulfillment warehouse' : `Regional hub — ${hoverInfo.region}`}</span>
            </div>
          )}
          {hoverInfo?.kind === 'division' && (
            <div className="app__tooltip">
              <strong>{hoverInfo.name}</strong>
              <span>{hoverInfo.volume.toLocaleString()} shipments · {(hoverInfo.onTimeRate * 100).toFixed(1)}% on-time</span>
            </div>
          )}
        </div>
        <div className="app__side">
          <LiveBoard events={events} />
          <HotspotList nodes={centrality.slice(0, 8)} />
        </div>
      </div>

      <footer className="app__footer">
        <p>
          Simulated from {data.total_volume.toLocaleString()} historical shipments in the{' '}
          <a href="https://github.com/Atikul-Dipto/logistics-portal" target="_blank" rel="noreferrer">
            logistics-portal
          </a>{' '}
          dataset — not a live GPS feed. Dot motion is a seeded, weighted-by-volume simulation; hotspot rings come from
          DBSCAN clustering of current particle positions, recomputed every few seconds.
        </p>
      </footer>
    </div>
  )
}
