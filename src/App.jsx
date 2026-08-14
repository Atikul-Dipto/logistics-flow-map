import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import CommandCenter from './pages/CommandCenter/CommandCenter'
import Shipments from './pages/Shipments/Shipments'
import Hubs from './pages/Hubs/Hubs'
import Riders from './pages/Riders/Riders'
import RoutesPage from './pages/Routes/Routes'
import Ndr from './pages/Ndr/Ndr'
import Returns from './pages/Returns/Returns'
import CodFinance from './pages/CodFinance/CodFinance'
import Sellers from './pages/Sellers/Sellers'
import Analytics from './pages/Analytics/Analytics'
import AiIntelligence from './pages/AiIntelligence/AiIntelligence'
import ComingSoon from './components/ComingSoon'
import { navItems } from './routes/navConfig'
import { OpsDataProvider } from './context/OpsDataContext'
import { ToastProvider } from './hooks/useToast'
import './App.css'

const phase2Items = navItems.filter((n) => n.status === 'phase2')

const READY_PAGES = {
  '/shipments': Shipments,
  '/hubs': Hubs,
  '/riders': Riders,
  '/routes': RoutesPage,
  '/ndr': Ndr,
  '/returns': Returns,
  '/cod-finance': CodFinance,
  '/sellers': Sellers,
  '/analytics': Analytics,
  '/ai-intelligence': AiIntelligence,
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <OpsDataProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<CommandCenter />} />
              {Object.entries(READY_PAGES).map(([path, Component]) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              {phase2Items.map((item) => (
                <Route key={item.key} path={item.path} element={<ComingSoon item={item} />} />
              ))}
              <Route
                path="*"
                element={<ComingSoon item={{ label: 'Not Found', description: "This page doesn't exist yet.", bullets: [] }} />}
              />
            </Route>
          </Routes>
        </ToastProvider>
      </OpsDataProvider>
    </BrowserRouter>
  )
}
