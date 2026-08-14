import Drawer from '../../layout/Drawer'
import { Shipments as ShipmentsIcon } from '../../icons'
import { formatBdt } from '../../lib/format'
import './ShipmentDrawer.css'

const FAILED_STAGE_PREFIXES = ['Delay flagged', 'Delivery attempt']

function stageTone(stage) {
  if (FAILED_STAGE_PREFIXES.some((p) => stage.startsWith(p))) return 'shipment-drawer__event--warn'
  if (stage === 'Delivered') return 'shipment-drawer__event--done'
  return ''
}

export default function ShipmentDrawer({ open, onClose, shipment }) {
  if (!shipment) return null
  return (
    <Drawer open={open} onClose={onClose} title={shipment.id} icon={<ShipmentsIcon className="icon" />} width={420}>
      <div className="shipment-drawer">
        <div className="shipment-drawer__grid">
          <div>
            <div className="shipment-drawer__label">Order</div>
            <div className="shipment-drawer__value">{shipment.orderId}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Seller</div>
            <div className="shipment-drawer__value">{shipment.seller}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Customer</div>
            <div className="shipment-drawer__value">{shipment.customer} · {shipment.customerCity}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Hub</div>
            <div className="shipment-drawer__value">{shipment.hub}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Rider</div>
            <div className="shipment-drawer__value">{shipment.riderName}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Carrier</div>
            <div className="shipment-drawer__value">{shipment.carrier}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">COD amount</div>
            <div className="shipment-drawer__value">{formatBdt(shipment.codAmount)}</div>
          </div>
          <div>
            <div className="shipment-drawer__label">Order value</div>
            <div className="shipment-drawer__value">{formatBdt(shipment.orderValue)}</div>
          </div>
        </div>

        {shipment.delayReason && (
          <div className="shipment-drawer__alert">
            <strong>{shipment.status === 'Failed Delivery' ? 'Failed delivery' : 'Delayed'}:</strong> {shipment.delayReason}
            {shipment.attempts > 0 && ` — ${shipment.attempts} attempt${shipment.attempts === 1 ? '' : 's'} so far`}
          </div>
        )}

        <div className="shipment-drawer__section-label">Digital twin — event timeline</div>
        <ul className="shipment-drawer__timeline">
          {shipment.timeline.map((ev, i) => (
            <li key={i} className={`shipment-drawer__event ${stageTone(ev.stage)}`}>
              <span className="shipment-drawer__event-dot" />
              <div className="shipment-drawer__event-body">
                <div className="shipment-drawer__event-stage">{ev.stage}</div>
                <div className="shipment-drawer__event-time">{new Date(ev.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                {ev.note && <div className="shipment-drawer__event-note">{ev.note}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  )
}
