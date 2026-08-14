import { useEffect } from 'react'
import './Drawer.css'

// Shared right-side slide-over -- HubPanel and AiCommanderPanel both
// compose this instead of duplicating the open/close/escape/backdrop
// mechanics.
export default function Drawer({ open, onClose, title, icon, children, width = 400 }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer-panel" style={{ width }}>
        <header className="drawer-panel__header">
          <div className="drawer-panel__title">
            {icon}
            <h2>{title}</h2>
          </div>
          <button className="drawer-panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="drawer-panel__body">{children}</div>
      </aside>
    </div>
  )
}
