import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ToastProvider.css'

export type ToastVariant = 'default' | 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
  duration: number
}

type ToastContextValue = {
  show: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const idRef = useRef(1)

    const remove = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const show = useCallback((message: string, opts?: { variant?: ToastVariant; duration?: number }) => {
        const id = idRef.current++
        const item: ToastItem = {
            id,
            message,
            variant: opts?.variant ?? 'default',
            duration: Math.max(1200, Math.min(8000, opts?.duration ?? 2400)),
        }
        setToasts((prev) => [...prev, item])
        window.setTimeout(() => remove(id), item.duration)
    }, [remove])

    const value = useMemo(() => ({ show }), [show])

    return (
        <ToastContext.Provider value={ value }>
            { children }
            { createPortal(
                <div className='toast-viewport' aria-live='polite' aria-atomic>
                    { toasts.map((t) => (
                        <div key={ t.id } className={ `toast toast--${t.variant}` }>
                            <span className='toast__msg'>{ t.message }</span>
                        </div>
                    )) }
                </div>,
                document.body,
            ) }
        </ToastContext.Provider>
    )
}

