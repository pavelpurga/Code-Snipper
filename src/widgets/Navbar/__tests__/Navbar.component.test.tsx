import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Navbar from '@/widgets/Navbar'

jest.mock('lucide-react', () => ({ Code2: (props: React.SVGProps<SVGSVGElement>) => (<svg data-testid='logo-icon' { ...props } />) }))
jest.mock('@/shared/ui/LangSwitcher/ui/LangSwither.tsx', () => ({ LangSwitcher: () => (<button aria-label='lang-switcher'>Lang</button>) }))
jest.mock('@/shared/ui/ThemeSwitcher/ui/ThemeSwitcher', () => ({ ThemeSwitcher: () => (<button aria-label='theme-switcher'>Theme</button>) }))
jest.mock('@/widgets/Profile/ui/Profile', () => ({ Profile: () => (<button aria-label='profile'>Profile</button>) }))

describe('Navbar', () => {
    it('renders logo and title', () => {
        render(<Navbar />)
        expect(screen.getByText('SnippetBox')).toBeInTheDocument()
        expect(screen.getByTestId('logo-icon')).toBeInTheDocument()
    })

    it('renders action controls (lang, theme, profile)', () => {
        render(<Navbar />)
        expect(screen.getByRole('button', { name: /lang-switcher/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /theme-switcher/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument()
    })
})
