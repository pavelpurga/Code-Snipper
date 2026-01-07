import React, { useMemo, useState } from 'react'
import './SocialPage.css'
import { useGetUsersQuery, useGetProfileIdQuery } from '@/features/users/api/usersApi'
import type { Tables } from '@/shared/config/supabase/api/types'
import { MultiSelect } from '@/shared/ui/MultiSelect/ui/MultiSelect'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const DEV_TYPES = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'fullstack', label: 'Fullstack' },
    { value: 'devops', label: 'DevOps' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'data', label: 'Data' },
    { value: 'qa', label: 'QA' },
    { value: 'pm', label: 'PM' },
    { value: 'designer', label: 'Designer' },
    { value: 'other', label: 'Other' },
] as const

function SocialCommunityPage(): React.ReactElement {
    const { t } = useTranslation(['translation', 'common'])
    const { data: users = [], isLoading } = useGetUsersQuery()
    const { data: me } = useGetProfileIdQuery()
    const [filterTypes, setFilterTypes] = useState<string[]>([])

    const options = useMemo(() => DEV_TYPES.slice(), [])

    const baseList: Tables<'profiles'>[] = useMemo(() => {
        const rows = (users as Tables<'profiles'>[])
        const myId = me?.id
        return myId ? rows.filter(u => u.id !== myId) : rows
    }, [users, me])

    const visible: Tables<'profiles'>[] = useMemo(() => {
        if (!filterTypes.length) return baseList
        return baseList.filter(u => filterTypes.includes((u.developer_type ?? 'other') as string))
    }, [baseList, filterTypes])

    return (
        <div className='social-page'>
            <div className='social-page__header'>
                <h1 className='social-title'>{ t('social_page.title', 'Сообщество') }</h1>
                <div className='social-filters'>
                    <div className='filter-select'>
                        <div className='filter-select-header'><span>{ t('social_page.dev_types', 'Типы разработчиков') }</span></div>
                        <MultiSelect
                            options={ options }
                            value={ filterTypes }
                            onChange={ setFilterTypes }
                            placeholder={ t('social_page.all_types', 'Все типы') }
                        />
                    </div>
                </div>
            </div>

            { isLoading && <div className='social-loading'>{ t('social_page.loading', 'Загрузка...') }</div> }

            { !isLoading && (
                <div className='social-grid'>
                    { visible.map((u) => (
                        <Link key={ u.id } to={ `/users/${u.id}` } className='social-card'>
                            <div className='social-card__header'>
                                <div className='social-card__avatar' aria-hidden>
                                    { u.user_name?.[0]?.toUpperCase() ?? 'U' }
                                </div>
                                <div className='social-card__title'>{ u.user_name ?? u.email ?? 'User' }</div>
                            </div>
                            <div className='social-card__meta'>
                                <span className='social-card__badge'>{ u.developer_type ?? 'other' }</span>
                            </div>
                        </Link>
                    )) }
                    { !visible.length && (
                        <div className='social-empty'>{ t('social_page.empty', 'Нет пользователей по выбранным типам') }</div>
                    ) }
                </div>
            ) }
        </div>
    )
}

export default SocialCommunityPage