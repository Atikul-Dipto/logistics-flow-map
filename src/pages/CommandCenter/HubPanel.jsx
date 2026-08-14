import Drawer from '../../layout/Drawer'
import { Hub } from '../../icons'
import './HubPanel.css'

const SEVERITY_LABEL = { good: 'Healthy', warning: 'At Risk', serious: 'Serious', critical: 'Critical' }

function Meter({ pct, severity }) {
  return (
    <div className="hub-panel__meter">
      <div className={`hub-panel__meter-track hub-panel__meter-track--${severity}`}>
        <div className={`hub-panel__meter-fill hub-panel__meter-fill--${severity}`} style={{ width: `${pct}%` }} />
      </div>
      <span>{pct}%</span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="hub-panel__stat">
      <div className="hub-panel__stat-value">{value}</div>
      <div className="hub-panel__stat-label">{label}</div>
    </div>
  )
}

export default function HubPanel({ open, onClose, hub }) {
  if (!hub) return null
  return (
    <Drawer open={open} onClose={onClose} title={hub.hub} icon={<Hub className="icon" />} width={400}>
      <div className="hub-panel">
        <span className={`hub-panel__severity hub-panel__severity--${hub.severity}`}>{SEVERITY_LABEL[hub.severity]}</span>

        <div className="hub-panel__section">
          <div className="hub-panel__section-label">Capacity</div>
          <Meter pct={hub.capacityPct} severity={hub.severity} />
        </div>

        <div className="hub-panel__stats">
          <Stat label="Inbound" value={hub.inbound.toLocaleString()} />
          <Stat label="Outbound" value={hub.outbound.toLocaleString()} />
          <Stat label="Pending Sort" value={hub.pendingSort.toLocaleString()} />
          <Stat label="SLA Risk" value={hub.slaRiskCount.toLocaleString()} />
          <Stat label="Active Riders" value={hub.activeRiders} />
          <Stat label="Avg Processing" value={`${hub.avgProcessingMinutes} min`} />
        </div>

        <div className="hub-panel__section">
          <div className="hub-panel__section-label">Hub Health — {hub.health.score} / 100</div>
          {['capacity', 'processing', 'sla', 'staffing', 'network'].map((k) => (
            <div key={k} className="hub-panel__health-row">
              <span>{k[0].toUpperCase() + k.slice(1)}</span>
              <div className="hub-panel__health-track">
                <div className="hub-panel__health-fill" style={{ width: `${hub.health[k]}%` }} />
              </div>
              <span className="hub-panel__health-score">{hub.health[k]}</span>
            </div>
          ))}
        </div>

        {hub.topDelayReason && (
          <div className="hub-panel__section">
            <div className="hub-panel__section-label">Top delay cause</div>
            <p className="hub-panel__delay-reason">{hub.topDelayReason}</p>
          </div>
        )}
      </div>
    </Drawer>
  )
}
