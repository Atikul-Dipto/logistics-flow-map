import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import { LiveTracking } from '../../icons'
import '../shared.css'

const STATUS_TONE = { Scheduled: 'neutral', 'In Transit': 'accent', Arrived: 'good', Delayed: 'warning' }

export default function Linehaul() {
  const { linehaulTrips, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return linehaulTrips.filter((t) => {
      if (status !== 'All' && t.status !== status) return false
      if (!q) return true
      return t.originHub.toLowerCase().includes(q) || t.destHub.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    })
  }, [linehaulTrips, search, status])

  const stats = useMemo(() => {
    const total = linehaulTrips.length
    const delayed = linehaulTrips.filter((t) => t.status === 'Delayed').length
    const inTransit = linehaulTrips.filter((t) => t.status === 'In Transit').length
    const avgLoad = total ? Math.round(linehaulTrips.reduce((s, t) => s + t.loadFactorPct, 0) / total) : 0
    return { total, delayed, inTransit, avgLoad }
  }, [linehaulTrips])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading linehaul trips…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Linehaul</h1>
          <p className="module-page__subtitle">Hub-to-hub trunk movement — trip status, load factor, and transit delay tracking.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Active trips</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.inTransit}</div>
          <div className="module-page__stat-label">In transit</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.delayed}</div>
          <div className="module-page__stat-label">Delayed</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgLoad}%</div>
          <div className="module-page__stat-label">Avg load factor</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search trip ID or hub…"
          filters={[{ label: 'Status', value: status, onChange: setStatus, options: ['Scheduled', 'In Transit', 'Arrived', 'Delayed'] }]}
          resultCount={filtered.length}
          resultLabel="trips"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          defaultSort={{ key: 'loadFactorPct', dir: 'desc' }}
          emptyLabel="No linehaul trips match these filters."
          columns={[
            { key: 'id', label: 'Trip', sortable: true },
            { key: 'originHub', label: 'Origin', sortable: true },
            { key: 'destHub', label: 'Destination', sortable: true },
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status]} /> },
            { key: 'loadFactorPct', label: 'Load Factor', align: 'right', sortable: true, render: (r) => `${r.loadFactorPct}%` },
            { key: 'etaHours', label: 'ETA', align: 'right', sortable: true, render: (r) => `${r.etaHours}h` },
            { key: 'delayReason', label: 'Delay Reason', render: (r) => r.delayReason ?? '—' },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
