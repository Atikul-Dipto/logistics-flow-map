// Client-side synthetic layer: generates everything a static
// historical CSV can't structurally hold (live-feeling ops
// snapshots, sparkline history, exceptions, a rider roster, a
// searchable mock corpus). Every generator derives its numbers from
// the REAL aggregates in ops_data.json rather than pure randomness --
// only entities with no real-data source (customers, rider identity)
// are fully invented. Fixed seed throughout: determinism matters for
// a portfolio demo people screenshot and revisit.
import { mulberry32 } from '../lib/rng'
import { SELLERS } from './sellerNames'

const OPS_SEED = 424242

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function classifySeverity(capacityPct, onTimeRate) {
  if (capacityPct >= 90 || onTimeRate < 0.68) return 'critical'
  if (capacityPct >= 80 || onTimeRate < 0.76) return 'serious'
  if (capacityPct >= 68 || onTimeRate < 0.84) return 'warning'
  return 'good'
}

// ---------- hub operational snapshot ----------
export function generateHubOps(opsData) {
  const rng = mulberry32(OPS_SEED)
  const maxVolume = Math.max(...opsData.hub_stats.map((h) => h.shipment_count))

  return opsData.hub_stats.map((h) => {
    const loadRatio = h.shipment_count / maxVolume
    const capacityPct = clamp(
      Math.round(45 + loadRatio * 40 + (1 - h.on_time_rate) * 55 + (rng() - 0.5) * 10),
      32,
      99,
    )
    const inbound = Math.round(h.shipment_count * (0.16 + rng() * 0.05))
    const outbound = Math.round(h.shipment_count * (0.3 + rng() * 0.07))
    const pendingSort = Math.round(inbound * (0.12 + (1 - h.on_time_rate) * 0.55 + rng() * 0.1))
    const slaRiskCount = Math.round(h.shipment_count * (1 - h.on_time_rate) * (0.35 + rng() * 0.25))
    const activeRiders = Math.max(6, Math.round(outbound / (20 + rng() * 10)))
    const avgProcessingMinutes = Math.round(11 + (1 - h.on_time_rate) * 38 + capacityPct * 0.14 + rng() * 5)

    const topDelayEntry = Object.entries(h.delay_reason_mix || {}).sort((a, b) => b[1] - a[1])[0]

    const capacityScore = clamp(Math.round(100 - Math.max(0, capacityPct - 58) * 1.3), 0, 100)
    const processingScore = clamp(Math.round(100 - Math.max(0, avgProcessingMinutes - 15) * 1.6), 0, 100)
    const slaScore = clamp(Math.round(h.on_time_rate * 100), 0, 100)
    const staffingScore = clamp(Math.round(72 + rng() * 24), 0, 100)
    const networkScore = clamp(Math.round(72 + rng() * 24), 0, 100)
    const healthScore = Math.round((capacityScore + processingScore + slaScore + staffingScore + networkScore) / 5)

    return {
      hub: h.hub,
      region: h.region,
      shipmentCount: h.shipment_count,
      onTimeRate: h.on_time_rate,
      capacityPct,
      inbound,
      outbound,
      pendingSort,
      slaRiskCount,
      activeRiders,
      avgProcessingMinutes,
      topDelayReason: topDelayEntry ? topDelayEntry[0] : null,
      severity: classifySeverity(capacityPct, h.on_time_rate),
      health: {
        score: healthScore,
        capacity: capacityScore,
        processing: processingScore,
        sla: slaScore,
        staffing: staffingScore,
        network: networkScore,
      },
    }
  })
}

