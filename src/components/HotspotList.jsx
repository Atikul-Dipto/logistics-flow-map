import { Trends, Warehouse, Hub } from '../icons'

export default function HotspotList({ nodes }) {
  const max = nodes[0]?.totalVolume || 1
  return (
    <aside className="hotspot-list">
      <h2 className="hotspot-list__title">
        <Trends className="icon" /> Hub throughput
      </h2>
      <p className="hotspot-list__caption">Ranked by weighted degree centrality — total shipments in + out, for the active filter.</p>
      <ol>
        {nodes.map((n, i) => (
          <li key={n.id} className="hotspot-list__row">
            <span className="hotspot-list__rank">{i + 1}</span>
            {n.type === 'warehouse' ? <Warehouse className="icon" /> : <Hub className="icon" />}
            <div className="hotspot-list__bar-wrap">
              <div className="hotspot-list__name">{n.label}</div>
              <div className="hotspot-list__bar">
                <div className="hotspot-list__bar-fill" style={{ width: `${(n.totalVolume / max) * 100}%` }} />
              </div>
            </div>
            <span className="hotspot-list__value">{n.totalVolume.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
