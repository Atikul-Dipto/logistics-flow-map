import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import { LiveTracking } from '../../icons'
import '../shared.css'

const STATUS_TONE = { Completed: 'good', Pending: 'accent', Failed: 'critical' }

export default function Pickup() {
  const { pickups, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [hub, setHub] = useState('All')

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pickups.filter((p) => {
      if (status !== 'All' && p.status !== status) return false
      if (hub !== 'All' && p.hub !== hub) return false
      if (!q) return true
      return p.seller.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    })
  }, [pickups, search, status, hub])

  const stats = useMemo(() => {
    const total = pickups.length
    const completed = pickups.filter((p) => p.status === 'Completed').length
    const failed = pickups.filter((p) => p.status === 'Failed').length
    const pending = pickups.filter((p) => p.status === 'Pending').length
    return { total, slaPct: total ? Math.round((completed / total) * 100) : 0, failed, pending }
  }, [pickups])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading pickup schedule…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Pickup</h1>
          <p className="module-page__subtitle">First-mile pickup scheduling and completion tracking, seller by seller.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Scheduled today</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.slaPct}%</div>
          <div className="module-page__stat-label">Pickup SLA</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.pending}</div>
          <div className="module-page__stat-label">Pending</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.failed}</div>
          <div className="module-page__stat-label">Failed pickups</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search seller or pickup ID…"
          filters={[
            { label: 'Status', value: status, onChange: setStatus, options: ['Completed', 'Pending', 'Failed'] },
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
          ]}
          resultCount={filtered.length}
          resultLabel="pickups"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          defaultSort={{ key: 'seller', dir: 'asc' }}
          emptyLabel="No pickups match these filters."
          columns={[
            { key: 'id', label: 'Pickup', sortable: true },
            { key: 'seller', label: 'Seller', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'riderName', label: 'Rider', sortable: true },
            { key: 'window', label: 'Window', sortable: true },
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status]} /> },
            { key: 'failReason', label: 'Fail Reason', render: (r) => r.failReason ?? '—' },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
