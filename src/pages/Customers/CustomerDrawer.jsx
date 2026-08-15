import Drawer from '../../layout/Drawer'
import { Customers as CustomersIcon } from '../../icons'
import './CustomerDrawer.css'

function Bar({ label, pct, tone }) {
  return (
    <div className="customer-drawer__bar-row">
      <span>{label}</span>
      <div className="customer-drawer__bar-track">
        <div className={`customer-drawer__bar-fill customer-drawer__bar-fill--${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="customer-drawer__bar-value">{pct}%</span>
    </div>
  )
}

export default function CustomerDrawer({ open, onClose, customer }) {
  if (!customer) return null
  return (
    <Drawer open={open} onClose={onClose} title={customer.name} icon={<CustomersIcon className="icon" />} width={380}>
      <div className="customer-drawer">
        <div className="customer-drawer__grid">
          <div>
            <div className="customer-drawer__label">City</div>
            <div className="customer-drawer__value">{customer.city}</div>
          </div>
          <div>
            <div className="customer-drawer__label">Shipments</div>
            <div className="customer-drawer__value">{customer.deliveryHistory}</div>
          </div>
          <div>
            <div className="customer-drawer__label">Delivered</div>
            <div className="customer-drawer__value">{customer.deliveredCount}</div>
          </div>
        </div>

        <div className="customer-drawer__section">
          <div className="customer-drawer__section-label">Delivery experience signals</div>
          <Bar label="Address quality" pct={customer.addressQuality} tone={customer.addressQuality >= 70 ? 'good' : 'warning'} />
          <Bar label="Contact success" pct={customer.contactSuccessRate} tone={customer.contactSuccessRate >= 70 ? 'good' : 'warning'} />
        </div>
      </div>
    </Drawer>
  )
}
