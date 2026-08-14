import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const push = useCallback((message) => {
    seq.current += 1
    const id = seq.current
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return <ToastCtx.Provider value={{ toasts, push }}>{children}</ToastCtx.Provider>
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.push
}

export function useToastList() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToastList must be used within ToastProvider')
  return ctx.toasts
}
