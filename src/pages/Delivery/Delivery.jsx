import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import BarChart from '../../components/BarChart'
import ShipmentDrawer from '../Shipments/ShipmentDrawer'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './Delivery.css'

const STATUS_TONE = { Delivered: 'good', 'Out for Delivery': 'accent' }
const BUCKETS = [
  { label: '< 12h', max: 12 },
  { label: '12–24h', max: 24 },
  { label: '24–48h', max: 48 },
  { label: '48h+', max: Infinity },
]

export default function Delivery() {
  const { mockShipments, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)

  const relevant = useMemo(() => mockShipments.filter((s) => s.status === 'Delivered' || s.status === 'Out for Delivery'), [mockShipments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return relevant.filter((s) => {
      if (status !== 'All' && s.status !== status) return false
      if (!q) return true
      return s.id.toLowerCase().includes(q) || s.seller.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)
    })
  }, [relevant, search, status])

  const successByZone = useMemo(() => {
    const byRegion = new Map()
    for (const s of mockShipments) {
      if (s.status !== 'Delivered' && s.status !== 'Failed Delivery') continue
      if (!byRegion.has(s.region)) byRegion.set(s.region, { delivered: 0, failed: 0 })
      const e = byRegion.get(s.region)
      if (s.status === 'Delivered') e.delivered += 1
      else e.failed += 1
    }
    return Array.from(byRegion.entries())
      .map(([region, e]) => ({ label: region, value: Math.round((e.delivered / (e.delivered + e.failed)) * 100) }))
      .sort((a, b) => b.value - a.value)
  }, [mockShipments])

  const timeDistribution = useMemo(() => {
    const counts = BUCKETS.map(() => 0)
    for (const s of mockShipments) {
      if (s.status !== 'Delivered') continue
      const placed = s.timeline.find((e) => e.stage === 'Order Placed')
      const delivered = s.timeline.find((e) => e.stage === 'Delivered')
      if (!placed || !delivered) continue
      const hours = (new Date(delivered.at) - new Date(placed.at)) / 3600000
      const idx = BUCKETS.findIndex((b) => hours < b.max)
      counts[idx === -1 ? BUCKETS.length - 1 : idx] += 1
    }
    return BUCKETS.map((b, i) => ({ label: b.label, value: counts[i] }))
  }, [mockShipments])

  const stats = useMemo(() => {
    const outForDelivery = mockShipments.filter((s) => s.status === 'Out for Delivery').length
    const delivered = mockShipments.filter((s) => s.status === 'Delivered').length
    const failed = mockShipments.filter((s) => s.status === 'Failed Delivery').length
    const successRate = delivered + failed ? Math.round((delivered / (delivered + failed)) * 100) : 0
    return { outForDelivery, delivered, successRate }
  }, [mockShipments])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading delivery data…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Delivery</h1>
          <p className="module-page__subtitle">Out-for-delivery and delivered shipment tracking with live success-rate trends.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.outForDelivery.toLocaleString()}</div>
          <div className="module-page__stat-label">Out for delivery</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.delivered.toLocaleString()}</div>
          <div className="module-page__stat-label">Delivered</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.successRate}%</div>
          <div className="module-page__stat-label">Delivery success rate</div>
        </div>
      </div>

      <div className="delivery__grid">
        <div className="module-page__panel">
          <div className="module-page__panel-title">Success rate by zone</div>
          <p className="module-page__panel-caption">Delivered vs. failed delivery attempts, by region.</p>
          <BarChart items={successByZone} valueFormat={(v) => `${v}%`} color="var(--status-good)" />
        </div>
        <div className="module-page__panel">
          <div className="module-page__panel-title">Delivery time distribution</div>
          <p className="module-page__panel-caption">Order-placed to delivered, for today's delivered shipments.</p>
          <BarChart items={timeDistribution} color="var(--accent)" />
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shipment, seller, customer…"
          filters={[{ label: 'Status', value: status, onChange: setStatus, options: ['Delivered', 'Out for Delivery'] }]}
          resultCount={filtered.length}
          resultLabel="shipments"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'createdAt', dir: 'desc' }}
          emptyLabel="No shipments match these filters."
          columns={[
            { key: 'id', label: 'Shipment', sortable: true },
            { key: 'seller', label: 'Seller', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'riderName', label: 'Rider', sortable: true },
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status]} /> },
          ]}
          rows={filtered}
        />
      </div>

      <ShipmentDrawer open={!!selected} onClose={() => setSelected(null)} shipment={selected} />
    </div>
  )
}
