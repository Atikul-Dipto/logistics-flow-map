import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Breadcrumb from './Breadcrumb'
import PageTransition from './PageTransition'
import CommandPalette from './CommandPalette'
import ToastHost from './ToastHost'
import AiCommanderPanel from '../features/aiCommander/AiCommanderPanel'
import { useOps } from '../context/OpsDataContext'
import { useToast } from '../hooks/useToast'
import './AppShell.css'

export default function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const { opsData, exceptions, loading } = useOps()
  const toast = useToast()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const anchorDate = opsData
    ? new Date(opsData.date_bounds.max_order_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Topbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAi={() => setAiOpen(true)}
          exceptions={loading ? [] : exceptions}
          anchorDate={anchorDate}
          onOrgClick={() => toast('Multi-organization support ships in a later phase.')}
        />
        <Breadcrumb />
        <div className="app-shell__content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <AiCommanderPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      <ToastHost />
    </div>
  )
}
