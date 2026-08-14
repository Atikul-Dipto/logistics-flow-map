import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import HubPanel from '../CommandCenter/HubPanel'
import { LiveTracking } from '../../icons'
import '../shared.css'

const SEVERITY_LABEL = { good: 'Healthy', warning: 'At Risk', serious: 'Serious', critical: 'Critical' }

export default function Hubs() {
  const { hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return hubOps
    return hubOps.filter((h) => h.hub.toLowerCase().includes(q) || h.region.toLowerCase().includes(q))
  }, [hubOps, search])

  const stats = useMemo(() => {
    const critical = hubOps.filter((h) => h.severity === 'critical').length
    const avgHealth = hubOps.length ? Math.round(hubOps.reduce((s, h) => s + h.health.score, 0) / hubOps.length) : 0
    const totalPendingSort = hubOps.reduce((s, h) => s + h.pendingSort, 0)
    const totalRiders = hubOps.reduce((s, h) => s + h.activeRiders, 0)
    return { critical, avgHealth, totalPendingSort, totalRiders }
  }, [hubOps])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading hub network…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Hubs</h1>
          <p className="module-page__subtitle">Full hub operations — capacity, staffing, and a network-wide health-score leaderboard.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{hubOps.length}</div>
          <div className="module-page__stat-label">Hubs in network</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgHealth} / 100</div>
          <div className="module-page__stat-label">Avg health score</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.critical}</div>
          <div className="module-page__stat-label">Hubs critical</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.totalPendingSort.toLocaleString()}</div>
          <div className="module-page__stat-label">Aging shipments (pending sort)</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.totalRiders.toLocaleString()}</div>
          <div className="module-page__stat-label">Active riders network-wide</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search hub or region…" resultCount={filtered.length} resultLabel="hubs" />
        <DataTable
          keyField="hub"
          onRowClick={setSelected}
          defaultSort={{ key: 'healthScore', dir: 'desc' }}
          emptyLabel="No hubs match this search."
          columns={[
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'region', label: 'Region', sortable: true },
            { key: 'healthScore', label: 'Health', sortable: true, render: (r) => `${r.healthScore} / 100` },
            { key: 'severity', label: 'Status', sortable: true, render: (r) => <StatusPill label={SEVERITY_LABEL[r.severity]} tone={r.severity} /> },
            { key: 'capacityPct', label: 'Capacity', align: 'right', sortable: true, render: (r) => `${r.capacityPct}%` },
            { key: 'slaRiskCount', label: 'SLA Risk', align: 'right', sortable: true, render: (r) => r.slaRiskCount.toLocaleString() },
            { key: 'activeRiders', label: 'Active Riders', align: 'right', sortable: true },
            { key: 'avgProcessingMinutes', label: 'Avg Processing', align: 'right', sortable: true, render: (r) => `${r.avgProcessingMinutes} min` },
          ]}
          rows={filtered.map((h) => ({ ...h, healthScore: h.health.score }))}
        />
      </div>

      <HubPanel open={!!selected} onClose={() => setSelected(null)} hub={selected ? hubOps.find((h) => h.hub === selected.hub) : null} />
    </div>
  )
}
