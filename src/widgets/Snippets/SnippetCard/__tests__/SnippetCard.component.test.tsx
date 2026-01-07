import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { SnippetCard } from '@/widgets/Snippets/SnippetsList/ui/SnippetCard/SnippetCard.tsx';
import type { Tables } from '@/shared/config/supabase/api/types.ts';

jest.mock('@/shared/ui/Toast/ToastProvider', () => ({ useToast: () => ({ show: jest.fn() }) }))
jest.mock('@/shared/ui/Confirm/ConfirmProvider', () => ({ useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(true) }) }))
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux')
    return { ...actual, useDispatch: () => jest.fn() }
})
jest.mock('@/features/snippets/api/favoritesApi', () => ({
    useGetFavoriteIdsQuery: jest.fn(() => ({ data: [] })),
    useToggleFavoriteMutation: jest.fn(() => [jest.fn()]),
}))

const snippet = {
    id: 's1',
    title: 'Demo snippet',
    description: 'Description here',
    code: 'console.log(1)',
    language: 'javascript',
    tags: ['a', 'b'],
    created_at: null,
    updated_at: null,
    user_id: null,
}

describe('SnippetCard', () => {
    it('renders title, language and tags', () => {
        render(<SnippetCard snippet={ snippet as Tables<'snippets'> } onSelect={ () => {} } onCopy={ () => {} } onDelete={ () => {} } />)
        expect(screen.getByText(/Demo snippet/i)).toBeInTheDocument()
        expect(screen.getByText(/javascript/i)).toBeInTheDocument()
        const tags = screen.getAllByText(/a|b/i)
        expect(tags.length).toBeGreaterThanOrEqual(2)
    })

    it('calls onCopy when copy button clicked', () => {
        const onCopy = jest.fn()
        render(<SnippetCard snippet={ snippet as Tables<'snippets'> } onSelect={ () => {} } onCopy={ onCopy } onDelete={ () => {} } />)
        const copyBtn = screen.getByTitle('Копировать код')
        fireEvent.click(copyBtn)
        expect(onCopy).toHaveBeenCalled()
    })

    it('calls onDelete when delete button clicked (after confirm)', () => {
        const onDelete = jest.fn()
        render(<SnippetCard snippet={ snippet as Tables<'snippets'> } onSelect={ () => {} } onCopy={ () => {} } onDelete={ onDelete } />)
        const delBtn = screen.getByTitle('Удалить')
        fireEvent.click(delBtn)
        expect(onDelete).toHaveBeenCalled()
    })
})
