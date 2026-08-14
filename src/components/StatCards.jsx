import { Shipments, DeliveryRate, Cost, Hub } from '../icons'

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
      </div>
    </div>
  )
}

export default function StatCards({ totalVolume, avgOnTime, avgCost, hubCount }) {
  return (
    <div className="stat-cards">
      <StatCard icon={<Shipments />} label="Shipments in lane set" value={totalVolume.toLocaleString()} />
      <StatCard icon={<DeliveryRate />} label="Avg on-time rate" value={`${(avgOnTime * 100).toFixed(1)}%`} />
      <StatCard icon={<Cost />} label="Avg shipping cost" value={`BDT ${avgCost.toFixed(0)}`} />
      <StatCard icon={<Hub />} label="Active hubs" value={hubCount} />
    </div>
  )
}
