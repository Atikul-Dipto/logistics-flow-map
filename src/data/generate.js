// Client-side synthetic layer: generates everything a static
// historical CSV can't structurally hold (live-feeling ops
// snapshots, sparkline history, exceptions, a rider roster, and full
// per-module datasets for Shipments/Hubs/Riders/Routes/NDR/Returns/
// COD/Sellers/Analytics/AI). Every generator derives its numbers from
// the REAL aggregates in ops_data.json rather than pure randomness --
// only entities with no real-data source (customer identity, exact
// rider names) are fully invented. Fixed seed throughout: determinism
// matters for a portfolio demo people screenshot and revisit.
import { mulberry32 } from '../lib/rng'
import { SELLERS } from './sellerNames'

const OPS_SEED = 424242

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function pickWeighted(rng, pairs) {
  const total = pairs.reduce((s, p) => s + Math.max(0, p[1]), 0)
  if (total <= 0) return pairs[0]?.[0]
  let r = rng() * total
  for (const [item, w] of pairs) {
    r -= Math.max(0, w)
    if (r <= 0) return item
  }
  return pairs[pairs.length - 1][0]
}

function classifySeverity(capacityPct, onTimeRate) {
  if (capacityPct >= 90 || onTimeRate < 0.68) return 'critical'
  if (capacityPct >= 80 || onTimeRate < 0.76) return 'serious'
  if (capacityPct >= 68 || onTimeRate < 0.84) return 'warning'
  return 'good'
}

const CITIES = ['Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur', 'Barisal', 'Cumilla']
const RIDER_FIRST = ['Rahim', 'Karim', 'Hasan', 'Rakib', 'Shakil', 'Nayeem', 'Tanvir', 'Imran', 'Saiful', 'Mahmud', 'Arif', 'Jahid', 'Rezaul', 'Shahin', 'Foysal', 'Ashraf']
const RIDER_LAST = ['Islam', 'Rahman', 'Hossain', 'Ahmed', 'Khan', 'Chowdhury', 'Sarkar', 'Talukder', 'Bhuiyan', 'Uddin']
const CUSTOMER_FIRST = ['Nasrin', 'Farhana', 'Sultana', 'Shirin', 'Nusrat', 'Tania', 'Rima', 'Momotaz', 'Rina', 'Ayesha', 'Fatema', 'Salma', 'Jesmin', 'Kamal', 'Jamal', 'Habib']
const CUSTOMER_LAST = ['Islam', 'Rahman', 'Hossain', 'Ahmed', 'Khan', 'Akter', 'Begum', 'Molla', 'Mia', 'Uddin']

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

// ---------- full shipment records (Shipments module + digital twin) ----------
const STAGE_ORDER = ['Order Placed', 'Picked Up', 'At Hub', 'In Transit', 'Out for Delivery', 'Delivered']
const LAST_STAGE_INDEX = { 'At Hub': 2, 'In Transit': 3, 'Out for Delivery': 4, Delivered: 5, Delayed: 3, 'Failed Delivery': 4 }

function statusWeightsForHub(onTimeRate) {
  const stress = clamp((0.8 - onTimeRate) * 3, 0, 1) // 0 = healthy hub, 1 = stressed hub
  return [
    ['Delivered', 68 - stress * 18],
    ['In Transit', 11],
    ['At Hub', 7],
    ['Out for Delivery', 5],
    ['Delayed', 5 + stress * 10],
    ['Failed Delivery', 4 + stress * 8],
  ]
}

function weightedDelayReason(rng, opsData) {
  return pickWeighted(rng, opsData.network_delay_reasons.breakdown.map((b) => [b.reason, b.count]))
}

