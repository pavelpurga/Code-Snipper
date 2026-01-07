import { Input } from './input'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
    return (
        <Input
            value={ value }
            onChange={ (e) => onChange(e.target.value) }
            placeholder={ placeholder || 'Search...' }
        />
    )
}