// ---------- 14-day KPI history (sparkline source) ----------
export function generateKpiSeries(opsData, hubOps) {
  const rng = mulberry32(OPS_SEED + 1)
  const days = 14
  const spanDays = Math.max(
    1,
    Math.round((new Date(opsData.date_bounds.max_order_date) - new Date(opsData.date_bounds.min_order_date)) / 86400000),
  )
  const avgDaily = Math.max(20, Math.round(opsData.total_shipments / spanDays))
  const networkOnTime = opsData.hub_stats.reduce((s, h) => s + h.on_time_rate * h.shipment_count, 0) / opsData.total_shipments

  const volume = []
  for (let i = 0; i < days; i++) {
    const weekday = i % 7
    const weekendDip = weekday === 5 || weekday === 6 ? 0.83 : 1
    volume.push(Math.round(avgDaily * weekendDip * (0.88 + rng() * 0.24)))
  }

  const todaySlaRisk = hubOps.reduce((s, h) => s + h.slaRiskCount, 0)
  const todayCod = Math.round(opsData.total_order_value * 0.0009 * (0.9 + rng() * 0.2))

  const derive = (ratioFn) => volume.map((v, i) => Math.max(0, Math.round(ratioFn(v, i))))

  // scales a shaped-but-arbitrarily-anchored series so its last point
  // equals the real total exactly, keeping the day-to-day shape
  const rescaleToToday = (series, todayValue) => {
    const last = series[series.length - 1] || 1
    const factor = todayValue / last
    return series.map((v, i) => (i === series.length - 1 ? todayValue : Math.round(v * factor)))
  }

  return {
    shipmentsToday: volume,
    inTransit: derive((v) => v * (0.21 + rng() * 0.03)),
    atHub: derive((v) => v * (0.13 + rng() * 0.03)),
    outForDelivery: derive((v) => v * (0.09 + rng() * 0.02)),
    delivered: derive((v) => v * networkOnTime),
    failedDelivery: derive((v) => v * (1 - networkOnTime) * 0.4),
    // These two are network-wide *current totals* (hundreds of
    // shipments / thousands of BDT), not a smoothed daily rate like
    // the others -- naively overwriting only the last point creates
    // a huge scale jump against a differently-scaled history. Shape
    // the history with the same jitter, then rescale the whole
    // series so it lands exactly on the real total on the last day.
    slaRisk: rescaleToToday(
      derive((v) => v * (1 - networkOnTime) * 0.85),
      todaySlaRisk,
    ),
    codOutstanding: rescaleToToday(
      derive((v) => (v / avgDaily) * todayCod),
      todayCod,
    ),
  }
}

// ---------- exception / AI-recommendation cards ----------
export function generateExceptions(opsData, hubOps) {
  const rng = mulberry32(OPS_SEED + 2)
  const cards = []

  const risky = [...hubOps].filter((h) => h.severity === 'critical' || h.severity === 'serious').sort((a, b) => b.slaRiskCount - a.slaRiskCount)
  for (const h of risky.slice(0, 5)) {
    cards.push({
      id: `hub-${h.hub}`,
      severity: h.severity,
      hub: h.hub,
      headline: `${h.hub} at ${h.capacityPct}% capacity — ${h.slaRiskCount.toLocaleString()} shipments at SLA risk`,
      cause: h.topDelayReason ? `Primary cause: ${h.topDelayReason}, avg processing ${h.avgProcessingMinutes} min (vs ~18 min network avg)` : `Avg processing ${h.avgProcessingMinutes} min`,
      actions: ['Reassign carrier', 'Escalate to hub'],
    })
  }

  const topDelay = opsData.network_delay_reasons.breakdown[0]
  if (topDelay) {
    cards.push({
      id: 'network-delay',
      severity: 'warning',
      hub: null,
      headline: `${Math.round(topDelay.pct * 100)}% of today's delays are due to ${topDelay.reason.toLowerCase()}`,
      cause: `${topDelay.count.toLocaleString()} shipments network-wide affected by this single cause`,
      actions: ['View shipments', 'Notify customers'],
    })
  }

  const worstCarrier = [...opsData.carrier_stats].sort((a, b) => a.on_time_rate - b.on_time_rate)[0]
  const bestCarrier = [...opsData.carrier_stats].sort((a, b) => b.on_time_rate - a.on_time_rate)[0]
  if (worstCarrier && bestCarrier && worstCarrier.carrier !== bestCarrier.carrier) {
    const gap = Math.round((bestCarrier.on_time_rate - worstCarrier.on_time_rate) * 100)
    cards.push({
      id: 'carrier-underperform',
      severity: gap > 12 ? 'serious' : 'warning',
      hub: null,
      headline: `${worstCarrier.carrier} on-time rate ${Math.round(worstCarrier.on_time_rate * 100)}% — ${gap} points below ${bestCarrier.carrier}`,
      cause: `${worstCarrier.shipment_count.toLocaleString()} shipments on this carrier network-wide this period`,
      actions: ['View carrier', 'Rebalance volume'],
    })
  }

  // simulated COD cash-discrepancy anomaly (no real COD ledger exists
  // in the source dataset, so this one card is explicitly illustrative)
  const riderNum = 1000 + Math.floor(rng() * 9000)
  const discrepancyPct = (2.4 + rng() * 2.2).toFixed(1)
  cards.push({
    id: 'cod-anomaly',
    severity: Number(discrepancyPct) > 3.5 ? 'serious' : 'warning',
    hub: null,
    headline: `Rider R-${riderNum} has a ${discrepancyPct}% cash discrepancy rate vs 0.8% network average`,
    cause: 'Simulated example — no live COD ledger is connected in this demo',
    actions: ['Flag for review'],
  })

  return cards.sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
}

