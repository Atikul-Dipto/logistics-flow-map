import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import RouteDrawer from './RouteDrawer'
import { LiveTracking } from '../../icons'
import '../shared.css'

const STATUS_TONE = { Planned: 'neutral', 'In Progress': 'accent', Completed: 'good', Delayed: 'warning' }

export default function Routes() {
  const { routes, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [hub, setHub] = useState('All')
  const [selected, setSelected] = useState(null)

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])
  const statuses = useMemo(() => Array.from(new Set(routes.map((r) => r.status))).sort(), [routes])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return routes.filter((r) => {
      if (status !== 'All' && r.status !== status) return false
      if (hub !== 'All' && r.hub !== hub) return false
      if (!q) return true
      return r.id.toLowerCase().includes(q) || r.riderName.toLowerCase().includes(q)
    })
  }, [routes, search, status, hub])

  const stats = useMemo(() => {
    const overloaded = routes.filter((r) => r.loadPct > 100).length
    const aiSuggestions = routes.filter((r) => r.aiNote).length
    const inProgress = routes.filter((r) => r.status === 'In Progress').length
    const avgLoad = routes.length ? Math.round(routes.reduce((s, r) => s + r.loadPct, 0) / routes.length) : 0
    return { total: routes.length, overloaded, aiSuggestions, inProgress, avgLoad }
  }, [routes])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading route network…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Routes</h1>
          <p className="module-page__subtitle">Route planning and AI-recommended rider rebalancing — capacity vs. load across every active trip.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Active routes</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgLoad}%</div>
          <div className="module-page__stat-label">Avg load</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.overloaded}</div>
          <div className="module-page__stat-label">Overloaded (&gt;100%)</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.aiSuggestions}</div>
          <div className="module-page__stat-label">AI rebalance suggestions</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search route ID or rider…"
          filters={[
            { label: 'Status', value: status, onChange: setStatus, options: statuses },
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
          ]}
          resultCount={filtered.length}
          resultLabel="routes"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'loadPct', dir: 'desc' }}
          emptyLabel="No routes match these filters."
          columns={[
            { key: 'id', label: 'Route', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'riderName', label: 'Rider', sortable: true },
            { key: 'stopCount', label: 'Stops', align: 'right', sortable: true, render: (r) => `${r.completedStops}/${r.stopCount}` },
            { key: 'loadPct', label: 'Load', align: 'right', sortable: true, render: (r) => `${r.loadPct}%` },
            { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} /> },
            { key: 'etaMinutes', label: 'ETA', align: 'right', sortable: true, render: (r) => `${r.etaMinutes} min` },
          ]}
          rows={filtered}
        />
      </div>

      <RouteDrawer open={!!selected} onClose={() => setSelected(null)} route={selected} />
    </div>
  )
}
