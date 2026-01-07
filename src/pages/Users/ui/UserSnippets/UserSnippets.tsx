import React from 'react'
import type { Tables } from '@/shared/config/supabase/api/types.ts'
import { SnippetCard } from '@/widgets/Snippets/SnippetsList/ui/SnippetCard/SnippetCard.tsx'
import './UserSnippets.css'

interface Props {
  snippets: Tables<'snippets'>[]
  isLoading: boolean
  onSelect: (s: Tables<'snippets'>) => void
  onCopy: (code: string) => void
}

export const UserSnippets: React.FC<Props> = ({ snippets, isLoading, onSelect, onCopy }) => {
    return (
        <section className='user-snippets'>
            { isLoading && <div className='user-loading'>Загрузка сниппетов...</div> }
            { !isLoading && (
                <div className='user-grid'>
                    { snippets.map(s => (
                        <SnippetCard
                            key={ s.id }
                            snippet={ s }
                            onSelect={ () => onSelect(s) }
                            onCopy={ (code) => onCopy(code) }
                            onDelete={ () => { /* удаление чужих не разрешаем */ } }
                        />
                    )) }
                    { !snippets.length && (
                        <div className='user-empty'>Нет сниппетов по выбранным фильтрам</div>
                    ) }
                </div>
            ) }
        </section>
    )
}

