import Drawer from '../../layout/Drawer'
import { Route as RouteIcon } from '../../icons'
import './RouteDrawer.css'

function loadSeverity(pct) {
  if (pct > 110) return 'critical'
  if (pct > 100) return 'serious'
  if (pct < 55) return 'warning'
  return 'good'
}

export default function RouteDrawer({ open, onClose, route }) {
  if (!route) return null
  const severity = loadSeverity(route.loadPct)
  const stopPct = Math.round((route.completedStops / route.stopCount) * 100)

  return (
    <Drawer open={open} onClose={onClose} title={route.id} icon={<RouteIcon className="icon" />} width={400}>
      <div className="route-drawer">
        <div className="route-drawer__grid">
          <div>
            <div className="route-drawer__label">Hub</div>
            <div className="route-drawer__value">{route.hub}</div>
          </div>
          <div>
            <div className="route-drawer__label">Rider</div>
            <div className="route-drawer__value">{route.riderName}</div>
          </div>
          <div>
            <div className="route-drawer__label">Status</div>
            <div className="route-drawer__value">{route.status}</div>
          </div>
          <div>
            <div className="route-drawer__label">ETA</div>
            <div className="route-drawer__value">{route.etaMinutes} min</div>
          </div>
        </div>

        <div className="route-drawer__section">
          <div className="route-drawer__section-label">Stops completed</div>
          <div className="route-drawer__meter">
            <div className="route-drawer__meter-track">
              <div className="route-drawer__meter-fill route-drawer__meter-fill--good" style={{ width: `${stopPct}%` }} />
            </div>
            <span>{route.completedStops} / {route.stopCount}</span>
          </div>
        </div>

        <div className="route-drawer__section">
          <div className="route-drawer__section-label">Vehicle load</div>
          <div className="route-drawer__meter">
            <div className="route-drawer__meter-track">
              <div className={`route-drawer__meter-fill route-drawer__meter-fill--${severity}`} style={{ width: `${Math.min(100, route.loadPct)}%` }} />
            </div>
            <span>{route.loadPct}%</span>
          </div>
        </div>

        {route.aiNote && (
          <div className="route-drawer__ai">
            <strong>AI recommendation:</strong> {route.aiNote}
          </div>
        )}
      </div>
    </Drawer>
  )
}
