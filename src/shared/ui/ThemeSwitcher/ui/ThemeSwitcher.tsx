import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Moon, Sun } from 'lucide-react'
import { toggleTheme, type Theme } from '../model/themeSlice'

interface RootState {
  theme: { theme: Theme }
}

export const ThemeSwitcher = () => {
    const dispatch = useDispatch()
    const current = useSelector((s: RootState) => s.theme.theme)

    // Применяем класс темы на <html> и сохраняем в localStorage
    useEffect(() => {
        const root = document.documentElement
        const nextIsDark = current === 'dark'

        // Временно отключаем transitions, чтобы избежать "рывков"
        root.classList.add('disable-transitions')

        // Применяем класс темы в следующем кадре
        requestAnimationFrame(() => {
            root.classList.toggle('dark', nextIsDark)
            root.setAttribute('data-theme', nextIsDark ? 'dark' : 'light')
            try { localStorage.setItem('app_theme', nextIsDark ? 'dark' : 'light') } catch {
                // localStorage может быть недоступен (например, в приватном режиме). Игнорируем ошибку
            }

            // Возвращаем transitions после короткой паузы
            setTimeout(() => {
                root.classList.remove('disable-transitions')
            }, 50)
        })
    }, [current])

    const onToggle = useCallback(() => {
        // Небольшая оптимизация: отключаем transitions до диспатча
        document.documentElement.classList.add('disable-transitions')
        dispatch(toggleTheme())
    }, [dispatch])

    return (
        <button
            type='button'
            className='nav-btn'
            onClick={ onToggle }
            aria-label={ current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }
            title={ current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }
        >
            { current === 'dark' ? <Sun size={ 20 } /> : <Moon size={ 20 } /> }
        </button>
    )
}
