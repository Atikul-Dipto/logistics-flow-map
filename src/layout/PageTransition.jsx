import { useLocation } from 'react-router-dom'
import './PageTransition.css'

export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  return (
    <div className="page-transition" key={pathname}>
      {children}
    </div>
  )
}
