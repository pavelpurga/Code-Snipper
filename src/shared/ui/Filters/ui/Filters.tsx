import React from 'react'
import { Input } from '@/shared/ui/input'
import { MultiSelect } from '@/shared/ui/MultiSelect/ui/MultiSelect'
import { Search, X, Code, Tag, Info } from 'lucide-react'
import './Filters.css'
import { useTranslation } from 'react-i18next'

export type Option = { value: string; label?: string; labelKey?: string }

export interface FiltersProps {
  query: string
  language: string | null
  tags: string[]
  onQueryChange: (v: string) => void
  onLanguageChange: (v: string | null) => void
  onTagsChange: (v: string[]) => void
  onClear: () => void
  languageOptions: Option[]
  tagOptions: Option[]
  labelsNs?: string // i18n namespace, default 'common'
  labels?: {
    hint?: string
    searchPlaceholder?: string
    language?: string
    tags?: string
    clear?: string
  }
}

export const Filters: React.FC<FiltersProps> = ({
    query,
    language,
    tags,
    onQueryChange,
    onLanguageChange,
    onTagsChange,
    onClear,
    languageOptions,
    tagOptions,
    labelsNs = 'common',
    labels,
}) => {
    const { t } = useTranslation(labelsNs)
    const hasActive = Boolean(query) || Boolean(language) || (tags && tags.length > 0)

    const localizedLangOptions = languageOptions.map(o => ({
        value: o.value,
        label: o.labelKey ? t(o.labelKey) : (o.label ?? ''),
        labelKey: o.labelKey,
    }))
    const localizedTagOptions = tagOptions.map(o => ({
        value: o.value,
        label: o.labelKey ? t(o.labelKey) : (o.label ?? ''),
        labelKey: o.labelKey,
    }))

    const handleLanguageChange = (vals: string[]) => {
        const v = vals[0] ?? null
        onLanguageChange(v === '__all__' ? null : v)
    }

    const handleTagsChange = (vals: string[]) => {
        if (vals.includes('__all__')) {
            onTagsChange([])
            return
        }
        const cleaned = Array.from(new Set(vals.filter(v => v !== '__all__')))
        onTagsChange(cleaned)
    }

    return (
        <div className='filters'>
            <div className='filter-input'>
                <div className='filter-select-header'>
                    <Info size={ 14 } />
                    <span>{ labels?.hint ?? t('filters.hint', { defaultValue: 'Возможно вам это поможет...' }) }</span>
                </div>
                <div className='filter-input-field'>
                    <span className='search-icon-wrapper'><Search size={ 16 } className='search-icon' /></span>
                    <Input
                        value={ query }
                        onChange={ (e) => onQueryChange(e.target.value) }
                        placeholder={ labels?.searchPlaceholder ?? t('filters.search_placeholder') }
                        className='search-input'
                    />
                    { query && (
                        <button className='clear-search-button' onClick={ () => onQueryChange('') } aria-label={ labels?.clear ?? t('filters.clear') }>
                            <X size={ 14 } />
                        </button>
                    ) }
                </div>
            </div>

            <div className='filter-select language-select'>
                <div className='filter-select-header'>
                    <Code size={ 14 } />
                    <span>{ labels?.language ?? t('filters.language') }</span>
                </div>
                <MultiSelect
                    options={ localizedLangOptions }
                    value={ language ? [language] : ['__all__'] }
                    onChange={ handleLanguageChange }
                    isMulti={ false }
                    placeholder={ labels?.language ?? t('filters.language') }
                />
            </div>

            <div className='filter-select tags-select'>
                <div className='filter-select-header'>
                    <Tag size={ 14 } />
                    <span>{ labels?.tags ?? t('filters.tags') }</span>
                </div>
                <MultiSelect
                    options={ localizedTagOptions }
                    value={ tags.length ? tags : ['__all__'] }
                    onChange={ handleTagsChange }
                    placeholder={ labels?.tags ?? t('filters.tags') }
                />
            </div>

            <button className='clear-filters-button' onClick={ onClear } disabled={ !hasActive } aria-disabled={ !hasActive } title={ labels?.clear ?? t('filters.clear') }>
                <X size={ 16 } />
                { labels?.clear ?? t('filters.clear') }
            </button>
        </div>
    )
}
