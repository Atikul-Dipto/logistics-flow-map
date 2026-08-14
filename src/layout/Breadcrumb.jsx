import { Link, useLocation } from 'react-router-dom'
import { navItemByPath } from '../routes/navConfig'
import './Breadcrumb.css'

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const item = navItemByPath.get(pathname)
  if (!item || item.path === '/') return null

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Command Center</Link>
      <span>/</span>
      <span className="breadcrumb__current">{item.label}</span>
    </nav>
  )
}
