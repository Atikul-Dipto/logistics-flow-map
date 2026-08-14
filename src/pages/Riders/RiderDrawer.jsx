import Drawer from '../../layout/Drawer'
import { Riders as RidersIcon } from '../../icons'
import { formatBdt } from '../../lib/format'
import './RiderDrawer.css'

export default function RiderDrawer({ open, onClose, rider, hubOps, codLedger }) {
  if (!rider) return null
  const hub = hubOps.find((h) => h.hub === rider.hub)
  const zoneOnTimePct = hub ? Math.round(hub.onTimeRate * 100) : null
  const delta = zoneOnTimePct != null ? Math.round(rider.successRate - zoneOnTimePct) : null
  const cod = codLedger.find((c) => c.riderId === rider.id)

  return (
    <Drawer open={open} onClose={onClose} title={rider.name} icon={<RidersIcon className="icon" />} width={400}>
      <div className="rider-drawer">
        <div className="rider-drawer__grid">
          <div>
            <div className="rider-drawer__label">Rider ID</div>
            <div className="rider-drawer__value">{rider.id}</div>
          </div>
          <div>
            <div className="rider-drawer__label">Hub</div>
            <div className="rider-drawer__value">{rider.hub}</div>
          </div>
          <div>
            <div className="rider-drawer__label">Rating</div>
            <div className="rider-drawer__value">{rider.rating} ★</div>
          </div>
          <div>
            <div className="rider-drawer__label">Active Shipments</div>
            <div className="rider-drawer__value">{rider.activeShipments}</div>
          </div>
        </div>

        {delta != null && (
          <div className={`rider-drawer__ai ${delta >= 0 ? 'rider-drawer__ai--good' : 'rider-drawer__ai--bad'}`}>
            AI: operating {Math.abs(delta)} point{Math.abs(delta) === 1 ? '' : 's'} {delta >= 0 ? 'above' : 'below'} the {rider.hub} zone average ({zoneOnTimePct}% on-time).
          </div>
        )}

        {cod && (
          <div className="rider-drawer__section">
            <div className="rider-drawer__section-label">COD reconciliation (today)</div>
            <div className="rider-drawer__cod-row">
              <span>Collected</span>
              <strong>{formatBdt(cod.collected)}</strong>
            </div>
            <div className="rider-drawer__cod-row">
              <span>Expected</span>
              <strong>{formatBdt(cod.expected)}</strong>
            </div>
            <div className="rider-drawer__cod-row">
              <span>Discrepancy</span>
              <strong className={cod.discrepancyPct > 3 ? 'rider-drawer__cod-flag' : ''}>{cod.discrepancyPct}%</strong>
            </div>
            <div className="rider-drawer__cod-row">
              <span>Status</span>
              <strong>{cod.settlementStatus}</strong>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