function severityRank(sev) {
  return { critical: 3, serious: 2, warning: 1, good: 0 }[sev] ?? 0
}

// ---------- rider roster ----------
const RIDER_FIRST = ['Rahim', 'Karim', 'Hasan', 'Rakib', 'Shakil', 'Nayeem', 'Tanvir', 'Imran', 'Saiful', 'Mahmud', 'Arif', 'Jahid', 'Rezaul', 'Shahin', 'Foysal', 'Ashraf']
const RIDER_LAST = ['Islam', 'Rahman', 'Hossain', 'Ahmed', 'Khan', 'Chowdhury', 'Sarkar', 'Talukder', 'Bhuiyan', 'Uddin']

export function generateRiderRoster(hubOps) {
  const rng = mulberry32(OPS_SEED + 3)
  const riders = []
  let seq = 2000
  for (const h of hubOps) {
    for (let i = 0; i < h.activeRiders; i++) {
      seq += 1
      const successRate = clamp(h.onTimeRate * 100 + (rng() - 0.5) * 14, 55, 99.5)
      riders.push({
        id: `R-${seq}`,
        name: `${RIDER_FIRST[Math.floor(rng() * RIDER_FIRST.length)]} ${RIDER_LAST[Math.floor(rng() * RIDER_LAST.length)]}`,
        hub: h.hub,
        region: h.region,
        successRate: Math.round(successRate * 10) / 10,
        activeShipments: Math.round(rng() * 12),
        rating: Math.round((3.6 + rng() * 1.4) * 10) / 10,
        kind: 'rider',
      })
    }
  }
  return riders
}

// ---------- mock search corpus (command palette) ----------
const STATUSES = ['In Transit', 'At Hub', 'Out for Delivery', 'Delivered', 'Delayed', 'Failed Delivery', 'Returned']
const CUSTOMER_FIRST = ['Nasrin', 'Farhana', 'Sultana', 'Shirin', 'Nusrat', 'Tania', 'Rima', 'Momotaz', 'Rina', 'Ayesha', 'Fatema', 'Salma', 'Jesmin', 'Kamal', 'Jamal', 'Habib']
const CUSTOMER_LAST = ['Islam', 'Rahman', 'Hossain', 'Ahmed', 'Khan', 'Akter', 'Begum', 'Molla', 'Mia', 'Uddin']

export function generateMockShipments(opsData, count = 1200) {
  const rng = mulberry32(OPS_SEED + 4)
  const hubs = opsData.hub_stats.map((h) => h.hub)
  const out = []
  for (let i = 0; i < count; i++) {
    const seller = SELLERS[Math.floor(rng() * SELLERS.length)]
    out.push({
      id: `SHP${200000 + i}`,
      orderId: `ORD${200000 + i}`,
      seller: seller.shop,
      hub: hubs[Math.floor(rng() * hubs.length)],
      status: STATUSES[Math.floor(rng() * STATUSES.length)],
      codAmount: Math.round(300 + rng() * 4200),
      kind: 'shipment',
    })
  }
  return out
}

export function generateMockOrders(count = 300) {
  const rng = mulberry32(OPS_SEED + 5)
  const out = []
  for (let i = 0; i < count; i++) {
    const seller = SELLERS[Math.floor(rng() * SELLERS.length)]
    out.push({
      id: `ORD${300000 + i}`,
      seller: seller.shop,
      itemCount: 1 + Math.floor(rng() * 4),
      value: Math.round(400 + rng() * 6000),
      kind: 'order',
    })
  }
  return out
}

export function generateMockCustomers(count = 150) {
  const rng = mulberry32(OPS_SEED + 6)
  const cities = ['Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur', 'Barisal', 'Cumilla']
  const out = []
  for (let i = 0; i < count; i++) {
    out.push({
      id: `CUS${400000 + i}`,
      name: `${CUSTOMER_FIRST[Math.floor(rng() * CUSTOMER_FIRST.length)]} ${CUSTOMER_LAST[Math.floor(rng() * CUSTOMER_LAST.length)]}`,
      city: cities[Math.floor(rng() * cities.length)],
      kind: 'customer',
    })
  }
  return out
}