function buildTimeline(rng, status, createdAt, delayReason, attempts) {
  const lastIndex = LAST_STAGE_INDEX[status] ?? 3
  const events = []
  let cursor = new Date(createdAt)
  for (let i = 0; i <= lastIndex; i++) {
    if (i > 0) cursor = new Date(cursor.getTime() + (2 + rng() * 7) * 3600 * 1000)
    events.push({ stage: STAGE_ORDER[i], at: cursor.toISOString() })
  }
  if (status === 'Delayed' && delayReason) {
    events.push({ stage: 'Delay flagged', at: cursor.toISOString(), note: delayReason })
  }
  if (status === 'Failed Delivery' && delayReason) {
    for (let a = 0; a < attempts; a++) {
      cursor = new Date(cursor.getTime() + (3 + rng() * 5) * 3600 * 1000)
      events.push({ stage: `Delivery attempt ${a + 1} failed`, at: cursor.toISOString(), note: delayReason })
    }
  }
  return events
}

export function generateShipments(opsData, hubOps, riders, count = 950) {
  const rng = mulberry32(OPS_SEED + 4)
  const anchor = new Date(`${opsData.date_bounds.max_order_date}T20:00:00`)
  const carrierPairs = opsData.carrier_stats.map((c) => [c.carrier, c.shipment_count])
  const ridersByHub = new Map()
  for (const r of riders) {
    if (!ridersByHub.has(r.hub)) ridersByHub.set(r.hub, [])
    ridersByHub.get(r.hub).push(r)
  }

  const out = []
  for (let i = 0; i < count; i++) {
    const seller = SELLERS[Math.floor(rng() * SELLERS.length)]
    const hub = hubOps[Math.floor(rng() * hubOps.length)]
    const hubRiders = ridersByHub.get(hub.hub) || []
    const rider = hubRiders.length ? hubRiders[Math.floor(rng() * hubRiders.length)] : null
    const status = pickWeighted(rng, statusWeightsForHub(hub.onTimeRate))
    const isActive = status !== 'Delivered'
    const ageHours = isActive ? rng() * 60 : 24 + rng() * 220
    const createdAt = new Date(anchor.getTime() - ageHours * 3600 * 1000)
    const needsReason = status === 'Delayed' || status === 'Failed Delivery'
    const delayReason = needsReason ? hub.topDelayReason ?? weightedDelayReason(rng, opsData) : null
    const attempts = status === 'Failed Delivery' ? 1 + Math.floor(rng() * 2) : 0
    const codAmount = Math.round(300 + rng() * 4200)
    const orderValue = Math.round(codAmount * (1.05 + rng() * 0.4))

    out.push({
      id: `SHP${200000 + i}`,
      orderId: `ORD${200000 + i}`,
      seller: seller.shop,
      sellerCode: seller.code,
      hub: hub.hub,
      region: hub.region,
      customer: `${CUSTOMER_FIRST[Math.floor(rng() * CUSTOMER_FIRST.length)]} ${CUSTOMER_LAST[Math.floor(rng() * CUSTOMER_LAST.length)]}`,
      customerCity: CITIES[Math.floor(rng() * CITIES.length)],
      riderId: rider?.id ?? null,
      riderName: rider?.name ?? 'Unassigned',
      carrier: pickWeighted(rng, carrierPairs),
      status,
      codAmount,
      orderValue,
      createdAt: createdAt.toISOString(),
      delayReason,
      attempts,
      timeline: buildTimeline(rng, status, createdAt, delayReason, attempts),
      kind: 'shipment',
    })
  }
  return out
}

// ---------- routes / trips + AI rebalancing notes ----------
const ROUTE_STATUSES = ['Planned', 'In Progress', 'Completed', 'Delayed']

