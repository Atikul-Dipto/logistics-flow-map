import { NavLink } from 'react-router-dom'
import { navConfig } from '../routes/navConfig'
import { LiveTracking } from '../icons'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">
        <LiveTracking className="icon icon--accent icon--pulse" />
        <div>
          <div className="sidebar__brand-name">Logistics OS</div>
          <div className="sidebar__brand-sub">Command Center</div>
        </div>
      </div>

      <div className="sidebar__scroll">
        {navConfig.map((group) => (
          <div className="sidebar__group" key={group.group}>
            <div className="sidebar__group-label">{group.group}</div>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}
                >
                  <Icon className="icon" />
                  <span>{item.label}</span>
                  {item.status === 'phase2' && <span className="sidebar__soon">Soon</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}
