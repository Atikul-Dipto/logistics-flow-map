import { Exception } from '../../icons'
import { useToast } from '../../hooks/useToast'
import './ExceptionsPanel.css'

export default function ExceptionsPanel({ exceptions }) {
  const toast = useToast()

  return (
    <div className="exceptions-panel">
      <h2 className="exceptions-panel__title">
        <Exception className="icon" /> Exceptions &amp; AI recommendations
      </h2>
      <p className="exceptions-panel__caption">Computed live from real network aggregates — what needs attention right now, and why.</p>

      <div className="exceptions-panel__list">
        {exceptions.length === 0 && <div className="exceptions-panel__empty">No open exceptions.</div>}
        {exceptions.map((e) => (
          <div key={e.id} className={`exceptions-panel__card exceptions-panel__card--${e.severity}`}>
            <div className="exceptions-panel__headline">{e.headline}</div>
            <div className="exceptions-panel__cause">{e.cause}</div>
            <div className="exceptions-panel__actions">
              {e.actions.map((a) => (
                <button key={a} onClick={() => toast(`${a} — queued (Phase 2 workflow).`)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
