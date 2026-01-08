import { Button } from '@/shared/ui/Button/ui/button.tsx'
import type { Tables } from '@/shared/config/supabase/api/types.ts'
import { Trash2, Star, Copy, User as UserIcon } from 'lucide-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './SnippetCard.css'
import { useEffect, useState } from 'react'
import { supabase } from '@/shared/config/supabase/api/supabaseClient'
import { useGetFavoriteIdsQuery, useToggleFavoriteMutation } from '@/features/snippets/api/favoritesApi.ts'
import { useToast } from '@/shared/ui/Toast/ToastProvider.tsx'
import { useTranslation } from 'react-i18next'
import { useGetUserByIdQuery } from '@/features/users/api/usersApi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGetProfileIdQuery } from '@/features/users/api/usersApi'

interface SnippetCardProps {
  snippet: Tables<'snippets'>
  onSelect: (id: string) => void
  onCopy: (code: string, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

export const SnippetCard = ({ snippet, onSelect, onCopy, onDelete }: SnippetCardProps) => {
    const { data: favIds = [] } = useGetFavoriteIdsQuery()
    const [mutateToggle] = useToggleFavoriteMutation()
    const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null)
    const { show } = useToast()
    const { i18n } = useTranslation('common')
    const navigate = useNavigate()
    const location = useLocation()

    const { data: me } = useGetProfileIdQuery()
    const myId = me?.id

    const { data: author } = useGetUserByIdQuery(snippet.user_id as string, { skip: !snippet.user_id })
    const authorName = author?.user_name ?? author?.email ?? 'User'
    const getInitials = (name?: string | null): string | null => {
        if (!name) return null
        const parts = name.trim().split(/\s+/)
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    const authorInitials = getInitials(author?.user_name ?? author?.email ?? null)
    console.debug('SnippetCard debug:', { id: snippet.id, user_id: snippet.user_id, author })
    const onFavoritesPage = location.pathname.startsWith('/favorites')

    const serverFav = Array.isArray(favIds) ? favIds.includes(snippet.id) : false
    const displayedIsFav = optimisticFav !== null ? optimisticFav : serverFav

    const [authUid, setAuthUid] = useState<string | null>(null)
    useEffect(() => {
        let mounted = true
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!mounted) return
            setAuthUid(user?.id ?? null)
        }).catch(() => {})
        return () => { mounted = false }
    }, [])

    const ownerNorm = snippet.user_id ? String(snippet.user_id).toLowerCase().trim() : ''
    const currentNorm = (myId ?? authUid) ? String(myId ?? authUid).toLowerCase().trim() : ''
    const isOwn = Boolean(ownerNorm && currentNorm && ownerNorm === currentNorm)

    const showAuthorBadge = Boolean(
        ownerNorm &&
        currentNorm &&
        !isOwn &&
        (onFavoritesPage || serverFav)
    )

    // Переводы для тостов формируем напрямую через i18n.t с именованным ns и defaultValue.
    // Это гарантирует, что если namespace ещё не загружен, будет использован fallback-строка.

    const toggleFavClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const next = !(optimisticFav !== null ? optimisticFav : serverFav)
        setOptimisticFav(next)
        mutateToggle({ id: snippet.id, next })
            .unwrap()
            .then(() => {
                setOptimisticFav(null)
                if (next) {
                    const title = snippet.title ?? (i18n.language?.startsWith('ru') ? 'Сниппет' : 'Snippet')
                    const fallbackAdded = i18n.language?.startsWith('ru') ? `Добавлено в избранное: ${title}` : `Added to favorites: ${title}`
                    // сначала попробуем namespaced common key с defaultValue
                    const added = i18n.t('toasts.added_favorite_title', {
                        ns: 'common',
                        title,
                        defaultValue: i18n.t('snippets.favorites.added', { ns: 'translation', title, defaultValue: fallbackAdded }),
                    })
                    show(added, { variant: 'success', duration: 1500 })
                } else {
                    const title = snippet.title ?? (i18n.language?.startsWith('ru') ? 'Сниппет' : 'Snippet')
                    const fallbackRemoved = i18n.language?.startsWith('ru') ? `Убрано из избранного: ${title}` : `Removed from favorites: ${title}`
                    const removed = i18n.t('toasts.removed_favorite_title', {
                        ns: 'common',
                        title,
                        defaultValue: i18n.t('snippets.favorites.removed', { ns: 'translation', title, defaultValue: fallbackRemoved }),
                    })
                    show(removed, { variant: 'info', duration: 1500 })
                }
            })
            .catch(() => {
                // ошибка: отменяем оптимистичное значение
                setOptimisticFav(null)
                const fallbackErr = i18n.language?.startsWith('ru') ? 'Не удалось изменить избранное' : 'Failed to update favorites'
                const errMsg = i18n.t('toasts.error', { ns: 'common', defaultValue: i18n.t('snippets.favorites.error', { ns: 'translation', defaultValue: fallbackErr }) })
                show(errMsg, { variant: 'error' })
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
                </div>

                <div className={ `snippet-card__controls ${showAuthorBadge ? 'has-author' : ''}` }>
                    { showAuthorBadge && (
                        <span className='snippet-card__author-badge' title={ `Автор: ${authorName}` } onClick={ onAuthorClick } aria-label={ `Автор: ${authorName}` }>
                            <span className='snippet-card__author-icon-wrapper' aria-hidden>
                                { authorInitials ? (
                                    <span className='snippet-card__author-avatar'>{ authorInitials }</span>
                                ) : (
                                    <UserIcon size={ 10 } />
                                ) }
                            </span>
                        </span>
                    ) }

                    <div className='snippet-card__actions'>
                        <Button
                            className={ `snippet-card__action ${displayedIsFav ? 'snippet-card__action--fav' : 'snippet-card__action--fav-off'}` }
                            onClick={ (e) => { e.stopPropagation(); toggleFavClick(e) } }
                            title={ displayedIsFav ? 'Убрать из избранного' : 'В избранное' }
                        >
                            <Star size={ 16 } fill={ displayedIsFav ? '#facc15' : 'none' } color={ displayedIsFav ? '#facc15' : 'currentColor' } />
                        </Button>
                        <Button
                            className='snippet-card__action snippet-card__action--copy'
                            onClick={ (e) => { e.stopPropagation(); onCopy(snippet.code || '', e) } }
                            title='Копировать код'
                        >
                            <Copy size={ 16 } />
                        </Button>
                        <Button
                            className='snippet-card__action snippet-card__action--delete'
                            onClick={ (e) => { e.stopPropagation(); onDelete(snippet.id, e) } }
                            title='Удалить'
                        >
                            <Trash2 size={ 16 } />
                        </Button>
                    </div>
                </div>
            </div>

            <div className='snippet-card__gradient-border'></div>
        </div>
    )
}
