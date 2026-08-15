import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import { LiveTracking } from '../../icons'
import '../shared.css'

export default function Sortation() {
  const { sortationShifts, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [shift, setShift] = useState('All')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sortationShifts.filter((s) => {
      if (shift !== 'All' && s.shift !== shift) return false
      if (!q) return true
      return s.hub.toLowerCase().includes(q)
    })
  }, [sortationShifts, search, shift])

  const stats = useMemo(() => {
    const totalThroughput = sortationShifts.reduce((s, x) => s + x.throughput, 0)
    const totalPending = sortationShifts.reduce((s, x) => s + x.pendingAging, 0)
    const avgMisroute = sortationShifts.length ? sortationShifts.reduce((s, x) => s + x.misroutePct, 0) / sortationShifts.length : 0
    return { totalThroughput, totalPending, avgMisroute, hubCount: hubOps.length }
  }, [sortationShifts, hubOps])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading sortation data…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Sortation</h1>
          <p className="module-page__subtitle">Inbound sort-center throughput and pending-sort aging, per hub.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.totalThroughput.toLocaleString()}</div>
          <div className="module-page__stat-label">Total sorted today</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.totalPending.toLocaleString()}</div>
          <div className="module-page__stat-label">Pending sort (aging)</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgMisroute.toFixed(1)}%</div>
          <div className="module-page__stat-label">Avg misroute rate</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.hubCount}</div>
          <div className="module-page__stat-label">Sort centers</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search hub…"
          filters={[{ label: 'Shift', value: shift, onChange: setShift, options: ['Morning', 'Afternoon', 'Night'] }]}
          resultCount={filtered.length}
          resultLabel="shift rows"
        />
        <DataTable
          keyField="id"
          defaultSort={{ key: 'throughput', dir: 'desc' }}
          emptyLabel="No sortation data matches these filters."
          columns={[
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'shift', label: 'Shift', sortable: true },
            { key: 'throughput', label: 'Throughput', align: 'right', sortable: true, render: (r) => r.throughput.toLocaleString() },
            { key: 'pendingAging', label: 'Pending (Aging)', align: 'right', sortable: true },
            { key: 'misroutePct', label: 'Misroute Rate', align: 'right', sortable: true, render: (r) => `${r.misroutePct}%` },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
