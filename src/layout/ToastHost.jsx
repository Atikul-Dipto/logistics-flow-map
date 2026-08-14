import { useToastList } from '../hooks/useToast'
import './ToastHost.css'

export default function ToastHost() {
  const toasts = useToastList()
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className="toast-host__item">
          {t.message}
        </div>
      ))}
    </div>
  )
}
