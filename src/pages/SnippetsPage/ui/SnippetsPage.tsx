import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { SnippetsList } from '@/widgets/Snippets'
import { SnippetModal } from '@/widgets/Snippets/SnippetModal/ui/SnippetModal'
import { Filters } from '@/shared/ui/Filters/ui/Filters'
import { LANGUAGES_OPTIONS, TAGS_OPTIONS } from '@/shared/constants/filters'

const SnippetsPage = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['translation','common'])

    // 🔹 filters
    const [query, setQuery] = useState('')
    const [language, setLanguage] = useState<string | null>(null)
    const [tags, setTags] = useState<string[]>([])

    // 🔹 modal state
    const [modalMode, setModalMode] = useState<'create' | 'details' | null>(null)
    const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null)

    // 🔹 handlers
    const openCreateModal = () => {
        setSelectedSnippetId(null)
        setModalMode('create')
    }

    const openDetailsModal = (id: string) => {
        setSelectedSnippetId(id)
        setModalMode('details')
    }

    const closeModal = () => {
        setModalMode(null)
        setSelectedSnippetId(null)
    }

    // 🔹 after mutations
    const handleSnippetCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['snippets'] })
        closeModal()
    }

    const handleSnippetUpdated = () => {
        queryClient.invalidateQueries({ queryKey: ['snippets'] })
    }

    return (
        <>
            <Filters
                query={ query }
                language={ language }
                tags={ tags }
                onQueryChange={ setQuery }
                onLanguageChange={ setLanguage }
                onTagsChange={ setTags }
                onClear={ () => { setQuery(''); setLanguage(null); setTags([]) } }
                languageOptions={ LANGUAGES_OPTIONS }
                tagOptions={ TAGS_OPTIONS }
                labels={ {
                    hint: t('snippets.filter_hint', 'возможно вам это поможет...'),
                    searchPlaceholder: t('snippets.filters.placeholder', 'Поиск сниппетов...'),
                    language: t('snippets.filters.language', 'Язык'),
                    tags: t('snippets.filters.tags', 'Теги'),
                    clear: t('snippets.filters.clear', 'Очистить'),
                } }
            />

            { /* 🔹 create button */ }
            <div className='mb-4 flex justify-end'>
                <button
                    onClick={ openCreateModal }
                    className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition'
                >
                    { t('snippets.create_modal.actions.create', '+ Создать сниппет') }
                </button>
            </div>

            <SnippetsList
                query={ query }
                language={ language }
                tags={ tags }
                onSelect={ openDetailsModal }
            />

            { /* 🔹 modal */ }
            { modalMode && (
                <SnippetModal
                    mode={ modalMode }
                    snippetId={ selectedSnippetId ?? undefined }
                    onClose={ closeModal }
                    onSnippetCreated={ handleSnippetCreated }
                    onSnippetUpdated={ handleSnippetUpdated }
                />
            ) }
        </>
    )
}

export default SnippetsPage