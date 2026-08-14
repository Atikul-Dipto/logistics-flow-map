import { useEffect, useMemo, useState } from 'react'
import {
  generateHubOps,
  generateKpiSeries,
  generateExceptions,
  generateRiderRoster,
  generateMockShipments,
  generateMockOrders,
  generateMockCustomers,
} from '../data/generate'

// Real aggregates (ops_data.json) + the client-side generators layered
// on top of them -- see src/data/generate.js for what's real vs
// synthetic. Computed once via useMemo, not per-render.
export function useOpsData() {
  const [opsData, setOpsData] = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    fetch(`${base}data/ops_data.json`)
      .then((r) => r.json())
      .then(setOpsData)
  }, [])

  const hubOps = useMemo(() => (opsData ? generateHubOps(opsData) : []), [opsData])
  const kpiSeries = useMemo(() => (opsData && hubOps.length ? generateKpiSeries(opsData, hubOps) : null), [opsData, hubOps])
  const exceptions = useMemo(() => (opsData && hubOps.length ? generateExceptions(opsData, hubOps) : []), [opsData, hubOps])
  const riders = useMemo(() => (hubOps.length ? generateRiderRoster(hubOps) : []), [hubOps])
  const mockShipments = useMemo(() => (opsData ? generateMockShipments(opsData) : []), [opsData])
  const mockOrders = useMemo(() => generateMockOrders(), [])
  const mockCustomers = useMemo(() => generateMockCustomers(), [])

  return {
    opsData,
    hubOps,
    kpiSeries,
    exceptions,
    riders,
    mockShipments,
    mockOrders,
    mockCustomers,
    opsLoading: !opsData,
  }
}
