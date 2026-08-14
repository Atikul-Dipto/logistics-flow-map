import { useEffect, useMemo, useState } from 'react'
import FlowMap from './components/FlowMap'
import StatCards from './components/StatCards'
import FilterBar from './components/FilterBar'
import HotspotList from './components/HotspotList'
import { computeCentrality } from './lib/centrality'
import { LiveTracking } from './icons'
import './App.css'

export default function App() {
  const [data, setData] = useState(null)
  const [geojson, setGeojson] = useState(null)
  const [carrier, setCarrier] = useState('All')
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([fetch(`${base}data/flow_data.json`).then((r) => r.json()), fetch(`${base}data/bd_divisions.geojson`).then((r) => r.json())]).then(
      ([flow, geo]) => {
        setData(flow)
        setGeojson(geo)
      },
    )
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
          <FlowMap geojson={geojson} nodes={data.nodes} edges={edges} onHover={setHoveredNode} />
          {hoveredNode && (
            <div className="app__tooltip">
              <strong>{hoveredNode.label}</strong>
              <span>{hoveredNode.type === 'warehouse' ? 'Fulfillment warehouse' : `Regional hub — ${hoveredNode.region}`}</span>
            </div>
          )}
        </div>
        <HotspotList nodes={centrality.slice(0, 8)} />
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
