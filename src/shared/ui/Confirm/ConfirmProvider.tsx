import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Confirm.css'
import { useTranslation } from 'react-i18next'

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

type Pending = (ConfirmOptions & { resolve: (v: boolean) => void }) | null

type ConfirmContextValue = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export const useConfirm = (): ConfirmContextValue => {
    const ctx = useContext(ConfirmContext)
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
    return ctx
}

export const ConfirmProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation('common')
    const [pending, setPending] = useState<Pending>(null)
    const [open, setOpen] = useState(false)
    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const confirmRef = useRef<HTMLButtonElement | null>(null)

    const close = useCallback(() => {
        setOpen(false)
        // размонтируем после анимации
        setTimeout(() => setPending(null), 160)
    }, [])

    const onCancel = useCallback(() => {
        if (pending) pending.resolve(false)
        close()
    }, [pending, close])

    const onConfirm = useCallback(() => {
        if (pending) pending.resolve(true)
        close()
    }, [pending, close])

    const confirm = useCallback((opts?: ConfirmOptions) => new Promise<boolean>((resolve) => {
        setPending({
            title: opts?.title ?? t('confirmations.delete_snippet_title', { defaultValue: 'Confirmation' }),
            description: opts?.description ?? t('confirmations.delete_snippet_text', { defaultValue: 'Are you sure?' }),
            confirmText: opts?.confirmText ?? t('yes', { defaultValue: 'OK' }),
            cancelText: opts?.cancelText ?? t('no', { defaultValue: 'Cancel' }),
            variant: opts?.variant ?? 'default',
            resolve,
        })
        // следующий тик — открыть, чтобы сработала анимация
        requestAnimationFrame(() => setOpen(true))
    }), [t])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel()
            if (e.key === 'Enter') onConfirm()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, onCancel, onConfirm])

    const value = useMemo(() => ({ confirm }), [confirm])

    return (
        <ConfirmContext.Provider value={ value }>
            { children }
            { pending && createPortal(
                <div className={ `confirm ${open ? 'is-open' : 'is-closing'}` } role='dialog' aria-modal>
                    <div className='confirm__backdrop' onClick={ onCancel } />
                    <div className='confirm__panel' role='document'>
                        { pending.title && <div className='confirm__title'>{ pending.title }</div> }
                        { pending.description && <div className='confirm__desc'>{ pending.description }</div> }
                        <div className='confirm__actions'>
                            <button
                                ref={ cancelRef }
                                className='confirm__btn confirm__btn--ghost'
                                onClick={ onCancel }
                                type='button'
                            >
                                { pending.cancelText }
                            </button>
                            <button
                                ref={ confirmRef }
                                className={ `confirm__btn ${pending.variant === 'danger' ? 'confirm__btn--danger' : 'confirm__btn--primary'}` }
                                onClick={ onConfirm }
                                type='button'
                            >
                                { pending.confirmText }
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            ) }
        </ConfirmContext.Provider>
    )
}
