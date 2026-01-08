import { Code2 } from 'lucide-react';
import './SnippetsList.css';
import { memo, useEffect, useMemo, useState } from 'react';
import { useDeleteSnippetMutation, useGetSnippetsPageQuery, snippetsApi } from '@/features/snippets/api/snippetsApi.ts';
import { SnippetCard } from '../SnippetCard/SnippetCard.tsx';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/providers/store/store.tsx'
import type { Tables } from '@/shared/config/supabase/api/types.ts';
import { useToast } from '@/shared/ui/Toast/ToastProvider.tsx'
import { useConfirm } from '@/shared/ui/Confirm/ConfirmProvider.tsx'
import { favoritesApi } from '@/features/snippets/api/favoritesApi.ts'
import { useTranslation } from 'react-i18next'

interface SnippetsListProps {
    onSelect: (id: string) => void
    emptyMessage?: React.ReactNode;
    query?: string;
    language?: string | null;
    tags?: string[];
    items?: Tables<'snippets'>[];
}

export const SnippetsList = memo(({ onSelect, emptyMessage, query = '', language, tags, items: forcedItems }: SnippetsListProps) => {
    const tagsKey = useMemo(() => (tags && tags.length ? [...tags].sort().join('|') : ''), [tags])
    const filtersKey = useMemo(() => JSON.stringify({ q: query, l: language ?? '', t: tagsKey }), [query, language, tagsKey])

    const [pageByKey, setPageByKey] = useState<Record<string, number>>({})
    const page = pageByKey[filtersKey] ?? 1
    const goToPage = (p: number) => setPageByKey(prev => ({ ...prev, [filtersKey]: p }))

    const pageSize = 16 // 4x4

    const { data, isLoading, isFetching } = useGetSnippetsPageQuery({ page, pageSize, query, language, tags })

    const dispatch = useDispatch<AppDispatch>()
    const { show } = useToast()
    const { confirm } = useConfirm()
    const { t } = useTranslation('common')

    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const items = forcedItems ?? (data?.items ?? [])

    const [deleteSnippet] = useDeleteSnippetMutation();

    const handleCopyCode = async (code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code)
            show(t('toasts.copied'), { variant: 'success', duration: 1600 })
        } catch {
            show(t('toasts.error'), { variant: 'error' })
        }
    };
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const ok = await confirm({
            title: t('confirmations.delete_snippet_title'),
            description: t('confirmations.delete_snippet_text'),
            confirmText: t('yes'),
            cancelText: t('no'),
            variant: 'danger',
        })
        if (!ok) return;

        try {
            await deleteSnippet(id).unwrap();
            dispatch(favoritesApi.util.invalidateTags(['Favorites']))
            show(t('toasts.deleted'), { variant: 'success' })
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : (error as { data?: { message?: string } })?.data?.message || 'Не удалось удалить сниппет';
            console.error('Ошибка при удалении:', error);
            show(message, { variant: 'error' })
        }
    };

    // Префетч соседних страниц (ленивая оптимизация)
    useEffect(() => {
        if (totalPages > 1) {
            const base = { pageSize, query, language, tags }
            if (page < totalPages) dispatch(snippetsApi.util.prefetch('getSnippetsPage', { ...base, page: page + 1 }, { force: false }))
            if (page > 1) dispatch(snippetsApi.util.prefetch('getSnippetsPage', { ...base, page: page - 1 }, { force: false }))
        }
    }, [page, totalPages, pageSize, query, language, tags, tagsKey, dispatch])

    if (!forcedItems && isLoading && items.length === 0) {
        return (
            <div className='snippets-list__loading'>
                { [...Array(16)].map((_, i) => (
                    <div key={ i } className='snippet-card skeleton'>
                        <div className='snippet-card__header skeleton-line'></div>
                        <div className='snippet-card__content'>
                            <div className='skeleton-line w-3/4'></div>
                            <div className='skeleton-line w-1/2'></div>
                        </div>
                        <div className='snippet-card__footer'>
                            <div className='skeleton-line w-1/4'></div>
                        </div>
                    </div>
                )) }
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className='snippets-list__empty'>
                { emptyMessage || (
                    <>
                        <div className='empty-state'>
                            <div className='empty-state__icon'>
                                <Code2 size={ 48 } />
                            </div>
                            <h3 className='empty-state__title'>Нет сниппетов</h3>
                            <p className='empty-state__description'>
                                Создайте свой первый сниппет, чтобы начать работу
                            </p>
                        </div>
                    </>
                ) }
            </div>
        );
    }

    return (
        <>
            <div className='snippets-list'>
                { items.map((snippet) => (
                    <SnippetCard
                        key={ snippet.id }
                        snippet={ snippet }
                        onSelect={ onSelect }
                        onCopy={ handleCopyCode }
                        onDelete={ (id, e) => handleDelete(id, e) }
                    />
                )) }
            </div>

            { !forcedItems && (
                <div className='pagination'>
                    <button className='page-btn' onClick={ () => goToPage(Math.max(1, page - 1)) } disabled={ page === 1 || isFetching }>
                        ‹
                    </button>
                    { Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                        const p = i + 1
                        return (
                            <button
                                key={ p }
                                className={ `page-btn ${p === page ? 'active' : ''}` }
                                onClick={ () => goToPage(p) }
                                disabled={ isFetching }
                            >
                                { p }
                            </button>
                        )
                    }) }
                    { totalPages > 7 && <span>…</span> }
                    <button className='page-btn' onClick={ () => goToPage(Math.min(totalPages, page + 1)) } disabled={ page === totalPages || isFetching }>
                        ›
                    </button>
                </div>
            ) }
        </>
    );
});
