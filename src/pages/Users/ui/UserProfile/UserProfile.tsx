import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './UserProfile.css'
import { useGetUserByIdQuery } from '@/features/users/api/usersApi'
import { useGetUserSnippetsQuery } from '@/features/snippets/api/snippetsApi'
import type { Tables } from '@/shared/config/supabase/api/types'
import { useToast } from '@/shared/ui/Toast/ToastProvider'
import { ArrowLeft } from 'lucide-react'
import { UserHeader } from '../UserHeader/UserHeader.tsx'
import { UserSnippets } from '../UserSnippets/UserSnippets.tsx'
import { Filters } from '@/shared/ui/Filters/ui/Filters'
import { LANGUAGES_OPTIONS, TAGS_OPTIONS } from '@/shared/constants/filters.ts';
import { SnippetModal } from '@/widgets/Snippets/SnippetModal/ui/SnippetModal'
import { useTranslation } from 'react-i18next'
import type { Option as FilterOption } from '@/shared/ui/Filters/ui/Filters'


export default function UserProfile(): React.ReactElement {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation('common')
    const { data: user, isLoading: isUserLoading } = useGetUserByIdQuery(id!, { skip: !id })

    const [query, setQuery] = useState('')
    const [language, setLanguage] = useState<string | null>(null)
    const [tags, setTags] = useState<string[]>([])

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isModalOpen, setModalOpen] = useState(false)

    const effectiveUserId = user?.id ?? id
    const { data: snippets = [], isLoading } = useGetUserSnippetsQuery(
        { userId: effectiveUserId!, query, language, tags },
        { skip: !effectiveUserId }
    )
    const { show } = useToast()

    const onCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            show('Код скопирован', { variant: 'info' })
        } catch {
            // ignore
        }
    }

    const clearFilters = () => { setQuery(''); setLanguage(null); setTags([]) }

    const openDetails = (s: Tables<'snippets'>) => {
        setSelectedId(s.id)
        setModalOpen(true)
    }
    const closeDetails = () => {
        setModalOpen(false)
        setSelectedId(null)
    }

    // Нормализуем опции для соответствия типам Filters.Option (label: string)
    const normalizedLanguageOptions: FilterOption[] = LANGUAGES_OPTIONS.map((o) => ({ value: (o as FilterOption).value, label: (o as FilterOption).label ?? '', labelKey: (o as FilterOption).labelKey }))
    const normalizedTagOptions: FilterOption[] = TAGS_OPTIONS.map((o) => ({ value: (o as FilterOption).value, label: (o as FilterOption).label ?? '', labelKey: (o as FilterOption).labelKey }))

    return (
        <div className='user-profile'>
            <button className='user-back' onClick={ () => navigate('/social') }>
                <ArrowLeft size={ 16 } />
                <span>{ t('user.back_to_community') }</span>
            </button>

            <UserHeader user={ user } isLoading={ isUserLoading } />

            <Filters
                query={ query }
                onQueryChange={ setQuery }
                language={ language }
                onLanguageChange={ setLanguage }
                tags={ tags }
                onTagsChange={ setTags }
                onClear={ clearFilters }
                languageOptions={ normalizedLanguageOptions }
                tagOptions={ normalizedTagOptions }
                labelsNs='common'
            />

            { (isUserLoading || !effectiveUserId) && <div className='user-loading'>Загрузка...</div> }
            { !isUserLoading && effectiveUserId && (
                <UserSnippets
                    snippets={ snippets as Tables<'snippets'>[] }
                    isLoading={ isLoading }
                    onSelect={ openDetails }
                    onCopy={ onCopy }
                />
            ) }

            { isModalOpen && selectedId && (
                <SnippetModal
                    mode='details'
                    snippetId={ selectedId }
                    onClose={ closeDetails }
                    hideEditActions={ true }
                />
            ) }
        </div>
    )
}
