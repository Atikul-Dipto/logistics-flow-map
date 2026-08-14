import './StatusPill.css'

// Fixed status-color pill (dataviz skill: reserved status palette,
// never reused as a categorical color, always paired with a label).
export default function StatusPill({ label, tone = 'neutral' }) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>
}
