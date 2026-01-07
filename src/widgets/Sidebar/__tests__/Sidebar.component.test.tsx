import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import Sidebar from '@/widgets/Sidebar'

jest.mock('@/shared/ui/Toast/ToastProvider', () => ({ useToast: () => ({ show: jest.fn() }) }))
jest.mock('@/shared/ui/Confirm/ConfirmProvider', () => ({ useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(true) }) }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: unknown) => String(k), i18n: { language: 'ru' } }) }))
jest.mock('@/shared/config/supabase/api/supabaseClient', () => ({ supabase: { auth: { signOut: jest.fn().mockResolvedValue({ error: null }) } } }))

jest.mock('react-router-dom', () => {
    return {
        NavLink: (props: Record<string, unknown> & { className?: string; children?: React.ReactNode; to?: string; href?: string }) => {
            const { className, children, to, href, ...rest } = props
            let cls = ''
            if (typeof className === 'function') {
                cls = (className as (args: { isActive: boolean; isPending: boolean; isTransitioning?: boolean }) => string)({
                    isActive: false,
                    isPending: false,
                    isTransitioning: false,
                })
            } else if (typeof className === 'string') {
                cls = className
            }
            const anchorProps: Record<string, unknown> = { ...rest, className: cls }
            const hrefValue = typeof href === 'string' ? href : (typeof to === 'string' ? to : undefined)
            if (hrefValue) anchorProps.href = hrefValue
            return React.createElement('a', anchorProps, children)
        },
        useNavigate: () => jest.fn(),
    }
})

describe('Sidebar component', () => {
    it('closes contacts popover on Escape', async () => {
        render(<Sidebar isCollapsed={ false } onToggle={ () => {} } />)
        const btn = screen.getByText('sidebar.contacts')
        fireEvent.click(btn)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        fireEvent.keyDown(document, { key: 'Escape' })
        await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
    })

    it('closes contacts popover on outside click', async () => {
        render(<Sidebar isCollapsed={ false } onToggle={ () => {} } />)
        const btn = screen.getByText('sidebar.contacts')
        fireEvent.click(btn)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        fireEvent.mouseDown(document.body)
        await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
    })

    it('when collapsed, hides link text and uses title attribute', () => {
        render(<Sidebar isCollapsed={ true } onToggle={ () => {} } />)
        const links = screen.getAllByRole('link')
        expect(links.length).toBeGreaterThan(0)
        for (const a of links) {
            expect(a).toHaveAttribute('title')
        }
    })
})
