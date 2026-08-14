import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import CommandCenter from './pages/CommandCenter/CommandCenter'
import ComingSoon from './components/ComingSoon'
import { navItems } from './routes/navConfig'
import { OpsDataProvider } from './context/OpsDataContext'
import { ToastProvider } from './hooks/useToast'
import './App.css'

const phase2Items = navItems.filter((n) => n.status === 'phase2')

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <OpsDataProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<CommandCenter />} />
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