export function generateRoutes(hubOps, riders) {
  const rng = mulberry32(OPS_SEED + 7)
  const ridersByHub = new Map()
  for (const r of riders) {
    if (!ridersByHub.has(r.hub)) ridersByHub.set(r.hub, [])
    ridersByHub.get(r.hub).push(r)
  }

  const routes = []
  let seq = 5000
  for (const h of hubOps) {
    const hubRiders = ridersByHub.get(h.hub) || []
    const routeCount = Math.max(2, Math.round(h.activeRiders / 4))
    for (let i = 0; i < routeCount; i++) {
      seq += 1
      const rider = hubRiders.length ? hubRiders[Math.floor(rng() * hubRiders.length)] : null
      const stopCount = 6 + Math.floor(rng() * 14)
      const status = ROUTE_STATUSES[Math.floor(rng() * ROUTE_STATUSES.length)]
      const completedStops = status === 'Completed' ? stopCount : Math.floor(stopCount * rng())
      const loadPct = clamp(Math.round(40 + rng() * 75), 20, 132)
      routes.push({
        id: `RT-${seq}`,
        hub: h.hub,
        region: h.region,
        riderId: rider?.id ?? null,
        riderName: rider?.name ?? 'Unassigned',
        stopCount,
        completedStops,
        loadPct,
        status,
        etaMinutes: Math.round(15 + rng() * 90),
        aiNote: null,
        kind: 'route',
      })
    }
  }

  // AI rebalance notes computed from the routes actually generated
  // above -- the note and the number it references always agree.
  const byHub = new Map()
  for (const r of routes) {
    if (!byHub.has(r.hub)) byHub.set(r.hub, [])
    byHub.get(r.hub).push(r)
  }
  for (const hubRoutes of byHub.values()) {
    const overloaded = hubRoutes.filter((r) => r.loadPct > 100).sort((a, b) => b.loadPct - a.loadPct)
    const underloaded = hubRoutes.filter((r) => r.loadPct < 55).sort((a, b) => a.loadPct - b.loadPct)
    const pairs = Math.min(overloaded.length, underloaded.length)
    for (let i = 0; i < pairs; i++) {
      const over = overloaded[i]
      const under = underloaded[i]
      const shiftStops = Math.max(1, Math.round((over.loadPct - 100) / 10))
      over.aiNote = `Shift ~${shiftStops} stop${shiftStops === 1 ? '' : 's'} to ${under.riderName} (${under.loadPct}% load)`
      under.aiNote = `Headroom available — candidate to absorb stops from ${over.riderName} (${over.loadPct}% load)`
    }
  }
  return routes
}

// ---------- NDR (failed delivery) records ----------
const NDR_REASONS = ['Customer unavailable', 'Wrong/incomplete address', 'Customer refused delivery', 'COD payment issue', 'Unreachable phone number']

export function generateNdrRecords(shipments) {
  const rng = mulberry32(OPS_SEED + 8)
  return shipments
    .filter((s) => s.status === 'Failed Delivery')
    .map((s) => ({
      id: s.id,
      orderId: s.orderId,
      seller: s.seller,
      hub: s.hub,
      customer: s.customer,
      riderName: s.riderName,
      carrier: s.carrier,
      reason: NDR_REASONS[Math.floor(rng() * NDR_REASONS.length)],
      attempts: s.attempts || 1,
      aiSuccessProbability: clamp(Math.round(80 - (s.attempts || 1) * 14 + rng() * 12), 20, 92),
      codAmount: s.codAmount,
      kind: 'ndr',
    }))
    .sort((a, b) => b.attempts - a.attempts)
}

// ---------- returns (reverse logistics) ----------
const RETURN_REASONS = ['Wrong item received', 'Changed mind', 'Damaged in transit', 'Quality not as expected', 'Wrong size/fit']
const RETURN_STAGES = ['Requested', 'Picked Up', 'At Hub', 'Inspected', 'Refunded']

export function generateReturns(shipments) {
  const rng = mulberry32(OPS_SEED + 9)
  const out = []
  for (const s of shipments) {
    if (s.status !== 'Delivered') continue
    if (rng() > 0.055) continue // ~5.5% of delivered shipments come back
    out.push({
      id: `RET-${s.id.slice(3)}`,
      shipmentId: s.id,
      seller: s.seller,
      hub: s.hub,
      customer: s.customer,
      reason: RETURN_REASONS[Math.floor(rng() * RETURN_REASONS.length)],
      stage: RETURN_STAGES[Math.floor(rng() * RETURN_STAGES.length)],
      agingDays: 1 + Math.floor(rng() * 13),
      refundAmount: s.codAmount || s.orderValue,
      kind: 'return',
    })
  }
  return out
}

