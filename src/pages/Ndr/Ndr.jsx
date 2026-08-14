import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import { useToast } from '../../hooks/useToast'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './Ndr.css'

function probabilityTone(pct) {
  if (pct >= 65) return 'good'
  if (pct >= 45) return 'warning'
  return 'critical'
}

export default function Ndr() {
  const { ndrRecords, hubOps, loading } = useOps()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [hub, setHub] = useState('All')
  const [reason, setReason] = useState('All')

  const hubNames = useMemo(() => hubOps.map((h) => h.hub), [hubOps])
  const reasons = useMemo(() => Array.from(new Set(ndrRecords.map((n) => n.reason))).sort(), [ndrRecords])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ndrRecords.filter((n) => {
      if (hub !== 'All' && n.hub !== hub) return false
      if (reason !== 'All' && n.reason !== reason) return false
      if (!q) return true
      return n.id.toLowerCase().includes(q) || n.seller.toLowerCase().includes(q) || n.customer.toLowerCase().includes(q)
    })
  }, [ndrRecords, search, hub, reason])

  const stats = useMemo(() => {
    const total = ndrRecords.length
    const avgProbability = total ? Math.round(ndrRecords.reduce((s, n) => s + n.aiSuccessProbability, 0) / total) : 0
    const highRisk = ndrRecords.filter((n) => n.attempts >= 2).length
    const codAtRisk = ndrRecords.reduce((s, n) => s + n.codAmount, 0)
    return { total, avgProbability, highRisk, codAtRisk }
  }, [ndrRecords])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading NDR queue…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>NDR</h1>
          <p className="module-page__subtitle">A dedicated failed-delivery command center with AI root-cause analysis and reattempt-success scoring.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Open NDRs</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgProbability}%</div>
          <div className="module-page__stat-label">Avg 2nd-attempt success probability</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.highRisk}</div>
          <div className="module-page__stat-label">2+ failed attempts</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.codAtRisk)}</div>
          <div className="module-page__stat-label">COD value at risk</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shipment, seller, customer…"
          filters={[
            { label: 'Hub', value: hub, onChange: setHub, options: hubNames },
            { label: 'Reason', value: reason, onChange: setReason, options: reasons },
          ]}
          resultCount={filtered.length}
          resultLabel="NDRs"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          defaultSort={{ key: 'attempts', dir: 'desc' }}
          emptyLabel="No NDRs match these filters."
          columns={[
            { key: 'id', label: 'Shipment', sortable: true },
            { key: 'seller', label: 'Seller', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'reason', label: 'Reason', sortable: true },
            { key: 'attempts', label: 'Attempts', align: 'right', sortable: true },
            {
              key: 'aiSuccessProbability',
              label: 'AI 2nd-Attempt Odds',
              align: 'right',
              sortable: true,
              render: (r) => <StatusPill label={`${r.aiSuccessProbability}%`} tone={probabilityTone(r.aiSuccessProbability)} />,
            },
            { key: 'codAmount', label: 'COD', align: 'right', sortable: true, render: (r) => formatBdt(r.codAmount) },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <div className="ndr__actions">
                  <button type="button" onClick={() => toast(`Reattempt scheduled for ${r.id}.`)}>
                    Reschedule
                  </button>
                  <button type="button" onClick={() => toast(`${r.id} escalated to ${r.hub}.`)}>
                    Escalate
                  </button>
                </div>
              ),
            },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
