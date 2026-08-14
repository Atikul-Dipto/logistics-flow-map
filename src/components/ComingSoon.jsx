import { Link } from 'react-router-dom'
import { Dashboard } from '../icons'
import './ComingSoon.css'

export default function ComingSoon({ item }) {
  const Icon = item?.icon ?? Dashboard
  return (
    <div className="coming-soon">
      <div className="coming-soon__icon">
        <Icon />
      </div>
      <span className="coming-soon__pill">Coming Soon</span>
      <h1>{item?.label}</h1>
      <p className="coming-soon__desc">{item?.description}</p>
      {item?.bullets && (
        <ul className="coming-soon__bullets">
          {item.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      <Link to="/" className="coming-soon__back">
        ← Back to Command Center
      </Link>
    </div>
  )
}
