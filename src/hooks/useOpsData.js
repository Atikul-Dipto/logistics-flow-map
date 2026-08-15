import { useEffect, useMemo, useState } from 'react'
import {
  generateHubOps,
  generateKpiSeries,
  generateExceptions,
  generateRiderRoster,
  generateShipments,
  generateRoutes,
  generateNdrRecords,
  generateReturns,
  generateCodLedger,
  generateSellerHealth,
  generateOrders,
  generatePickups,
  generateSortationShifts,
  generateLinehaulTrips,
  generateVehicles,
  generateCustomerProfiles,
  generateZoneStats,
} from '../data/generate'

// Real aggregates (ops_data.json) + the client-side generators layered
// on top of them -- see src/data/generate.js for what's real vs
// synthetic. Computed once via useMemo, not per-render. Downstream
// generators (shipments -> routes/NDR/returns/COD/sellers/orders/
// customers) each derive from the ones before them so nothing is
// computed twice or drifts out of sync across modules.
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
  const mockShipments = useMemo(() => (opsData && hubOps.length ? generateShipments(opsData, hubOps, riders) : []), [opsData, hubOps, riders])
  const routes = useMemo(() => (hubOps.length ? generateRoutes(hubOps, riders) : []), [hubOps, riders])
  const ndrRecords = useMemo(() => generateNdrRecords(mockShipments), [mockShipments])
  const returns = useMemo(() => generateReturns(mockShipments), [mockShipments])
  const codLedger = useMemo(() => generateCodLedger(mockShipments, riders), [mockShipments, riders])
  const sellerHealth = useMemo(() => generateSellerHealth(mockShipments, returns), [mockShipments, returns])
  const orders = useMemo(() => generateOrders(mockShipments), [mockShipments])
  const pickups = useMemo(() => (hubOps.length ? generatePickups(hubOps, riders) : []), [hubOps, riders])
  const sortationShifts = useMemo(() => (hubOps.length ? generateSortationShifts(hubOps) : []), [hubOps])
  const linehaulTrips = useMemo(() => (opsData && hubOps.length ? generateLinehaulTrips(hubOps, opsData) : []), [opsData, hubOps])
  const vehicles = useMemo(() => (hubOps.length ? generateVehicles(hubOps) : []), [hubOps])
  const customerProfiles = useMemo(() => generateCustomerProfiles(mockShipments), [mockShipments])
  const zoneStats = useMemo(() => (hubOps.length ? generateZoneStats(hubOps, mockShipments) : {}), [hubOps, mockShipments])

  return {
    opsData,
    hubOps,
    kpiSeries,
    exceptions,
    riders,
    mockShipments,
    routes,
    ndrRecords,
    returns,
    codLedger,
    sellerHealth,
    orders,
    pickups,
    sortationShifts,
    linehaulTrips,
    vehicles,
    customerProfiles,
    zoneStats,
    opsLoading: !opsData,
  }
}
