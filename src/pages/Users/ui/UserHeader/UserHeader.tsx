import React, { useMemo } from 'react'
import type { Tables } from '@/shared/config/supabase/api/types.ts'
import './UserHeader.css'

interface Props {
  user?: Tables<'profiles'>
  isLoading?: boolean
}

export const UserHeader: React.FC<Props> = ({ user, isLoading = false }) => {
    const headerTags = useMemo(() => (user?.developer_type ? [user.developer_type] : []), [user])

    return (
        <header className='user-header'>
            <div className='user-header__main'>
                <div className='user-avatar'>{ user?.user_name?.[0]?.toUpperCase() ?? 'U' }</div>
                <div className='user-name'>{ user?.user_name ?? user?.email ?? (isLoading ? '...' : 'User') }</div>
            </div>
            <div className='user-meta'>
                { headerTags.map(t => (
                    <span key={ t } className='user-meta__tag'>{ t }</span>
                )) }
            </div>
            <div className='user-bio'>
                { user
                    ? (user.about && user.about.trim().length > 0
                        ? user.about
                        : 'Информация о пользователе не указана')
                    : (isLoading ? 'Загрузка профиля...' : 'Профиль не найден') }
            </div>
        </header>
    )
}

