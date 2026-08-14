import Drawer from '../../layout/Drawer'
import { Sellers as SellersIcon } from '../../icons'
import { formatBdt } from '../../lib/format'
import './SellerDrawer.css'

function Bar({ label, pct, tone }) {
  return (
    <div className="seller-drawer__bar-row">
      <span>{label}</span>
      <div className="seller-drawer__bar-track">
        <div className={`seller-drawer__bar-fill seller-drawer__bar-fill--${tone}`} style={{ width: `${Math.min(100, Math.round(pct * 100))}%` }} />
      </div>
      <span className="seller-drawer__bar-value">{Math.round(pct * 100)}%</span>
    </div>
  )
}

export default function SellerDrawer({ open, onClose, seller }) {
  if (!seller) return null
  return (
    <Drawer open={open} onClose={onClose} title={seller.shop} icon={<SellersIcon className="icon" />} width={400}>
      <div className="seller-drawer">
        <div className="seller-drawer__grid">
          <div>
            <div className="seller-drawer__label">Seller code</div>
            <div className="seller-drawer__value">{seller.code}</div>
          </div>
          <div>
            <div className="seller-drawer__label">Region</div>
            <div className="seller-drawer__value">{seller.region}</div>
          </div>
          <div>
            <div className="seller-drawer__label">Shipments today</div>
            <div className="seller-drawer__value">{seller.shipmentCount}</div>
          </div>
          <div>
            <div className="seller-drawer__label">COD value</div>
            <div className="seller-drawer__value">{formatBdt(seller.codValue)}</div>
          </div>
        </div>

        <div className="seller-drawer__section">
          <div className="seller-drawer__section-label">Health score — {seller.healthScore} / 100</div>
          <Bar label="Delivered" pct={seller.deliveredRate} tone="good" />
          <Bar label="NDR rate" pct={seller.ndrRate} tone="critical" />
          <Bar label="Return rate" pct={seller.returnRate} tone="warning" />
        </div>
      </div>
    </Drawer>
  )
}