// ---------- COD ledger (rider cash reconciliation) ----------
export function generateCodLedger(shipments, riders) {
  const rng = mulberry32(OPS_SEED + 10)
  const byRider = new Map()
  for (const s of shipments) {
    if (s.status !== 'Delivered' || !s.riderId) continue
    if (!byRider.has(s.riderId)) byRider.set(s.riderId, { codAmount: 0, count: 0 })
    const entry = byRider.get(s.riderId)
    entry.codAmount += s.codAmount
    entry.count += 1
  }
  const rows = []
  for (const r of riders) {
    const agg = byRider.get(r.id)
    if (!agg || agg.count === 0) continue
    const isAnomaly = rng() < 0.08
    const leakageRate = isAnomaly ? 0.08 + rng() * 0.12 : rng() * 0.025
    const expected = Math.round(agg.codAmount)
    const collected = Math.round(expected * (1 - leakageRate))
    const discrepancyPct = Math.round(leakageRate * 1000) / 10
    rows.push({
      riderId: r.id,
      riderName: r.name,
      hub: r.hub,
      shipmentCount: agg.count,
      expected,
      collected,
      discrepancy: expected - collected,
      discrepancyPct,
      settlementStatus: discrepancyPct > 8 ? 'Under Review' : discrepancyPct > 3 ? 'Pending' : 'Settled',
      kind: 'cod',
    })
  }
  return rows.sort((a, b) => b.discrepancyPct - a.discrepancyPct)
}

// ---------- seller health score ----------
export function generateSellerHealth(shipments, returns) {
  const bySeller = new Map()
  for (const s of shipments) {
    if (!bySeller.has(s.seller)) bySeller.set(s.seller, { total: 0, delivered: 0, failed: 0, delayed: 0, codValue: 0 })
    const e = bySeller.get(s.seller)
    e.total += 1
    if (s.status === 'Delivered') e.delivered += 1
    if (s.status === 'Failed Delivery') e.failed += 1
    if (s.status === 'Delayed') e.delayed += 1
    e.codValue += s.codAmount
  }
  const returnsBySeller = new Map()
  for (const r of returns) {
    returnsBySeller.set(r.seller, (returnsBySeller.get(r.seller) || 0) + 1)
  }

  const rows = []
  for (const seller of SELLERS) {
    const e = bySeller.get(seller.shop)
    if (!e || e.total < 3) continue // not enough of today's sample to score meaningfully
    const returnCount = returnsBySeller.get(seller.shop) || 0
    const deliveredRate = e.delivered / e.total
    const ndrRate = e.failed / e.total
    const delayRate = e.delayed / e.total
    const returnRate = returnCount / Math.max(1, e.delivered)
    const healthScore = clamp(Math.round(100 * deliveredRate - ndrRate * 120 - delayRate * 60 - returnRate * 80 + 10), 0, 100)
    rows.push({
      code: seller.code,
      shop: seller.shop,
      region: seller.region,
      shipmentCount: e.total,
      deliveredRate,
      ndrRate,
      returnRate,
      healthScore,
      codValue: Math.round(e.codValue),
      kind: 'sellerHealth',
    })
  }
  return rows.sort((a, b) => b.healthScore - a.healthScore)
}

// ---------- orders (order -> shipment relationship, cancellations) ----------
const CANCEL_REASONS = ['Customer cancelled', 'Out of stock', 'Payment failed', 'Duplicate order', 'Seller cancelled']

