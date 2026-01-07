import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetFavoriteSnippetsQuery } from '@/features/snippets/api/favoritesApi'
import { SnippetsList } from '@/widgets/Snippets'
import { SnippetModal } from '@/widgets/Snippets/SnippetModal/ui/SnippetModal'


const FavoritesPage = () => {
    const { t } = useTranslation(['translation'])
    const { data: items = [] } = useGetFavoriteSnippetsQuery()

    const [selectedId, setSelectedId] = useState<string | null>(null)

    return (
        <div className='container mx-auto px-4 py-6'>
            <h1 className='text-2xl font-bold mb-4'>{ t('favorites_page.title', 'Избранные сниппеты') }</h1>
            <SnippetsList
                items={ items }
                onSelect={ (id) => setSelectedId(id) }
                emptyMessage={ <div>{ t('favorites_page.empty', 'Нет избранных сниппетов') }</div> }
            />

            { selectedId && (
                <SnippetModal
                    mode='details'
                    snippetId={ selectedId }
                    onClose={ () => setSelectedId(null) }
                />
            ) }
        </div>
    )
}

export default FavoritesPage