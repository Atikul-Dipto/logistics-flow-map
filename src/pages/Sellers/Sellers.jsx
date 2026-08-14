import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import SellerDrawer from './SellerDrawer'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'

function healthTone(score) {
  if (score >= 75) return 'good'
  if (score >= 55) return 'warning'
  if (score >= 35) return 'serious'
  return 'critical'
}

export default function Sellers() {
  const location = useLocation()
  const { sellerHealth, loading } = useOps()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const openId = location.state?.openId
    if (openId && sellerHealth.length) {
      const found = sellerHealth.find((s) => s.code === openId)
      if (found) setSelected(found)
    }
  }, [location.state, sellerHealth])

  const regions = useMemo(() => Array.from(new Set(sellerHealth.map((s) => s.region))).sort(), [sellerHealth])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sellerHealth.filter((s) => {
      if (region !== 'All' && s.region !== region) return false
      if (!q) return true
      return s.shop.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    })
  }, [sellerHealth, search, region])

  const stats = useMemo(() => {
    const total = sellerHealth.length
    const avgHealth = total ? Math.round(sellerHealth.reduce((s, x) => s + x.healthScore, 0) / total) : 0
    const atRisk = sellerHealth.filter((s) => s.healthScore < 55).length
    const totalCod = sellerHealth.reduce((s, x) => s + x.codValue, 0)
    return { total, avgHealth, atRisk, totalCod }
  }, [sellerHealth])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading seller network…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Sellers</h1>
          <p className="module-page__subtitle">A logistics health score per seller — delivery success, NDR rate, and returns in one view.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Sellers scored today</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgHealth} / 100</div>
          <div className="module-page__stat-label">Avg health score</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.atRisk}</div>
          <div className="module-page__stat-label">Sellers at risk</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.totalCod)}</div>
          <div className="module-page__stat-label">Total COD value</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search seller name or code…"
          filters={[{ label: 'Region', value: region, onChange: setRegion, options: regions }]}
          resultCount={filtered.length}
          resultLabel="sellers"
        />
        <DataTable
          pageSize={25}
          keyField="code"
          onRowClick={setSelected}
          defaultSort={{ key: 'healthScore', dir: 'desc' }}
          emptyLabel="No sellers match these filters. (Sellers with fewer than 3 shipments today aren't scored.)"
          columns={[
            { key: 'shop', label: 'Seller', sortable: true },
            { key: 'region', label: 'Region', sortable: true },
            { key: 'shipmentCount', label: 'Shipments', align: 'right', sortable: true },
            { key: 'deliveredRate', label: 'Delivered', align: 'right', sortable: true, render: (r) => `${Math.round(r.deliveredRate * 100)}%` },
            { key: 'ndrRate', label: 'NDR Rate', align: 'right', sortable: true, render: (r) => `${Math.round(r.ndrRate * 100)}%` },
            { key: 'returnRate', label: 'Return Rate', align: 'right', sortable: true, render: (r) => `${Math.round(r.returnRate * 100)}%` },
            { key: 'healthScore', label: 'Health', align: 'right', sortable: true, render: (r) => <StatusPill label={`${r.healthScore}`} tone={healthTone(r.healthScore)} /> },
          ]}
          rows={filtered}
        />
      </div>

      <SellerDrawer open={!!selected} onClose={() => setSelected(null)} seller={selected} />
    </div>
  )
}
