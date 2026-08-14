import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import ShipmentDrawer from './ShipmentDrawer'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './Shipments.css'

const STATUS_TONE = {
  Delivered: 'good',
  'In Transit': 'accent',
  'At Hub': 'accent',
  'Out for Delivery': 'accent',
  Delayed: 'warning',
  'Failed Delivery': 'critical',
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.round(diffMs / 3600000)
  if (Math.abs(hours) < 1) return 'just now'
  if (Math.abs(hours) < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function Shipments() {
  const location = useLocation()
  const { mockShipments, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [hub, setHub] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const openId = location.state?.openId
    if (openId && mockShipments.length) {
      const found = mockShipments.find((s) => s.id === openId)
      if (found) setSelected(found)
    }
  }, [location.state, mockShipments])

  const statuses = useMemo(() => Array.from(new Set(mockShipments.map((s) => s.status))).sort(), [mockShipments])
  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mockShipments.filter((s) => {
      if (status !== 'All' && s.status !== status) return false
      if (hub !== 'All' && s.hub !== hub) return false
      if (!q) return true
      return s.id.toLowerCase().includes(q) || s.orderId.toLowerCase().includes(q) || s.seller.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)
    })
  }, [mockShipments, search, status, hub])

  const stats = useMemo(() => {
    const total = mockShipments.length
    const delivered = mockShipments.filter((s) => s.status === 'Delivered').length
    const atRisk = mockShipments.filter((s) => s.status === 'Delayed' || s.status === 'Failed Delivery').length
    const codOutstanding = mockShipments.filter((s) => s.status !== 'Delivered').reduce((sum, s) => sum + s.codAmount, 0)
    return { total, deliveredPct: total ? Math.round((delivered / total) * 100) : 0, atRisk, codOutstanding }
  }, [mockShipments])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading shipments…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Shipments</h1>
          <p className="module-page__subtitle">Every shipment as a searchable, filterable digital twin — full lifecycle timeline from order to delivery.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Total shipments</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.deliveredPct}%</div>
          <div className="module-page__stat-label">Delivered</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.atRisk.toLocaleString()}</div>
          <div className="module-page__stat-label">Delayed / Failed</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.codOutstanding)}</div>
          <div className="module-page__stat-label">COD outstanding</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shipment ID, order ID, seller, customer…"
          filters={[
            { label: 'Status', value: status, onChange: setStatus, options: statuses },
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
          ]}
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
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} /> },
            { key: 'codAmount', label: 'COD', align: 'right', sortable: true, render: (r) => formatBdt(r.codAmount) },
            { key: 'createdAt', label: 'Created', sortable: true, render: (r) => timeAgo(r.createdAt) },
          ]}
          rows={filtered}
        />
      </div>

      <ShipmentDrawer open={!!selected} onClose={() => setSelected(null)} shipment={selected} />
    </div>
  )
}
