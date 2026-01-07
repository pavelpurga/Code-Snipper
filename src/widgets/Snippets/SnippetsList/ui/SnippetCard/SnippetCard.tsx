import { Button } from '@/shared/ui/Button/ui/button.tsx'
import type { Tables } from '@/shared/config/supabase/api/types.ts'
import { Trash2, Star, Copy, User as UserIcon } from 'lucide-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './SnippetCard.css'
import { useEffect, useState } from 'react'
import { useGetFavoriteIdsQuery, useToggleFavoriteMutation } from '@/features/snippets/api/favoritesApi.ts'
import { useToast } from '@/shared/ui/Toast/ToastProvider.tsx'
import { useGetProfileIdQuery, useGetUserByIdQuery } from '@/features/users/api/usersApi'
import { useNavigate } from 'react-router-dom'

interface SnippetCardProps {
  snippet: Tables<'snippets'>
  onSelect: (id: string) => void
  onCopy: (code: string, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

export const SnippetCard = ({ snippet, onSelect, onCopy, onDelete }: SnippetCardProps) => {
    const { data: favIds = [] } = useGetFavoriteIdsQuery()
    const [mutateToggle] = useToggleFavoriteMutation()
    const [isFav, setIsFav] = useState<boolean>(() => favIds.includes(snippet.id))
    const { show } = useToast()
    const navigate = useNavigate()

    // Текущий пользователь
    const { data: me } = useGetProfileIdQuery()
    const myId = me?.id

    // Профиль автора сниппета (только если нужно)
    const isForeign = !!snippet.user_id && myId && snippet.user_id !== myId
    const { data: author } = useGetUserByIdQuery(snippet.user_id as string, { skip: !isForeign })
    const authorName = author?.user_name ?? author?.email ?? 'User'

    // Если ids обновились из запроса (например, после инвалидации), мягко синхронизируем локальный стейт
    useEffect(() => {
    // только если серверное значение отличается от локального и локально сейчас нет перехода
        const serverFav = favIds.includes(snippet.id)
        if (serverFav !== isFav) setIsFav(serverFav)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favIds.join('|'), snippet.id])

    const toggleFavClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const next = !isFav
        setIsFav(next)
        mutateToggle({ id: snippet.id, next })
            .unwrap()
            .then(() => {
                if (next) {
                    show(`Добавлено в избранное: ${snippet.title || 'Сниппет'}`, { variant: 'success', duration: 1500 })
                } else {
                    show(`Убрано из избранного: ${snippet.title || 'Сниппет'}`, { variant: 'info', duration: 1500 })
                }
            })
            .catch(() => {
                setIsFav(!next)
                show('Не удалось изменить избранное', { variant: 'error' })
            })
    }

    const onAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (snippet.user_id) {
            navigate(`/users/${snippet.user_id}`)
        }
    }

    return (
        <div className='snippet-card' onClick={ () => onSelect(snippet.id) }>
            <div className='snippet-card__header'>
                <div className='snippet-card__tags'>
                    { (snippet.tags ?? []).map((tag) => (
                        <span key={ tag } className='snippet-card__tag'>#{ tag }</span>
                    )) }
                </div>
                <div className='snippet-card__language'>
                    <span className='language-badge'>{ snippet.language }</span>
                </div>
            </div>

            <div className='snippet-card__content'>
                <h3 className='snippet-card__title'>{ snippet.title }</h3>
                <p className='snippet-card__description'>{ snippet.description || 'Без описания' }</p>
            </div>

            <div className='snippet-card__preview'>
                <SyntaxHighlighter
                    language={ snippet.language || 'text' }
                    style={ vs2015 }
                    customStyle={ {
                        margin: 0,
                        padding: '0.5rem',
                        background: 'transparent',
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: '100%',
                    } }
                    showLineNumbers={ false }
                    wrapLines={ true }
                    PreTag='div'
                    codeTagProps={ { style: { display: 'block', whiteSpace: 'pre', overflow: 'hidden' } } }
                >
                    { (snippet.code || '// No code provided') }
                </SyntaxHighlighter>
                { snippet.code && snippet.code.length > 150 && (
                    <span className='snippet-card__more'>...</span>
                ) }
            </div>

            <div className='snippet-card__footer'>
                <div className='snippet-card__meta'>
                    <span className='snippet-card__date'>
                        { snippet.created_at
                            ? new Date(snippet.created_at).toLocaleDateString('ru-RU')
                            : 'Дата неизвестна' }
                    </span>
                    { isFav && isForeign && (
                        <span className='snippet-card__author-badge' title={ `Автор: ${authorName}` } onClick={ onAuthorClick }>
                            <UserIcon size={ 14 } />
                            <span className='snippet-card__author-text'>{ authorName }</span>
                        </span>
                    ) }
                </div>
                <div className='snippet-card__actions'>
                    <Button
                        className={ `snippet-card__action ${isFav ? 'snippet-card__action--fav' : 'snippet-card__action--fav-off'}` }
                        onClick={ toggleFavClick }
                        title={ isFav ? 'Убрать из избранного' : 'В избранное' }
                    >
                        <Star size={ 16 } fill={ isFav ? '#facc15' : 'none' } color={ isFav ? '#facc15' : 'currentColor' } />
                    </Button>
                    <Button
                        className='snippet-card__action snippet-card__action--copy'
                        onClick={ (e) => onCopy(snippet.code || '', e) }
                        title='Копировать код'
                    >
                        <Copy size={ 16 } />
                    </Button>
                    <Button
                        className='snippet-card__action snippet-card__action--delete'
                        onClick={ (e) => onDelete(snippet.id, e) }
                        title='Удалить'
                    >
                        <Trash2 size={ 16 } />
                    </Button>
                </div>
            </div>

            <div className='snippet-card__gradient-border'></div>
        </div>
    )
}
