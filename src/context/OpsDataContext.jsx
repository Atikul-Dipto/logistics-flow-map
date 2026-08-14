import { createContext, useContext } from 'react'
import { useFlowData } from '../hooks/useFlowData'
import { useOpsData } from '../hooks/useOpsData'

const Ctx = createContext(null)

// Single fetch/generate pass for the whole app -- the shell (command
// palette, AI commander) and every page share one source of truth
// instead of re-fetching or re-generating independently.
export function OpsDataProvider({ children }) {
  const flow = useFlowData()
  const ops = useOpsData()
  const value = { ...flow, ...ops, loading: flow.loading || ops.opsLoading }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOps() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOps must be used within OpsDataProvider')
  return ctx
}
