import { useState } from 'react'
import { Search, Notifications, Sparkle, Users, LiveTracking } from '../icons'
import './Topbar.css'

export default function Topbar({ onOpenPalette, onOpenAi, exceptions, anchorDate, onOrgClick }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' || e.severity === 'serious').length

  return (
    <header className="topbar">
      <button className="topbar__search" onClick={onOpenPalette}>
        <Search className="icon" />
        <span>Search shipments, orders, hubs, riders…</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="topbar__right">
        <div className="topbar__date">{anchorDate}</div>

        <div className="topbar__status">
          <span className="topbar__status-dot" />
          Network live
        </div>

        <div className="topbar__notif-wrap">
          <button className="topbar__icon-btn" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
            <Notifications className="icon" />
            {criticalCount > 0 && <span className="topbar__badge">{criticalCount}</span>}
          </button>
          {notifOpen && (
            <div className="topbar__notif-menu">
              <div className="topbar__notif-title">Exceptions</div>
              {exceptions.slice(0, 5).map((e) => (
                <div key={e.id} className={`topbar__notif-row topbar__notif-row--${e.severity}`}>
                  {e.headline}
                </div>
              ))}
              {exceptions.length === 0 && <div className="topbar__notif-row">All clear.</div>}
            </div>
          )}
        </div>

        <button className="topbar__ai-btn" onClick={onOpenAi}>
          <Sparkle className="icon" />
          AI Assistant
        </button>

        <button className="topbar__org" onClick={onOrgClick}>
          <LiveTracking className="icon" />
          Bangladesh Logistics Network
        </button>

        <div className="topbar__profile">
          <Users className="icon" />
          <div>
            <div className="topbar__profile-name">S. Rahman</div>
            <div className="topbar__profile-role">Network Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  )
}
