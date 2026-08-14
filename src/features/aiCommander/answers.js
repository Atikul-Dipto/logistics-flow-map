// Builds AI Commander answers from the exact same data ExceptionsPanel
// uses (opsData/hubOps/exceptions) -- one source of truth, so the
// chat panel never contradicts the Command Center it's summarizing.
export function buildAnswer(intentId, { opsData, hubOps, exceptions }) {
  switch (intentId) {
    case 'delay-today': {
      const top = opsData.network_delay_reasons.breakdown[0]
      return {
        headline: top
          ? `${Math.round(top.pct * 100)}% of today's delays trace back to ${top.reason.toLowerCase()}.`
          : 'No significant delay pattern detected right now.',
        bullets: opsData.network_delay_reasons.breakdown.slice(0, 3).map((b) => `${b.reason}: ${b.count.toLocaleString()} shipments (${Math.round(b.pct * 100)}%)`),
        actions: ['View exceptions', 'Notify affected sellers'],
      }
    }
    case 'worst-hub': {
      const worst = [...hubOps].sort((a, b) => b.slaRiskCount - a.slaRiskCount)[0]
      if (!worst) return { headline: 'No hub data available.', bullets: [], actions: [] }
      return {
        headline: `${worst.hub} is today's biggest bottleneck — ${worst.capacityPct}% capacity, ${worst.slaRiskCount.toLocaleString()} shipments at SLA risk.`,
        bullets: [
          `Avg processing time: ${worst.avgProcessingMinutes} min`,
          `Top delay cause: ${worst.topDelayReason ?? 'n/a'}`,
          `Active riders: ${worst.activeRiders}`,
        ],
        actions: ['Open hub panel', 'Reassign carrier'],
      }
    }
    case 'sla-risk': {
      const total = hubOps.reduce((s, h) => s + h.slaRiskCount, 0)
      const worstThree = [...hubOps].sort((a, b) => b.slaRiskCount - a.slaRiskCount).slice(0, 3)
      return {
        headline: `${total.toLocaleString()} shipments are currently at elevated SLA risk network-wide.`,
        bullets: worstThree.map((h) => `${h.hub}: ${h.slaRiskCount.toLocaleString()} at risk (${h.severity})`),
        actions: ['View SLA-risk shipments', 'Prioritize highest-risk hub'],
      }
    }
    case 'cod-outstanding': {
      const codCard = exceptions.find((e) => e.id === 'cod-anomaly')
      return {
        headline: codCard ? codCard.headline : 'No COD anomalies detected in the current simulation.',
        bullets: [codCard?.cause ?? '', `Total network order value in this dataset: BDT ${Math.round(opsData.total_order_value).toLocaleString()}`].filter(Boolean),
        actions: ['View COD & Finance module'],
      }
    }
    case 'carrier': {
      const sorted = [...opsData.carrier_stats].sort((a, b) => a.on_time_rate - b.on_time_rate)
      const worst = sorted[0]
      const best = sorted[sorted.length - 1]
      return {
        headline: `${worst.carrier} has the lowest on-time rate at ${Math.round(worst.on_time_rate * 100)}%, vs ${best.carrier} at ${Math.round(best.on_time_rate * 100)}%.`,
        bullets: opsData.carrier_stats
          .slice()
          .sort((a, b) => b.on_time_rate - a.on_time_rate)
          .map((c) => `${c.carrier}: ${Math.round(c.on_time_rate * 100)}% on-time, ${c.shipment_count.toLocaleString()} shipments`),
        actions: ['Rebalance carrier volume'],
      }
    }
    case 'summary':
    default: {
      const networkOnTime = hubOps.reduce((s, h) => s + h.onTimeRate * h.shipmentCount, 0) / Math.max(1, hubOps.reduce((s, h) => s + h.shipmentCount, 0))
      const critical = hubOps.filter((h) => h.severity === 'critical').length
      const totalSlaRisk = hubOps.reduce((s, h) => s + h.slaRiskCount, 0)
      return {
        headline: `Network on-time rate is ${Math.round(networkOnTime * 100)}% across ${opsData.total_shipments.toLocaleString()} shipments, with ${critical} hub${critical === 1 ? '' : 's'} in critical state.`,
        bullets: [
          `${totalSlaRisk.toLocaleString()} shipments at SLA risk network-wide`,
          `${exceptions.length} open exceptions`,
          `Top cause: ${opsData.network_delay_reasons.breakdown[0]?.reason ?? 'n/a'}`,
        ],
        actions: ['Open exceptions panel', 'View Command Center map'],
      }
    }
  }
}
