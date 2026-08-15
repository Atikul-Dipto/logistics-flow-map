import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import '../shared.css'
import './Settings.css'

const ROLES = ['Network Ops Lead', 'Hub Manager', 'Rider', 'Finance', 'Read-only Viewer']
const PERMISSIONS = ['View Command Center', 'Manage Shipments', 'Manage Riders', 'Approve Refunds', 'Access Finance', 'Manage Settings']

const DEFAULT_MATRIX = {
  'Network Ops Lead': ['View Command Center', 'Manage Shipments', 'Manage Riders', 'Approve Refunds', 'Access Finance', 'Manage Settings'],
  'Hub Manager': ['View Command Center', 'Manage Shipments', 'Manage Riders'],
  Rider: ['View Command Center'],
  Finance: ['View Command Center', 'Approve Refunds', 'Access Finance'],
  'Read-only Viewer': ['View Command Center'],
}

const DEFAULT_NOTIFICATIONS = [
  { key: 'sla', label: 'SLA breach alerts', on: true },
  { key: 'cod', label: 'COD anomaly alerts', on: true },
  { key: 'capacity', label: 'Hub critical capacity alerts', on: true },
  { key: 'daily', label: 'Daily summary email', on: false },
  { key: 'weekly', label: 'Weekly analytics digest', on: true },
]

export default function Settings() {
  const toast = useToast()
  const [matrix, setMatrix] = useState(() => {
    const init = {}
    for (const role of ROLES) init[role] = new Set(DEFAULT_MATRIX[role] || [])
    return init
  })
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)

  const togglePermission = (role, perm) => {
    setMatrix((prev) => {
      const next = { ...prev, [role]: new Set(prev[role]) }
      if (next[role].has(perm)) next[role].delete(perm)
      else next[role].add(perm)
      return next
    })
    toast(`${role}: ${perm} updated (session only).`)
  }

  const toggleNotification = (key) => {
    setNotifications((prev) => prev.map((n) => (n.key === key ? { ...n, on: !n.on } : n)))
    const item = notifications.find((n) => n.key === key)
    toast(`${item?.label} ${item?.on ? 'disabled' : 'enabled'}.`)
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>Settings</h1>
          <p className="module-page__subtitle">Organization, role, and access configuration.</p>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Organization</div>
        <p className="module-page__panel-caption">Read-only in this demo — no backend is connected.</p>
        <div className="settings__org-grid">
          <div>
            <div className="settings__label">Organization</div>
            <div className="settings__value">Bangla Express Logistics</div>
          </div>
          <div>
            <div className="settings__label">Plan</div>
            <div className="settings__value">Enterprise</div>
          </div>
          <div>
            <div className="settings__label">Timezone</div>
            <div className="settings__value">Asia/Dhaka (GMT+6)</div>
          </div>
          <div>
            <div className="settings__label">Currency</div>
            <div className="settings__value">BDT (৳)</div>
          </div>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Role-based access control</div>
        <p className="module-page__panel-caption">Toggle a cell to grant or revoke a permission for a role — changes apply for this session only.</p>
        <div className="settings__rbac-wrap">
          <table className="settings__rbac">
            <thead>
              <tr>
                <th>Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role}>
                  <td className="settings__rbac-role">{role}</td>
                  {PERMISSIONS.map((perm) => (
                    <td key={perm} className="settings__rbac-cell">
                      <button
                        type="button"
                        className={`settings__rbac-check ${matrix[role].has(perm) ? 'settings__rbac-check--on' : ''}`}
                        onClick={() => togglePermission(role, perm)}
                        aria-label={`${role}: ${perm}`}
                      >
                        {matrix[role].has(perm) ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Notification preferences</div>
        <p className="module-page__panel-caption">Session-only preferences for this demo account.</p>
        <div className="settings__notifications">
          {notifications.map((n) => (
            <div key={n.key} className="settings__notification-row">
              <span>{n.label}</span>
              <button type="button" className={`settings__switch ${n.on ? 'settings__switch--on' : ''}`} onClick={() => toggleNotification(n.key)} aria-pressed={n.on}>
                <span className="settings__switch-knob" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
