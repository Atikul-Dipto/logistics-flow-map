import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import RiderDrawer from './RiderDrawer'
import { LiveTracking } from '../../icons'
import '../shared.css'

export default function Riders() {
  const location = useLocation()
  const { riders, hubOps, codLedger, loading } = useOps()
  const [search, setSearch] = useState('')
  const [hub, setHub] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const openId = location.state?.openId
    if (openId && riders.length) {
      const found = riders.find((r) => r.id === openId)
      if (found) setSelected(found)
    }
  }, [location.state, riders])

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return riders.filter((r) => {
      if (hub !== 'All' && r.hub !== hub) return false
      if (!q) return true
      return r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    })
  }, [riders, search, hub])

  const stats = useMemo(() => {
    const avgSuccess = riders.length ? riders.reduce((s, r) => s + r.successRate, 0) / riders.length : 0
    const avgRating = riders.length ? riders.reduce((s, r) => s + r.rating, 0) / riders.length : 0
    const codCollectors = codLedger.length
    const flagged = codLedger.filter((c) => c.settlementStatus === 'Under Review').length
    return { total: riders.length, avgSuccess, avgRating, codCollectors, flagged }
  }, [riders, codLedger])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading rider roster…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Riders</h1>
          <p className="module-page__subtitle">Full rider roster with productivity ranking, COD reconciliation, and AI performance callouts.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Active riders</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgSuccess.toFixed(1)}%</div>
          <div className="module-page__stat-label">Avg success rate</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgRating.toFixed(1)} ★</div>
          <div className="module-page__stat-label">Avg rating</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.flagged}</div>
          <div className="module-page__stat-label">COD flagged for review</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search rider name or ID…"
          filters={[{ label: 'Hub', value: hub, onChange: setHub, options: hubNames }]}
          resultCount={filtered.length}
          resultLabel="riders"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'successRate', dir: 'desc' }}
          emptyLabel="No riders match these filters."
          columns={[
            { key: 'id', label: 'ID', sortable: true },
            { key: 'name', label: 'Name', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'successRate', label: 'Success Rate', align: 'right', sortable: true, render: (r) => `${r.successRate}%` },
            { key: 'activeShipments', label: 'Active Shipments', align: 'right', sortable: true },
            { key: 'rating', label: 'Rating', align: 'right', sortable: true, render: (r) => `${r.rating} ★` },
          ]}
          rows={filtered}
        />
      </div>

      <RiderDrawer open={!!selected} onClose={() => setSelected(null)} rider={selected} hubOps={hubOps} codLedger={codLedger} />
    </div>
  )
}
