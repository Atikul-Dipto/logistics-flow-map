import Drawer from '../../layout/Drawer'
import { Returns as ReturnsIcon } from '../../icons'
import { formatBdt } from '../../lib/format'
import './ReturnDrawer.css'

const STAGES = ['Requested', 'Picked Up', 'At Hub', 'Inspected', 'Refunded']

export default function ReturnDrawer({ open, onClose, item }) {
  if (!item) return null
  const stageIndex = STAGES.indexOf(item.stage)

  return (
    <Drawer open={open} onClose={onClose} title={item.id} icon={<ReturnsIcon className="icon" />} width={400}>
      <div className="return-drawer">
        <div className="return-drawer__grid">
          <div>
            <div className="return-drawer__label">Shipment</div>
            <div className="return-drawer__value">{item.shipmentId}</div>
          </div>
          <div>
            <div className="return-drawer__label">Seller</div>
            <div className="return-drawer__value">{item.seller}</div>
          </div>
          <div>
            <div className="return-drawer__label">Customer</div>
            <div className="return-drawer__value">{item.customer}</div>
          </div>
          <div>
            <div className="return-drawer__label">Hub</div>
            <div className="return-drawer__value">{item.hub}</div>
          </div>
          <div>
            <div className="return-drawer__label">Reason</div>
            <div className="return-drawer__value">{item.reason}</div>
          </div>
          <div>
            <div className="return-drawer__label">Refund amount</div>
            <div className="return-drawer__value">{formatBdt(item.refundAmount)}</div>
          </div>
        </div>

        <div className="return-drawer__section">
          <div className="return-drawer__section-label">Stage — {item.agingDays} days aging</div>
          <ol className="return-drawer__stages">
            {STAGES.map((s, i) => (
              <li key={s} className={i <= stageIndex ? 'return-drawer__stage return-drawer__stage--done' : 'return-drawer__stage'}>
                <span className="return-drawer__stage-dot" />
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Drawer>
  )
}
