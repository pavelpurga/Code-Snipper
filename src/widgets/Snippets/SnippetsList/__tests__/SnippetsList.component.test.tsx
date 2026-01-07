import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { SnippetsList } from '@/widgets/Snippets'
import * as snippetsApi from '@/features/snippets/api/snippetsApi'
import type { Tables } from '@/shared/config/supabase/api/types.ts';

jest.mock('@/shared/ui/Toast/ToastProvider', () => ({ useToast: () => ({ show: jest.fn() }) }))
jest.mock('@/shared/ui/Confirm/ConfirmProvider', () => ({ useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(true) }) }))

jest.mock('@/features/snippets/api/favoritesApi', () => ({
    useGetFavoriteIdsQuery: jest.fn(() => ({ data: [] })),
    useToggleFavoriteMutation: jest.fn(() => [jest.fn()]),
}))

jest.mock('@/features/snippets/api/snippetsApi', () => ({
    useGetSnippetsPageQuery: jest.fn().mockReturnValue({ data: { total: 0, items: [] }, isLoading: false, isFetching: false }),
    useDeleteSnippetMutation: jest.fn(() => [jest.fn()]),
    snippetsApi: { util: { prefetch: jest.fn(() => ({ type: 'SNIPPETS/PREFETCH' })), invalidateTags: jest.fn(() => ({ type: 'SNIPPETS/INVALIDATE' })) } }
}))
jest.mock('../ui/SnippetCard/SnippetCard.tsx', () => ({
    SnippetCard: ({ snippet }: { snippet: { title: string } }) => (
        <div className='snippet-card' data-testid='snippet-card'>{ snippet.title }</div>
    )
}))

const renderWithStore = (ui: React.ReactElement) => {
    const store = configureStore({ reducer: (state = {}) => state })
    return render(<Provider store={ store }>{ ui }</Provider>)
}

describe('SnippetsList', () => {
    it('renders empty state when no items', () => {
        renderWithStore(<SnippetsList onSelect={ () => {} } />)
        expect(screen.getByText(/Нет сниппетов/i)).toBeInTheDocument()
    })

    it('renders skeleton when loading with empty items', () => {
        ;(snippetsApi.useGetSnippetsPageQuery as jest.Mock).mockReturnValueOnce({ data: undefined, isLoading: true, isFetching: true })
        renderWithStore(<SnippetsList onSelect={ () => {} } />)
        const skeletons = document.querySelectorAll('.snippet-card.skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders items passed via props', () => {
        const items = [
            { id: '1', title: 'A', description: '', code: 'c', language: 'js', tags: ['x'], created_at: null, updated_at: null, user_id: null },
            { id: '2', title: 'B', description: '', code: 'c2', language: 'ts', tags: [], created_at: null, updated_at: null, user_id: null },
        ]
        renderWithStore(<SnippetsList onSelect={ () => {} } items={ items as Tables<'snippets'>[] } />)
        const cards = document.querySelectorAll('.snippet-card')
        expect(cards.length).toBeGreaterThanOrEqual(2)
    })

    it('pagination buttons exist and can be clicked', () => {
        ;(snippetsApi.useGetSnippetsPageQuery as jest.Mock).mockReturnValue({
            data: {
                total: 32,
                items: [
                    { id: '1', title: 'A', description: '', code: 'c', language: 'js', tags: ['x'], created_at: null, updated_at: null, user_id: null },
                ]
            },
            isLoading: false,
            isFetching: false
        })
        renderWithStore(<SnippetsList onSelect={ () => {} } />)
        const next = screen.getByRole('button', { name: /›/ })
        const prev = screen.getByRole('button', { name: /‹/ })
        expect(next).toBeInTheDocument()
        expect(prev).toBeInTheDocument()
        fireEvent.click(next)
        fireEvent.click(prev)
    })
})
