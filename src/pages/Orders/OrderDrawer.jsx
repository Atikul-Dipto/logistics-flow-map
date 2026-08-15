import { useNavigate } from 'react-router-dom'
import Drawer from '../../layout/Drawer'
import { Orders as OrdersIcon } from '../../icons'
import { formatBdt } from '../../lib/format'
import './OrderDrawer.css'

export default function OrderDrawer({ open, onClose, order }) {
  const navigate = useNavigate()
  if (!order) return null

  return (
    <Drawer open={open} onClose={onClose} title={order.id} icon={<OrdersIcon className="icon" />} width={380}>
      <div className="order-drawer">
        <div className="order-drawer__grid">
          <div>
            <div className="order-drawer__label">Seller</div>
            <div className="order-drawer__value">{order.seller}</div>
          </div>
          <div>
            <div className="order-drawer__label">Customer</div>
            <div className="order-drawer__value">{order.customer}</div>
          </div>
          <div>
            <div className="order-drawer__label">Items</div>
            <div className="order-drawer__value">{order.itemCount}</div>
          </div>
          <div>
            <div className="order-drawer__label">Value</div>
            <div className="order-drawer__value">{formatBdt(order.value)}</div>
          </div>
          <div>
            <div className="order-drawer__label">Status</div>
            <div className="order-drawer__value">{order.status}</div>
          </div>
        </div>

        {order.cancelReason && (
          <div className="order-drawer__alert">
            <strong>Cancelled:</strong> {order.cancelReason}
          </div>
        )}

        {order.shipmentId ? (
          <button
            type="button"
            className="order-drawer__link-btn"
            onClick={() => {
              onClose()
              navigate('/shipments', { state: { openId: order.shipmentId } })
            }}
          >
            View shipment {order.shipmentId} →
          </button>
        ) : (
          <p className="order-drawer__no-shipment">This order never generated a shipment.</p>
        )}
      </div>
    </Drawer>
  )
}