export function generateOrders(shipments) {
  const rng = mulberry32(OPS_SEED + 11)
  const orders = shipments.map((s) => ({
    id: s.orderId,
    shipmentId: s.id,
    seller: s.seller,
    customer: s.customer,
    itemCount: 1 + Math.floor(rng() * 4),
    value: s.orderValue,
    status: s.status === 'Delivered' ? 'Fulfilled' : s.status === 'Failed Delivery' ? 'Delivery Issue' : 'Processing',
    cancelReason: null,
    kind: 'order',
  }))

  // orders that never became a shipment -- cancelled before fulfillment
  const cancelledCount = Math.round(shipments.length * 0.035)
  for (let i = 0; i < cancelledCount; i++) {
    const seller = SELLERS[Math.floor(rng() * SELLERS.length)]
    orders.push({
      id: `ORD${900000 + i}`,
      shipmentId: null,
      seller: seller.shop,
      customer: `${CUSTOMER_FIRST[Math.floor(rng() * CUSTOMER_FIRST.length)]} ${CUSTOMER_LAST[Math.floor(rng() * CUSTOMER_LAST.length)]}`,
      itemCount: 1 + Math.floor(rng() * 3),
      value: Math.round(400 + rng() * 5000),
      status: 'Cancelled',
      cancelReason: CANCEL_REASONS[Math.floor(rng() * CANCEL_REASONS.length)],
      kind: 'order',
    })
  }
  return orders
}

// ---------- pickups (first-mile, seller by seller) ----------
const PICKUP_FAIL_REASONS = ['Seller not ready', 'Address unreachable', 'Rider unavailable', 'Item not packed', 'Seller rescheduled']

export function generatePickups(hubOps, riders) {
  const rng = mulberry32(OPS_SEED + 13)
  const ridersByHub = new Map()
  for (const r of riders) {
    if (!ridersByHub.has(r.hub)) ridersByHub.set(r.hub, [])
    ridersByHub.get(r.hub).push(r)
  }

  const rows = []
  let seq = 6000
  for (const seller of SELLERS) {
    seq += 1
    const hub = hubOps[Math.floor(rng() * hubOps.length)]
    const hubRiders = ridersByHub.get(hub.hub) || []
    const rider = hubRiders.length ? hubRiders[Math.floor(rng() * hubRiders.length)] : null
    const roll = rng()
    const status = roll < 0.78 ? 'Completed' : roll < 0.93 ? 'Pending' : 'Failed'
    const windowStart = 9 + Math.floor(rng() * 6)
    rows.push({
      id: `PU-${seq}`,
      seller: seller.shop,
      hub: hub.hub,
      riderName: rider?.name ?? 'Unassigned',
      window: `${windowStart}:00–${windowStart + 2}:00`,
      status,
      failReason: status === 'Failed' ? PICKUP_FAIL_REASONS[Math.floor(rng() * PICKUP_FAIL_REASONS.length)] : null,
      kind: 'pickup',
    })
  }
  return rows
}

// ---------- sortation throughput by shift ----------
const SHIFTS = ['Morning', 'Afternoon', 'Night']

export function generateSortationShifts(hubOps) {
  const rng = mulberry32(OPS_SEED + 14)
  const rows = []
  for (const h of hubOps) {
    for (const shift of SHIFTS) {
      rows.push({
        id: `${h.hub}-${shift}`,
        hub: h.hub,
        shift,
        throughput: Math.round((h.inbound / 3) * (0.7 + rng() * 0.6)),
        pendingAging: Math.round((h.pendingSort / 3) * (0.6 + rng() * 0.8)),
        misroutePct: Math.round((0.4 + (100 - h.health.sla) * 0.06 + rng() * 1.5) * 10) / 10,
        kind: 'sortation',
      })
    }
  }
  return rows
}

// ---------- linehaul (hub-to-hub trunk trips) ----------
const TRIP_STATUSES = ['Scheduled', 'In Transit', 'Arrived', 'Delayed']

