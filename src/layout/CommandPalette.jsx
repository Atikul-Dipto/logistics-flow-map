import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navItems } from '../routes/navConfig'
import { useOps } from '../context/OpsDataContext'
import { useToast } from '../hooks/useToast'
import { searchCorpus } from '../lib/search'
import { SELLERS } from '../data/sellerNames'
import { Search, Shipments, Orders, Customers, Riders, Sellers, Hub, Warehouse } from '../icons'
import './CommandPalette.css'

const KIND_ICON = {
  page: null,
  shipment: Shipments,
  order: Orders,
  customer: Customers,
  rider: Riders,
  seller: Sellers,
  hub: Hub,
  warehouse: Warehouse,
}

const KIND_ROUTE = {
  shipment: '/shipments',
  order: '/orders',
  customer: '/customers',
  rider: '/riders',
  seller: '/sellers',
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const toast = useToast()
  const { data, mockShipments, mockOrders, mockCustomers, riders } = useOps()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const corpus = useMemo(() => {
    const entries = navItems.map((n) => ({ kind: 'page', label: n.label, sub: 'Page', path: n.path }))

    for (const n of data?.nodes ?? []) {
      entries.push({ kind: n.type, label: n.label, sub: n.type === 'warehouse' ? 'Fulfillment warehouse' : `Hub · ${n.region}` })
    }
    for (const s of mockShipments) entries.push({ kind: 'shipment', label: s.id, sub: `${s.seller} · ${s.status}`, openId: s.id })
    for (const o of mockOrders) entries.push({ kind: 'order', label: o.id, sub: o.seller })
    for (const c of mockCustomers) entries.push({ kind: 'customer', label: c.name, sub: c.city })
    for (const r of riders) entries.push({ kind: 'rider', label: `${r.name} (${r.id})`, sub: r.hub, openId: r.id })
    for (const s of SELLERS) entries.push({ kind: 'seller', label: s.shop, sub: s.region, openId: s.code })

    return entries
  }, [data, mockShipments, mockOrders, mockCustomers, riders])

  const results = useMemo(() => searchCorpus(corpus, query), [corpus, query])

  const handleSelect = (entry) => {
    if (entry.kind === 'page') {
      navigate(entry.path)
    } else if (entry.kind === 'hub' || entry.kind === 'warehouse') {
      navigate('/', { state: { openHub: entry.label } })
    } else if (entry.kind === 'shipment' || entry.kind === 'rider' || entry.kind === 'seller') {
      navigate(KIND_ROUTE[entry.kind], { state: { openId: entry.openId } })
    } else {
      navigate(KIND_ROUTE[entry.kind] ?? '/')
      toast(`Full ${entry.kind} detail view ships in a later phase — opening the ${entry.kind} module.`)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="palette-root">
      <div className="palette-backdrop" onClick={onClose} />
      <div className="palette-box">
        <div className="palette-input-row">
          <Search className="icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shipments, orders, customers, riders, hubs, pages…"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && results[0]) handleSelect(results[0])
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          {query.trim() === '' && <div className="palette-hint">Type to search the network — shipments, orders, customers, riders, hubs, and every page.</div>}
          {query.trim() !== '' && results.length === 0 && <div className="palette-hint">No matches.</div>}
          {results.map((entry, i) => {
            const Icon = KIND_ICON[entry.kind]
            return (
              <button key={entry.kind + entry.label + i} type="button" className="palette-row" onClick={() => handleSelect(entry)}>
                {Icon && <Icon className="icon" />}
                <div className="palette-row__text">
                  <div className="palette-row__label">{entry.label}</div>
                  {entry.sub && <div className="palette-row__sub">{entry.sub}</div>}
                </div>
                <span className="palette-row__kind">{entry.kind}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
