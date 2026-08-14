import { LiveTracking, Shipments, DeliveryRate } from '../icons'
import './LiveBoard.css'

const ICONS = {
  created: Shipments,
  delivered: DeliveryRate,
}

const LABELS = {
  created: 'Package created',
  delivered: 'Delivered',
}

export default function LiveBoard({ events }) {
  return (
    <div className="live-board">
      <h2 className="live-board__title">
        <span className="live-board__dot" />
        <LiveTracking className="icon" /> Live board
      </h2>
      <p className="live-board__caption">Real spawn/arrival events from the animation on the map, sampled live — not a fixed replay.</p>
      <ul className="live-board__list">
        {events.length === 0 && <li className="live-board__empty">Watching the network…</li>}
        {events.map((e) => {
          const Icon = ICONS[e.type] ?? Shipments
          return (
            <li key={e.key} className="live-board__row">
              <Icon className={`icon live-board__icon live-board__icon--${e.type}`} />
              <div className="live-board__text">
                <div className="live-board__label">
                  {LABELS[e.type] ?? e.type} <span className="live-board__id">{e.shipmentId}</span>
                </div>
                <div className="live-board__detail">
                  {e.sourceLabel} → {e.targetLabel} · {e.carrier}
                </div>
              </div>
              <time className="live-board__time">{e.timeLabel}</time>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
