import React, { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import './ScrollTop.css'

const SHOW_AFTER = 200

export const ScrollTop: React.FC = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        let ticking = false
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY || document.documentElement.scrollTop
                    setVisible(y > SHOW_AFTER)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToTop = () => {
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
            window.scrollTo(0, 0)
        }
    }

    return (
        <button
            type='button'
            aria-label='Scroll to top'
            className={ `scroll-top ${visible ? 'is-visible' : ''}` }
            onClick={ scrollToTop }
        >
            <ChevronUp size={ 18 } />
        </button>
    )
}

export default ScrollTop

