import { useEffect, useRef, useState } from 'react'

export type ChartCardProps = {
  title: string
  data: number[]
  dates: string[]
  currency: string
}

export function ChartCard({ title, data, dates, currency }: ChartCardProps) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const [fixedIdx, setFixedIdx] = useState<number | null>(null)

    // Адаптивная ширина графика по ширине контейнера
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [graphWidth, setGraphWidth] = useState<number>(260)
    useEffect(() => {
        const measure = () => {
            const el = containerRef.current
            if (!el) return
            const cs = getComputedStyle(el)
            const padL = parseFloat(cs.paddingLeft) || 0
            const padR = parseFloat(cs.paddingRight) || 0
            const w = Math.max(240, el.clientWidth - padL - padR)
            setGraphWidth(w)
        }
        measure()
        const ro = new ResizeObserver(() => measure())
        if (containerRef.current) ro.observe(containerRef.current)
        window.addEventListener('resize', measure)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [])

    // Размеры соответствуют реальному отрисованному SVG (без CSS-скейлинга)
    const width = Math.max(240, graphWidth)
    const height = 220
    const padding = 8
    const w = width - padding * 2
    const h = height - padding * 2

    // Санитизируем входные данные: заменяем нечисловые значения на предыдущее валидное или 0
    const n = Array.isArray(data) ? data.length : 0
    const cleaned: number[] = Array.from({ length: n }, (_, i) => {
        const v = data[i]
        if (Number.isFinite(v)) return v as number
        if (i > 0 && Number.isFinite(data[i - 1])) return data[i - 1] as number
        return 0
    })
    const finiteValues = cleaned.filter((v) => Number.isFinite(v))
    const hasValid = finiteValues.length > 0

    const min = hasValid ? Math.min(...finiteValues) : 0
    const maxBase = hasValid ? Math.max(...finiteValues) : 1
    const max = maxBase === min ? min + 1 : maxBase
    const range = max - min

    // Точки ломаной: отдельный случай для n === 1, чтобы не делить на 0
    const points = hasValid
        ? (n === 1
            ? (() => {
                const y = height - padding - ((cleaned[0] - min) / range) * h
                return `${padding},${y} ${width - padding},${y}`
            })()
            : cleaned.map((v, i) => {
                const x = (i / (n - 1)) * w + padding
                const y = height - padding - ((v - min) / range) * h
                return `${x},${y}`
            }).join(' ')
        )
        : `${padding},${height / 2} ${width - padding},${height / 2}`

    const last = hasValid ? cleaned[n - 1] : null

    const activeIdx = fixedIdx ?? hoverIdx
    const activeVal = activeIdx != null && activeIdx >= 0 && activeIdx < n ? cleaned[activeIdx] : last
    const activeDate = activeIdx != null && activeIdx >= 0 && activeIdx < dates.length
        ? dates[activeIdx]
        : (dates[dates.length - 1] || '')

    // Вычисление индекса по координате X относительно SVG
    const indexFromClientX = (svg: SVGSVGElement, clientX: number) => {
        if (!hasValid || n === 0) return null
        const rect = svg.getBoundingClientRect()
        const denom = Math.max(1, rect.width - padding * 2)
        const x = clientX - rect.left - padding
        const ratio = Math.max(0, Math.min(1, x / denom))
        return Math.round(ratio * Math.max(0, n - 1))
    }

    const handleMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
        const idx = indexFromClientX(e.currentTarget, e.clientX)
        if (idx == null) return
        setHoverIdx(idx)
    }
    const handleLeave = () => setHoverIdx(null)
    const handleClick: React.MouseEventHandler<SVGSVGElement> = (e) => {
        const idx = indexFromClientX(e.currentTarget, e.clientX)
        if (idx == null) return
        setFixedIdx((prev) => (prev === idx ? null : idx))
    }

    // Touch support для мобильных
    const handleTouchStart: React.TouchEventHandler<SVGSVGElement> = (e) => {
        const touch = e.touches[0]
        if (!touch) return
        const idx = indexFromClientX(e.currentTarget, touch.clientX)
        if (idx == null) return
        setHoverIdx(idx)
        setFixedIdx(idx)
    }
    const handleTouchMove: React.TouchEventHandler<SVGSVGElement> = (e) => {
        const touch = e.touches[0]
        if (!touch) return
        const idx = indexFromClientX(e.currentTarget, touch.clientX)
        if (idx == null) return
        setHoverIdx(idx)
    }
    const handleTouchEnd: React.TouchEventHandler<SVGSVGElement> = () => {
    // сохраняем последний fixedIdx; можно сбросить hover для чистоты
        setHoverIdx(null)
    }

    let markerX: number | null = null
    let markerY: number | null = null
    if (hasValid && activeIdx != null && activeIdx >= 0 && activeIdx < n) {
        markerX = n === 1 ? padding : (activeIdx / (n - 1)) * w + padding
        const v = cleaned[activeIdx]
        markerY = height - padding - ((v - min) / range) * h
    }

    return (
        <div className='about-card' ref={ containerRef }>
            <div className='about-card__header'>
                <span className='about-card__title'>{ title }</span>
                { /* Объединяем дату и курс в одну строку для удобства */ }
                <span className='about-card__value'>
                    { activeDate ? `${activeDate} · ` : '' }
                    { activeVal != null ? activeVal.toFixed(2) : '—' } { currency }
                </span>
            </div>
            <svg
                width={ width }
                height={ height }
                className='about-card__chart'
                aria-hidden
                onMouseMove={ handleMove }
                onMouseLeave={ handleLeave }
                onClick={ handleClick }
                onTouchStart={ handleTouchStart }
                onTouchMove={ handleTouchMove }
                onTouchEnd={ handleTouchEnd }
            >
                <polyline fill='none' stroke='var(--primary, #646cff)' strokeWidth='2' points={ points } />
                { markerX != null && markerY != null && Number.isFinite(markerY) && Number.isFinite(markerX) && (
                    <g>
                        <line x1={ markerX } y1={ padding } x2={ markerX } y2={ height - padding } stroke='rgba(100,108,255,0.3)' />
                        <circle cx={ markerX } cy={ markerY } r='3.5' fill='var(--primary, #646cff)' />
                    </g>
                ) }
            </svg>
        </div>
    )
}
