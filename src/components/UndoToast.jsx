import { useEffect } from 'react'

export default function UndoToast({ onUndo, onDismiss, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  return (
    <div className="toast" role="status">
      <span>Note deleted</span>
      <button type="button" className="link-btn" onClick={onUndo}>
        Undo
      </button>
    </div>
  )
}
