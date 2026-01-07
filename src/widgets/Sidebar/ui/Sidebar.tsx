import React, { useEffect, useRef, useState } from 'react';
import {
    Code2,
    Star,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ContactIcon,
    Info,
    Linkedin,
    Github,
    Mail,
    Send,
    Globe
} from 'lucide-react';
import './Sidebar.css';
import { supabase } from '@/shared/config/supabase/api/supabaseClient.ts';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/shared/ui/Toast/ToastProvider'
import { useConfirm } from '@/shared/ui/Confirm/ConfirmProvider'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/app/providers/store/store'
import { toggleSidebar, closeSidebar } from '@/app/providers/store/store'

interface SidebarProps {
    isCollapsed?: boolean,
    onToggle?: () => void,
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, isCollapsed, onToggle }: SidebarProps) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { show } = useToast()
    const { confirm } = useConfirm()
    const dispatch = useDispatch()
    const isOpen = useSelector((s: RootState) => s.sidebar.isOpen)

    const [contactsOpen, setContactsOpen] = useState(false)
    const [contactsRendered, setContactsRendered] = useState(false)
    const contactsRef = useRef<HTMLDivElement | null>(null)

    const collapsed = !!isCollapsed
    const handleToggle = () => {
        if (onToggle) onToggle()
        else dispatch(toggleSidebar())
    }

    const openContacts = () => {
        if (!contactsRendered) setContactsRendered(true)
        requestAnimationFrame(() => setContactsOpen(true))
    }
    const closeContacts = () => {
        setContactsOpen(false)
        setTimeout(() => setContactsRendered(false), 160)
    }
    const toggleContacts = () => (contactsRendered && contactsOpen) ? closeContacts() : openContacts()

    useEffect(() => {
        if (!contactsRendered) return
        const onDocClick = (e: MouseEvent) => {
            const root = contactsRef.current
            if (!root) return
            if (!root.contains(e.target as Node)) closeContacts()
        }
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeContacts() }
        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [contactsRendered])

    const NAV_ITEMS = [
        { icon: Code2, label: t('sidebar.snippets'), path: '/snippets' },
        { icon: Star, label: t('sidebar.favorites'), path: '/favorites' },
        { icon: Globe, label: t('sidebar.social'), path: '/social' },
        { icon: Info, label: t('sidebar.about'), path: '/about' },
    ];

    const CONTACTS = [
        { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/pavel-petrokas/' },
        { icon: Github, label: 'GitHub', href: 'https://github.com/pavelpurga' },
        { icon: Mail, label: 'Email', href: 'pashapetrokas@gmail.com' },
        { icon: Send, label: 'TG', href: 'https://t.me/Pablberg' },
    ] as const;

    const onContactClick = (c: typeof CONTACTS[number], e: React.MouseEvent) => {
        if (c.label === 'Email') {
            e.preventDefault()
            const email = c.href.startsWith('mailto:') ? c.href.replace(/^mailto:/, '') : c.href
            navigator.clipboard?.writeText(email).then(() => show(t('toasts.copied'), { variant: 'success', duration: 1800 }))
        }
    }

    const handleLogout = async () => {
        const ok = await confirm({
            title: t('confirmations.logout_title'),
            description: t('confirmations.logout_text'),
            confirmText: t('common.yes'),
            cancelText: t('common.no'),
            variant: 'danger',
        })
        if (!ok) return
        const { error } = await supabase.auth.signOut();
        if (!error) {
            show(t('toasts.success'), { variant: 'info' })
            navigate('/login');
            dispatch(closeSidebar())
        }
    };

    return (
        <>
            { isOpen && <div className='sidebar__overlay' onClick={ () => dispatch(closeSidebar()) } aria-hidden /> }
            <aside key={ i18n.language } className={ `sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''} ${className}` }>

                <nav className='sidebar__nav' onClick={ () => dispatch(closeSidebar()) }>
                    { NAV_ITEMS.map((item) => (
                        <NavLink
                            key={ item.path }
                            to={ item.path }
                            className={ ({ isActive }) =>
                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                            }
                            title={ collapsed ? item.label : '' }
                        >
                            <item.icon size={ 20 } className='sidebar__icon' />
                            <span className='sidebar__link-text'>{ item.label }</span>
                        </NavLink>
                    )) }
                </nav>

                <div className='sidebar__footer' ref={ contactsRef }>
                    { /* Кнопка открытия поповера контактов */ }
                    <div className='sidebar__contacts-trigger'>
                        <button
                            className='sidebar__link'
                            onClick={ toggleContacts }
                            aria-expanded={ contactsRendered && contactsOpen }
                            title={ collapsed ? t('sidebar.contacts', { defaultValue: 'Контакты' }) : '' }
                        >
                            <ContactIcon size={ 20 } className='sidebar__icon' />
                            <span className='sidebar__link-text'>{ t('sidebar.contacts', { defaultValue: 'Контакты' }) }</span>
                        </button>

                        { contactsRendered && (
                            <div className={ `sidebar__popover ${contactsOpen ? 'is-open' : 'is-closing'}` } role='dialog' aria-label={ t('sidebar.contacts', { defaultValue: 'Контакты' }) }>
                                { CONTACTS.map((c) => (
                                    <a
                                        key={ c.label }
                                        href={ c.label === 'Email' ? `mailto:${c.href}` : c.href }
                                        className='sidebar__popover-link'
                                        target={ c.label === 'Email' ? undefined : '_blank' }
                                        rel={ c.label === 'Email' ? undefined : 'noopener noreferrer' }
                                        title={ c.label }
                                        onClick={ (e) => onContactClick(c, e) }
                                    >
                                        <c.icon size={ 16 } />
                                        { !collapsed && <span>{ c.label }</span> }
                                    </a>
                                )) }
                            </div>
                        ) }
                    </div>

                    { /* Разделитель перед Logout */ }
                    <div className='sidebar__divider'></div>

                    <button className='sidebar__link sidebar__logout' onClick={ handleLogout } title={ t('sidebar.logout', { defaultValue: 'Выйти' }) }>
                        <LogOut size={ 20 } className='sidebar__icon' />
                        <span className='sidebar__link-text'>{ t('sidebar.logout', { defaultValue: 'Выйти' }) }</span>
                    </button>
                    <div className='sidebar__divider'></div>
                    <button
                        className='sidebar__toggle-btn'
                        onClick={ handleToggle }
                        aria-label={ collapsed ? t('sidebar.expand', { defaultValue: 'Раскрыть' }) : t('sidebar.collapse', { defaultValue: 'Свернуть' }) }
                    >
                        { collapsed ? <ChevronRight size={ 20 } /> : <ChevronLeft size={ 20 } /> }
                    </button>
                </div>
            </aside>
        </>
    );
};