export function generateLinehaulTrips(hubOps, opsData) {
  const rng = mulberry32(OPS_SEED + 15)
  const rows = []
  let seq = 7000
  for (let i = 0; i < hubOps.length; i++) {
    const tripsFromHub = 2 + Math.floor(rng() * 2)
    for (let t = 0; t < tripsFromHub; t++) {
      seq += 1
      const origin = hubOps[i]
      let dest = hubOps[Math.floor(rng() * hubOps.length)]
      if (dest.hub === origin.hub) dest = hubOps[(i + 1) % hubOps.length]
      const status = TRIP_STATUSES[Math.floor(rng() * TRIP_STATUSES.length)]
      rows.push({
        id: `LH-${seq}`,
        originHub: origin.hub,
        destHub: dest.hub,
        status,
        loadFactorPct: clamp(Math.round(50 + rng() * 60), 30, 118),
        etaHours: Math.round(3 + rng() * 9),
        delayReason: status === 'Delayed' ? (origin.topDelayReason ?? weightedDelayReason(rng, opsData)) : null,
        kind: 'linehaul',
      })
    }
  }
  return rows
}

// ---------- vehicle fleet ----------
const VEHICLE_TYPES = ['Motorbike', 'Van', 'Mini Truck']

export function generateVehicles(hubOps) {
  const rng = mulberry32(OPS_SEED + 16)
  const rows = []
  let seq = 8000
  for (const h of hubOps) {
    const count = Math.max(3, Math.round(h.activeRiders / 3))
    for (let i = 0; i < count; i++) {
      seq += 1
      const type = VEHICLE_TYPES[Math.floor(rng() * VEHICLE_TYPES.length)]
      const capacityKg = type === 'Motorbike' ? 25 : type === 'Van' ? 400 : 1200
      const utilizationPct = clamp(Math.round(40 + rng() * 65), 15, 118)
      const maintRoll = rng()
      rows.push({
        id: `VH-${seq}`,
        hub: h.hub,
        type,
        ownership: rng() < 0.35 ? '3PL' : 'Owned',
        capacityKg,
        assignedLoadKg: Math.round(capacityKg * Math.min(1.15, utilizationPct / 100)),
        utilizationPct,
        maintenanceStatus: maintRoll < 0.75 ? 'OK' : maintRoll < 0.93 ? 'Due Soon' : 'Overdue',
        kind: 'vehicle',
      })
    }
  }
  return rows
}

// ---------- customer delivery-experience profiles ----------
export function generateCustomerProfiles(shipments) {
  const rng = mulberry32(OPS_SEED + 12)
  const byCustomer = new Map()
  for (const s of shipments) {
    const key = `${s.customer}|${s.customerCity}`
    if (!byCustomer.has(key)) byCustomer.set(key, { name: s.customer, city: s.customerCity, total: 0, delivered: 0, failed: 0 })
    const e = byCustomer.get(key)
    e.total += 1
    if (s.status === 'Delivered') e.delivered += 1
    if (s.status === 'Failed Delivery') e.failed += 1
  }

  const rows = []
  let seq = 0
  for (const e of byCustomer.values()) {
    seq += 1
    const failRate = e.failed / e.total
    rows.push({
      id: `CUS${500000 + seq}`,
      name: e.name,
      city: e.city,
      deliveryHistory: e.total,
      deliveredCount: e.delivered,
      addressQuality: clamp(Math.round(92 - failRate * 140 + (rng() - 0.5) * 10), 30, 99),
      contactSuccessRate: clamp(Math.round(94 - failRate * 90 + (rng() - 0.5) * 8), 40, 99),
      kind: 'customer',
    })
  }
  return rows.sort((a, b) => b.deliveryHistory - a.deliveryHistory)
}

// ---------- per-hub zone stats (sellers/customers/packages, for the map drill-down) ----------
export function generateZoneStats(hubOps, shipments) {
  const byHub = new Map(hubOps.map((h) => [h.hub, { sellers: new Set(), customers: new Set(), packages: 0 }]))
  for (const s of shipments) {
    const zone = byHub.get(s.hub)
    if (!zone) continue
    zone.sellers.add(s.seller)
    zone.customers.add(`${s.customer}|${s.customerCity}`)
    zone.packages += 1
  }
  const out = {}
  for (const [hub, zone] of byHub) {
    out[hub] = { sellerCount: zone.sellers.size, customerCount: zone.customers.size, packageCount: zone.packages }
  }
  return out
}
