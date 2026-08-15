import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import OrderDrawer from './OrderDrawer'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'

const STATUS_TONE = { Fulfilled: 'good', Processing: 'accent', 'Delivery Issue': 'warning', Cancelled: 'critical' }

export default function Orders() {
  const location = useLocation()
  const { orders, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const openId = location.state?.openId
    if (openId && orders.length) {
      const found = orders.find((o) => o.id === openId)
      if (found) setSelected(found)
    }
  }, [location.state, orders])

  const statuses = useMemo(() => Array.from(new Set(orders.map((o) => o.status))).sort(), [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'All' && o.status !== status) return false
      if (!q) return true
      return o.id.toLowerCase().includes(q) || o.seller.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
    })
  }, [orders, search, status])

  const stats = useMemo(() => {
    const total = orders.length
    const fulfilled = orders.filter((o) => o.status === 'Fulfilled').length
    const cancelled = orders.filter((o) => o.status === 'Cancelled')
    const cancelledValue = cancelled.reduce((s, o) => s + o.value, 0)
    return { total, fulfilledPct: total ? Math.round((fulfilled / total) * 100) : 0, cancelledCount: cancelled.length, cancelledValue }
  }, [orders])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading orders…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Orders</h1>
          <p className="module-page__subtitle">Order-level view across sellers, items, and fulfillment status — one layer above individual shipments.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Total orders</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.fulfilledPct}%</div>
          <div className="module-page__stat-label">Fulfilled</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.cancelledCount.toLocaleString()}</div>
          <div className="module-page__stat-label">Cancelled orders</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.cancelledValue)}</div>
          <div className="module-page__stat-label">Value lost to cancellation</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search order ID, seller, customer…"
          filters={[{ label: 'Status', value: status, onChange: setStatus, options: statuses }]}
          resultCount={filtered.length}
          resultLabel="orders"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'value', dir: 'desc' }}
          emptyLabel="No orders match these filters."
          columns={[
            { key: 'id', label: 'Order', sortable: true },
            { key: 'seller', label: 'Seller', sortable: true },
            { key: 'customer', label: 'Customer', sortable: true },
            { key: 'itemCount', label: 'Items', align: 'right', sortable: true },
            { key: 'value', label: 'Value', align: 'right', sortable: true, render: (r) => formatBdt(r.value) },
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} /> },
          ]}
          rows={filtered}
        />
      </div>

      <OrderDrawer open={!!selected} onClose={() => setSelected(null)} order={selected} />
    </div>
  )
}
