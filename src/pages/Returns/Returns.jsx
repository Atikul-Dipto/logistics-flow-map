import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import ReturnDrawer from './ReturnDrawer'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'

const STAGE_TONE = { Requested: 'neutral', 'Picked Up': 'accent', 'At Hub': 'accent', Inspected: 'warning', Refunded: 'good' }

export default function Returns() {
  const { returns, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All')
  const [hub, setHub] = useState('All')
  const [selected, setSelected] = useState(null)

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])
  const stages = useMemo(() => Array.from(new Set(returns.map((r) => r.stage))).sort(), [returns])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return returns.filter((r) => {
      if (stage !== 'All' && r.stage !== stage) return false
      if (hub !== 'All' && r.hub !== hub) return false
      if (!q) return true
      return r.id.toLowerCase().includes(q) || r.shipmentId.toLowerCase().includes(q) || r.seller.toLowerCase().includes(q)
    })
  }, [returns, search, stage, hub])

  const stats = useMemo(() => {
    const total = returns.length
    const pendingRefund = returns.filter((r) => r.stage !== 'Refunded').length
    const totalRefundValue = returns.reduce((s, r) => s + r.refundAmount, 0)
    const avgAging = total ? Math.round(returns.reduce((s, r) => s + r.agingDays, 0) / total) : 0
    return { total, pendingRefund, totalRefundValue, avgAging }
  }, [returns])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading returns…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Returns</h1>
          <p className="module-page__subtitle">Reverse logistics from return request through inspection to refund.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Open returns</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.pendingRefund.toLocaleString()}</div>
          <div className="module-page__stat-label">Pending refund</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.totalRefundValue)}</div>
          <div className="module-page__stat-label">Total refund value</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgAging}d</div>
          <div className="module-page__stat-label">Avg hub aging</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search return ID, shipment, seller…"
          filters={[
            { label: 'Stage', value: stage, onChange: setStage, options: stages },
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
          ]}
          resultCount={filtered.length}
          resultLabel="returns"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'agingDays', dir: 'desc' }}
          emptyLabel="No returns match these filters."
          columns={[
            { key: 'id', label: 'Return', sortable: true },
            { key: 'shipmentId', label: 'Shipment', sortable: true },
            { key: 'seller', label: 'Seller', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'reason', label: 'Reason', sortable: true },
            { key: 'stage', label: 'Stage', sortable: true, render: (r) => <StatusPill label={r.stage} tone={STAGE_TONE[r.stage] ?? 'neutral'} /> },
            { key: 'agingDays', label: 'Aging', align: 'right', sortable: true, render: (r) => `${r.agingDays}d` },
            { key: 'refundAmount', label: 'Refund', align: 'right', sortable: true, render: (r) => formatBdt(r.refundAmount) },
          ]}
          rows={filtered}
        />
      </div>

      <ReturnDrawer open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </div>
  )
}
