import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import CommandCenter from './pages/CommandCenter/CommandCenter'
import Shipments from './pages/Shipments/Shipments'
import Orders from './pages/Orders/Orders'
import Pickup from './pages/Pickup/Pickup'
import Hubs from './pages/Hubs/Hubs'
import Sortation from './pages/Sortation/Sortation'
import Linehaul from './pages/Linehaul/Linehaul'
import RoutesPage from './pages/Routes/Routes'
import Riders from './pages/Riders/Riders'
import Vehicles from './pages/Vehicles/Vehicles'
import Delivery from './pages/Delivery/Delivery'
import Ndr from './pages/Ndr/Ndr'
import Returns from './pages/Returns/Returns'
import CodFinance from './pages/CodFinance/CodFinance'
import Sellers from './pages/Sellers/Sellers'
import Customers from './pages/Customers/Customers'
import Analytics from './pages/Analytics/Analytics'
import AiIntelligence from './pages/AiIntelligence/AiIntelligence'
import Network from './pages/Network/Network'
import Settings from './pages/Settings/Settings'
import ComingSoon from './components/ComingSoon'
import { OpsDataProvider } from './context/OpsDataContext'
import { ToastProvider } from './hooks/useToast'
import './App.css'

const READY_PAGES = {
  '/shipments': Shipments,
  '/orders': Orders,
  '/pickup': Pickup,
  '/hubs': Hubs,
  '/sortation': Sortation,
  '/linehaul': Linehaul,
  '/routes': RoutesPage,
  '/riders': Riders,
  '/vehicles': Vehicles,
  '/delivery': Delivery,
  '/ndr': Ndr,
  '/returns': Returns,
  '/cod-finance': CodFinance,
  '/sellers': Sellers,
  '/customers': Customers,
  '/analytics': Analytics,
  '/ai-intelligence': AiIntelligence,
  '/network': Network,
  '/settings': Settings,
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
