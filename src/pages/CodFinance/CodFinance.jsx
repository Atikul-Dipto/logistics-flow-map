import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import StatusPill from '../../components/StatusPill'
import { formatBdt } from '../../lib/format'
import { LiveTracking } from '../../icons'
import '../shared.css'
import './CodFinance.css'

const SETTLEMENT_TONE = { Settled: 'good', Pending: 'warning', 'Under Review': 'critical' }

export default function CodFinance() {
  const { codLedger, mockShipments, opsData, loading } = useOps()
  const [search, setSearch] = useState('')
  const [settlement, setSettlement] = useState('All')

  const settlements = useMemo(() => Array.from(new Set(codLedger.map((c) => c.settlementStatus))).sort(), [codLedger])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return codLedger.filter((c) => {
      if (settlement !== 'All' && c.settlementStatus !== settlement) return false
      if (!q) return true
      return c.riderName.toLowerCase().includes(q) || c.riderId.toLowerCase().includes(q) || c.hub.toLowerCase().includes(q)
    })
  }, [codLedger, search, settlement])

  const stats = useMemo(() => {
    const outstanding = mockShipments.filter((s) => s.status !== 'Delivered').reduce((s, x) => s + x.codAmount, 0)
    const collected = codLedger.reduce((s, c) => s + c.collected, 0)
    const flagged = codLedger.filter((c) => c.settlementStatus === 'Under Review').length
    const totalDiscrepancy = codLedger.reduce((s, c) => s + c.discrepancy, 0)
    return { outstanding, collected, flagged, totalDiscrepancy }
  }, [mockShipments, codLedger])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading COD ledger…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>COD &amp; Finance</h1>
          <p className="module-page__subtitle">A financial control center for cash-on-delivery — collection, settlement, and anomaly detection.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.outstanding)}</div>
          <div className="module-page__stat-label">COD outstanding</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.collected)}</div>
          <div className="module-page__stat-label">Collected today</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{formatBdt(stats.totalDiscrepancy)}</div>
          <div className="module-page__stat-label">Total discrepancy</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.flagged}</div>
          <div className="module-page__stat-label">Riders under review</div>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Carrier COD — network totals</div>
        <p className="module-page__panel-caption">Real per-carrier COD value from the historical shipments dataset, not simulated.</p>
        <DataTable
          keyField="carrier"
          defaultSort={{ key: 'cod_value', dir: 'desc' }}
          columns={[
            { key: 'carrier', label: 'Carrier', sortable: true },
            { key: 'shipment_count', label: 'Shipments', align: 'right', sortable: true, render: (r) => r.shipment_count.toLocaleString() },
            { key: 'on_time_rate', label: 'On-Time', align: 'right', sortable: true, render: (r) => `${Math.round(r.on_time_rate * 100)}%` },
            { key: 'cod_value', label: 'COD Value', align: 'right', sortable: true, render: (r) => formatBdt(r.cod_value) },
          ]}
          rows={opsData.carrier_stats}
        />
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Rider cash reconciliation — today</div>
        <p className="module-page__panel-caption">Expected vs. collected COD per rider, with anomalies flagged for review.</p>
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search rider or hub…"
          filters={[{ label: 'Settlement', value: settlement, onChange: setSettlement, options: settlements }]}
          resultCount={filtered.length}
          resultLabel="riders"
        />
        <DataTable
          pageSize={25}
          keyField="riderId"
          defaultSort={{ key: 'discrepancyPct', dir: 'desc' }}
          emptyLabel="No rider COD records match these filters."
          columns={[
            { key: 'riderId', label: 'Rider', sortable: true },
            { key: 'riderName', label: 'Name', sortable: true },
            { key: 'hub', label: 'Hub', sortable: true },
            { key: 'shipmentCount', label: 'Delivered', align: 'right', sortable: true },
            { key: 'expected', label: 'Expected', align: 'right', sortable: true, render: (r) => formatBdt(r.expected) },
            { key: 'collected', label: 'Collected', align: 'right', sortable: true, render: (r) => formatBdt(r.collected) },
            { key: 'discrepancyPct', label: 'Discrepancy', align: 'right', sortable: true, render: (r) => `${r.discrepancyPct}%` },
            { key: 'settlementStatus', label: 'Status', sortable: true, render: (r) => <StatusPill label={r.settlementStatus} tone={SETTLEMENT_TONE[r.settlementStatus]} /> },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  )
}
