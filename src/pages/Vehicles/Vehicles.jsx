import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import { LiveTracking } from '../../icons'
import '../shared.css'

const MAINT_TONE = { OK: 'good', 'Due Soon': 'warning', Overdue: 'critical' }

export default function Vehicles() {
  const { vehicles, hubOps, loading } = useOps()
  const [search, setSearch] = useState('')
  const [hub, setHub] = useState('All')
  const [type, setType] = useState('All')

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vehicles.filter((v) => {
      if (hub !== 'All' && v.hub !== hub) return false
      if (type !== 'All' && v.type !== type) return false
      if (!q) return true
      return v.id.toLowerCase().includes(q)
    })
  }, [vehicles, search, hub, type])

  const stats = useMemo(() => {
    const total = vehicles.length
    const avgUtilization = total ? Math.round(vehicles.reduce((s, v) => s + v.utilizationPct, 0) / total) : 0
    const overdue = vehicles.filter((v) => v.maintenanceStatus === 'Overdue').length
    const thirdParty = vehicles.filter((v) => v.ownership === '3PL').length
    return { total, avgUtilization, overdue, thirdParty }
  }, [vehicles])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading fleet…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Vehicles</h1>
          <p className="module-page__subtitle">Fleet roster and utilization across owned and third-party vehicles.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Fleet size</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgUtilization}%</div>
          <div className="module-page__stat-label">Avg utilization</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.overdue}</div>
          <div className="module-page__stat-label">Maintenance overdue</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.thirdParty}</div>
          <div className="module-page__stat-label">3PL vehicles</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicle ID…"
          filters={[
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
            { label: 'Type', value: type, onChange: setType, options: ['Motorbike', 'Van', 'Mini Truck'] },
          ]}
          resultCount={filtered.length}
          resultLabel="vehicles"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          defaultSort={{ key: 'utilizationPct', dir: 'desc' }}
          emptyLabel="No vehicles match these filters."
          columns={[
            { key: 'id', label: 'Vehicle', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'ownership', label: 'Ownership', sortable: true },
            { key: 'utilizationPct', label: 'Utilization', align: 'right', sortable: true, render: (r) => `${r.utilizationPct}%` },
            { key: 'assignedLoadKg', label: 'Load / Capacity', align: 'right', sortable: true, render: (r) => `${r.assignedLoadKg} / ${r.capacityKg} kg` },
            { key: 'maintenanceStatus', label: 'Maintenance', sortable: true, render: (r) => <StatusPill label={r.maintenanceStatus} tone={MAINT_TONE[r.maintenanceStatus]} /> },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
