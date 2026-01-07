import React, { useEffect, useRef, useCallback } from 'react'
import './CursorTrail.css'

type Point = { x: number; y: number; life: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number }

export const CursorTrail: React.FC<{ collisionSelector?: string; edgeThreshold?: number }> = ({ collisionSelector = '.auth-form__container', edgeThreshold = 8 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const pointsRef = useRef<Point[]>([])
    const particlesRef = useRef<Particle[]>([])

    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        pointsRef.current = pointsRef.current.map(p => ({ ...p, life: p.life - 0.02 })).filter(p => p.life > 0)
        for (const p of pointsRef.current) {
            const radius = 18 * p.life
            const alpha = Math.max(0, Math.min(0.35, p.life))
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius)
            grad.addColorStop(0, `rgba(100,108,255,${alpha})`)
            grad.addColorStop(1, 'rgba(100,108,255,0)')
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
            ctx.fill()
        }
        particlesRef.current = particlesRef.current.map(pt => ({
            ...pt,
            x: pt.x + pt.vx,
            y: pt.y + pt.vy,
            vx: pt.vx * 0.94,
            vy: pt.vy * 0.94 + 0.08,
            life: pt.life - 0.02,
        })).filter(pt => pt.life > 0)
        for (const pt of particlesRef.current) {
            const r = 3 + 6 * pt.life
            const alpha = Math.max(0, Math.min(0.45, pt.life))
            ctx.fillStyle = `rgba(154,77,255,${alpha})`
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
            ctx.fill()
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const parent = canvas.parentElement as HTMLElement
        const resize = () => {
            const rect = parent.getBoundingClientRect()
            canvas.width = Math.floor(rect.width)
            canvas.height = Math.floor(rect.height)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(parent)

        const onMove = (e: MouseEvent) => {
            const parentRect = parent.getBoundingClientRect()
            const x = e.clientX - parentRect.left
            const y = e.clientY - parentRect.top
            if (x >= 0 && y >= 0 && x <= parentRect.width && y <= parentRect.height) {
                const collideEl = document.querySelector(collisionSelector) as HTMLElement | null
                let collidedEdge = false
                if (collideEl) {
                    const cr = collideEl.getBoundingClientRect()
                    const cx = e.clientX
                    const cy = e.clientY
                    const inside = cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom
                    if (inside) {
                        const distLeft = Math.abs(cx - cr.left)
                        const distRight = Math.abs(cr.right - cx)
                        const distTop = Math.abs(cy - cr.top)
                        const distBottom = Math.abs(cr.bottom - cy)
                        const nearEdge = Math.min(distLeft, distRight, distTop, distBottom) <= edgeThreshold
                        if (nearEdge) collidedEdge = true
                    }
                }
                if (collidedEdge) {
                    const count = 20
                    for (let i = 0; i < count; i++) {
                        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8
                        const speed = 3.2 + Math.random() * 3.8
                        particlesRef.current.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 })
                    }
                } else {
                    pointsRef.current.push({ x, y, life: 1 })
                }
            }
        }
        document.addEventListener('mousemove', onMove, { passive: true })

        let raf = 0
        const tick = () => {
            drawFrame()
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            ro.disconnect()
            document.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(raf)
        }
    }, [collisionSelector, edgeThreshold, drawFrame])

    return (
        <div className='cursor-trail'>
            <canvas ref={ canvasRef } className='cursor-trail__canvas' aria-hidden />
        </div>
    )
}

export default CursorTrail
