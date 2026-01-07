import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import './MultiSelect.css'
import { useTranslation } from 'react-i18next'

interface Option {
    value: string
    label?: string
    labelKey?: string
    group?: string
    icon?: string
    category?: string
}

interface MultiSelectProps {
    options: Option[]
    value: string[]
    onChange: (vals: string[]) => void
    placeholder?: string
    className?: string
    isMulti?: boolean
    disabled?: boolean
}

export const MultiSelect = memo(({
    options,
    value,
    onChange,
    placeholder = 'Выберите...',
    className = '',
    isMulti = true,
    disabled = false,
}: MultiSelectProps) => {
    const { t } = useTranslation(['translation', 'common'])
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const toggleOption = useCallback((optionValue: string) => {
        if (disabled) return
        if (isMulti) {
            // Специальная логика для "Все" (__all__)
            if (optionValue === '__all__') {
                onChange(['__all__'])
                setOpen(false)
                return
            }
            const withoutAll = value.filter(v => v !== '__all__')
            const exists = withoutAll.includes(optionValue)
            const next = exists ? withoutAll.filter(v => v !== optionValue) : [...withoutAll, optionValue]
            onChange(next)
        } else {
            onChange([optionValue])
            setOpen(false)
        }
    }, [isMulti, value, onChange, disabled])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selected = options.filter(o => value.includes(o.value))
    const getLabel = (o: Option) => {
        if (o.label) return o.label
        if (o.labelKey) return t(o.labelKey)
        return o.value
    }
    const baseText = selected.slice(0, 2).map(o => getLabel(o)).join(', ')
    const displayText = selected.length
        ? (selected.length > 2 ? `${baseText}, ...` : baseText)
        : placeholder
    const showBadge = selected.length > 2

    return (
        <div ref={ containerRef } className={ `multiselect-container relative ${open ? 'is-open' : ''} ${className}` }>
            <button
                type='button'
                disabled={ disabled }
                onClick={ () => setOpen(o => !o) }
                className='multiselect-trigger'
            >
                <span className='truncate'>{ displayText }</span>
                <ChevronDown size={ 16 } />
            </button>

            { showBadge && (
                <div className='multiselect-badge-container'>
                    <div className='multiselect-badge' aria-label={ `Выбрано: ${selected.length}` }>{ selected.length }</div>
                    <div className='multiselect-badge-tooltip'>
                        <div className='multiselect-badge-title'>{ t('common.selected', { defaultValue: 'Выбранные:' }) }</div>
                        <ul className='multiselect-badge-list'>
                            { selected.map(s => (
                                <li key={ s.value } className='multiselect-badge-item'>{ getLabel(s) }</li>
                            )) }
                        </ul>
                    </div>
                </div>
            ) }

            { open && (
                <div className='multiselect-dropdown'>
                    { options.map(opt => (
                        <div
                            key={ opt.value }
                            onClick={ () => toggleOption(opt.value) }
                            className={ `multiselect-option ${value.includes(opt.value) ? 'active' : ''}` }
                            data-category={ opt.category ?? '' }
                            data-group={ opt.group ?? '' }
                        >
                            { isMulti && value.includes(opt.value) && <Check size={ 12 } /> }
                            { opt.category && opt.value !== '__all__' && (
                                <span className='multiselect-chip' aria-hidden='true'>{ opt.category }</span>
                            ) }
                            <span className='multiselect-label'>{ getLabel(opt) }</span>
                        </div>
                    )) }
                </div>
            ) }
        </div>
    )
})
