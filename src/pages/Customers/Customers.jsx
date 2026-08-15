import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useOps } from '../../context/OpsDataContext'
import DataTable from '../../components/DataTable'
import Toolbar from '../../components/Toolbar'
import CustomerDrawer from './CustomerDrawer'
import { LiveTracking } from '../../icons'
import '../shared.css'

export default function Customers() {
  const location = useLocation()
  const { customerProfiles, loading } = useOps()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const openId = location.state?.openId
    if (openId && customerProfiles.length) {
      const found = customerProfiles.find((c) => c.id === openId)
      if (found) setSelected(found)
    }
  }, [location.state, customerProfiles])

  const cities = useMemo(() => Array.from(new Set(customerProfiles.map((c) => c.city))).sort(), [customerProfiles])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customerProfiles.filter((c) => {
      if (city !== 'All' && c.city !== city) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q)
    })
  }, [customerProfiles, search, city])

  const stats = useMemo(() => {
    const total = customerProfiles.length
    const avgAddressQuality = total ? Math.round(customerProfiles.reduce((s, c) => s + c.addressQuality, 0) / total) : 0
    const avgContact = total ? Math.round(customerProfiles.reduce((s, c) => s + c.contactSuccessRate, 0) / total) : 0
    const lowQuality = customerProfiles.filter((c) => c.addressQuality < 60).length
    return { total, avgAddressQuality, avgContact, lowQuality }
  }, [customerProfiles])

  if (loading) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading customer profiles…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Customers</h1>
          <p className="module-page__subtitle">Customer-side delivery experience — address quality, contactability, and delivery history.</p>
        </div>
      </div>

      <div className="module-page__stats">
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.total.toLocaleString()}</div>
          <div className="module-page__stat-label">Customers today</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgAddressQuality}%</div>
          <div className="module-page__stat-label">Avg address quality</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.avgContact}%</div>
          <div className="module-page__stat-label">Avg contact success</div>
        </div>
        <div className="module-page__stat">
          <div className="module-page__stat-value">{stats.lowQuality}</div>
          <div className="module-page__stat-label">Low address-quality flags</div>
        </div>
      </div>

      <div className="module-page__panel">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search customer name…"
          filters={[{ label: 'City', value: city, onChange: setCity, options: cities }]}
          resultCount={filtered.length}
          resultLabel="customers"
        />
        <DataTable
          pageSize={25}
          keyField="id"
          onRowClick={setSelected}
          defaultSort={{ key: 'deliveryHistory', dir: 'desc' }}
          emptyLabel="No customers match these filters."
          columns={[
            { key: 'name', label: 'Customer', sortable: true },
            { key: 'city', label: 'City', sortable: true },
            { key: 'deliveryHistory', label: 'Shipments', align: 'right', sortable: true },
            { key: 'deliveredCount', label: 'Delivered', align: 'right', sortable: true },
            { key: 'addressQuality', label: 'Address Quality', align: 'right', sortable: true, render: (r) => `${r.addressQuality}%` },
            { key: 'contactSuccessRate', label: 'Contact Success', align: 'right', sortable: true, render: (r) => `${r.contactSuccessRate}%` },
          ]}
          rows={filtered}
        />
      </div>

      <CustomerDrawer open={!!selected} onClose={() => setSelected(null)} customer={selected} />
    </div>
  )
}
