import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm, type UseFormRegisterReturn, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X, Edit, Code2, Tag, FileText, Type } from 'lucide-react'
import toast from 'react-hot-toast'
import './SnippetModal.css'
import type { Tables } from '@/shared/config/supabase/api/types.ts'
import { MultiSelect } from '@/shared/ui/MultiSelect/ui/MultiSelect.tsx'
import { useGetProfileIdQuery } from '@/features/users/api/usersApi.ts';
import {
    useCreateSnippetMutation,
    useGetSnippetByIdQuery,
    useUpdateSnippetMutation
} from '@/features/snippets/api/snippetsApi.ts';
import { LANGUAGES_OPTIONS, TAGS_OPTIONS } from '@/widgets/Snippets/SnippetsFilter/model/constants'
import { snippetFormSchema, type SnippetFormInput, TITLE_MAX, TEXT_MAX, TAGS_MAX } from '../model/schema'
import { useTranslation } from 'react-i18next'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'
import 'prismjs/themes/prism-tomorrow.css'
import type { Resolver } from 'react-hook-form'

interface Props {
    mode: 'create' | 'details'
    snippetId?: string
    onClose: () => void
    onSnippetCreated?: (snippet: Tables<'snippets'>) => void
    onSnippetUpdated?: (snippet: Tables<'snippets'>) => void
    hideEditActions?: boolean
}

export const SnippetModal = ({ mode, snippetId, onClose, onSnippetCreated, onSnippetUpdated, hideEditActions = false }: Props) => {
    const { t } = useTranslation('translation')
    const { t: tc } = useTranslation('common')
    const isCreate = mode === 'create'
    const [isEdit, setIsEdit] = useState<boolean>(isCreate)

    const { data: userId } = useGetProfileIdQuery();

    const { data: snippet, isLoading: isSnippetLoading } = useGetSnippetByIdQuery(snippetId!, {
        skip: isCreate || !snippetId
    })

    const [createSnippet, { isLoading: isCreating }] = useCreateSnippetMutation();
    const [updateSnippet, { isLoading: isUpdating }] = useUpdateSnippetMutation();

    const isSubmitting = isCreating || isUpdating;

    const defaultValues: SnippetFormInput = {
        title: '',
        code: '',
        description: '',
        language: 'javascript',
        tags: [],
    }

    const typedResolver = zodResolver(snippetFormSchema) as unknown as Resolver<SnippetFormInput>

    const formMethods = useForm<SnippetFormInput>({
        resolver: typedResolver,
        defaultValues,
    })

    const {
        handleSubmit,
        reset,
        setValue,
        watch,
        register,
        formState: { errors, isDirty, defaultValues: df }
    } = formMethods

    // Регистрируем описание, даже если управляем через setValue
    register('description')

    const titleVal = watch('title') ?? df?.title ?? ''
    const codeVal = watch('code') ?? df?.code ?? ''
    const descriptionVal = watch('description') ?? df?.description ?? ''
    const languageVal = watch('language') ?? df?.language ?? ''
    const tagsVal = watch('tags') ?? df?.tags ?? []

    // Нормализуем опции для MultiSelect: гарантируем поле `label: string`.
    const normalizedLanguageOptions = LANGUAGES_OPTIONS.map(o => ({
        ...o,
        label: o.label ?? (o.labelKey ? tc(o.labelKey as string) : o.value),
    }))

    const normalizedTagOptions = TAGS_OPTIONS.map(o => ({
        ...o,
        label: o.label ?? (o.labelKey ? tc(o.labelKey as string) : o.value),
    }))

    const prismLang = useMemo(() => {
        const lang = (languageVal || 'javascript').toLowerCase()
        if (['js', 'javascript'].includes(lang)) return 'javascript'
        if (['ts', 'typescript'].includes(lang)) return 'typescript'
        if (['jsx'].includes(lang)) return 'jsx'
        if (['tsx'].includes(lang)) return 'tsx'
        if (['py', 'python'].includes(lang)) return 'python'
        if (['html', 'markup'].includes(lang)) return 'markup'
        return 'javascript'
    }, [languageVal])

    const highlightCode = useCallback((code: string) => {
        const grammar = Prism.languages[prismLang as keyof typeof Prism.languages] || Prism.languages.javascript
        return Prism.highlight(code, grammar, prismLang)
    }, [prismLang])

    useEffect(() => {
        if (snippet && !isCreate) {
            reset({
                title: snippet.title,
                code: snippet.code,
                description: snippet.description ?? '',
                language: snippet.language,
                tags: Array.isArray(snippet.tags) ? snippet.tags : [],
            })
        }
    }, [snippet, isCreate, reset])

    const buildPayload = useCallback((data: SnippetFormInput) => ({
        ...data,
        description: data.description ?? null,
        user_id: userId?.id ?? ''
    }), [userId])

    const onSubmit: SubmitHandler<SnippetFormInput> = async (data) => {
        if (!userId && isCreate) {
            toast.error(t('snippets.create_modal.toasts.not_auth'));
            return;
        }
        const payload = buildPayload(data)
        try {
            if (isCreate) {
                const result = await createSnippet(payload).unwrap();
                toast.success(t('snippets.create_modal.toasts.created'));
                onSnippetCreated?.(result as Tables<'snippets'>);
                onClose();
            } else if (snippetId) {
                const result = await updateSnippet({ id: snippetId, ...payload }).unwrap();
                toast.success(t('snippets.create_modal.toasts.updated'));
                onSnippetUpdated?.(result as Tables<'snippets'>);
                setIsEdit(false);
            }
        } catch {
            toast.error(t('snippets.create_modal.toasts.error'));
        }
    }

    const handleCancelEdit = () => {
        setIsEdit(false)
        if (snippet && !isCreate) {
            reset({
                title: snippet.title,
                code: snippet.code,
                description: snippet.description ?? '',
                language: snippet.language,
                tags: Array.isArray(snippet.tags) ? snippet.tags : [],
            })
        } else {
            reset(defaultValues)
        }
    }

    const titleField: UseFormRegisterReturn = register('title')

    // Блокируем скролл фона на время открытия модалки
    useEffect(() => {
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prevOverflow }
    }, [])

    if (isSnippetLoading && !isCreate) {
        return (
            <div className='modal-overlay'>
                <div className='modal-container flex items-center justify-center'>
                    <div className='loading-spinner' />
                </div>
            </div>
        )
    }

    return (
        <div className='modal-overlay' onClick={ onClose }>
            <div className='modal-container' onClick={ e => e.stopPropagation() }>
                { isSubmitting && <div className='form-loading'><div className='loading-spinner' /></div> }

                <div className='modal-header'>
                    <button
                        className='close-button'
                        onClick={ onClose }
                        aria-label={ tc('close', 'Закрыть') }
                        title={ tc('close', 'Закрыть') }
                    >
                        <X size={ 20 } />
                    </button>
                    <h2 className='modal-title'>{ isCreate ? t('snippets.create_modal.title', 'Создать сниппет') : t('snippets.details_modal.title', 'Детали сниппета') }</h2>
                    <p className='modal-subtitle'>
                        { isCreate
                            ? t('snippets.create_modal.subtitle', 'Заполните поля, чтобы создать сниппет')
                            : isEdit
                                ? t('snippets.details_modal.subtitle_edit', 'Режим редактирования')
                                : t('snippets.details_modal.subtitle_view', 'Режим просмотра') }
                    </p>
                </div>

                <form onSubmit={ handleSubmit((data) => onSubmit(data as SnippetFormInput)) } className='modal-form'>
                    <div className='form-group'>
                        <div className='form-label-row'>
                            <label className='form-label'><Type size={ 16 } />{ t('snippets.create_modal.fields.title') }</label>
                            <span className='hint-text'>{ titleVal.length }/{ TITLE_MAX }</span>
                        </div>
                        <input
                            { ...titleField }
                            disabled={ !isEdit }
                            placeholder={ t('snippets.create_modal.fields.title') }
                            className={ `form-input ${errors.title ? 'border-red-500/50' : ''}` }
                            maxLength={ TITLE_MAX }
                            onChange={ (e) => {
                                if (!isEdit) return
                                const val = e.target.value
                                if (val.length <= TITLE_MAX) titleField.onChange?.(e)
                            } }
                        />
                        { errors.title && <span className='text-red-400 text-sm'>{ errors.title.message }</span> }
                    </div>

                    <div className='form-group'>
                        <div className='form-label-row'>
                            <label className='form-label'><Code2 size={ 16 } />{ t('snippets.create_modal.fields.code') }</label>
                            <span className='hint-text'>{ codeVal.length }/{ TEXT_MAX }</span>
                        </div>
                        <div className='code-editor'>
                            <Editor
                                value={ codeVal }
                                onValueChange={ (val) => { if (isEdit) setValue('code', val, { shouldDirty: true }) } }
                                highlight={ highlightCode }
                                padding={ 8 }
                                textareaId='snippet-code'
                                readOnly={ !isEdit }
                                style={ { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12 } }
                            />
                        </div>
                        { errors.code && <span className='text-red-400 text-sm'>{ errors.code.message }</span> }
                    </div>

                    <div className='form-group'>
                        <div className='form-label-row'>
                            <label className='form-label'><FileText size={ 16 } />{ t('snippets.create_modal.fields.description') }</label>
                            <span className='hint-text'>{ descriptionVal.length }/{ TEXT_MAX }</span>
                        </div>
                        <textarea
                            disabled={ !isEdit }
                            placeholder={ t('snippets.create_modal.fields.description') }
                            className={ `form-textarea ${errors.description ? 'border-red-500/50' : ''}` }
                            maxLength={ TEXT_MAX }
                            value={ descriptionVal }
                            onChange={ (e) => { if (isEdit) setValue('description', e.target.value, { shouldDirty: true }) } }
                        />
                        { errors.description && <span className='text-red-400 text-sm'>{ errors.description.message }</span> }
                    </div>

                    <div className='form-group'>
                        <div className='form-label-row'>
                            <label className='form-label'><Type size={ 16 } />{ t('snippets.create_modal.fields.language', 'Язык') }</label>
                        </div>
                        <MultiSelect
                            options={ normalizedLanguageOptions }
                            value={ languageVal ? [languageVal] : [] }
                            onChange={ (vals) => { if (isEdit) setValue('language', vals[0] ?? '', { shouldDirty: true }) } }
                            isMulti={ false }
                            placeholder={ t('snippets.create_modal.fields.language', 'Язык') }
                        />
                    </div>

                    <div className='form-group'>
                        <div className='form-label-row'>
                            <label className='form-label'><Tag size={ 16 } />{ t('snippets.create_modal.fields.tags', 'Теги') }</label>
                            <span className='hint-text'>{ (tagsVal ?? []).length }/{ TAGS_MAX }</span>
                        </div>
                        <MultiSelect
                            options={ normalizedTagOptions }
                            value={ tagsVal }
                            onChange={ (vals) => { if (isEdit) setValue('tags', vals.slice(0, TAGS_MAX), { shouldDirty: true }) } }
                            placeholder={ t('snippets.create_modal.fields.tags', 'Теги') }
                        />
                    </div>

                    { hideEditActions ? (
                        <div className='form-actions'>
                            <button type='button' className='action-button primary-button' onClick={ onClose }>
                                <X size={ 16 } />{ tc('close', 'Закрыть') }
                            </button>
                        </div>
                    ) : (
                        <div className='form-actions'>
                            { !isCreate && !isEdit && (
                                <button
                                    type='button'
                                    className='action-button edit-button'
                                    onClick={ () => setIsEdit(true) }
                                    title={ tc('edit', 'Редактировать') }
                                >
                                    <Edit size={ 16 } />{ tc('edit', 'Редактировать') }
                                </button>
                            ) }
                            { (!isCreate && isEdit) && (
                                <button type='button' className='action-button secondary-button' onClick={ handleCancelEdit } disabled={ isSubmitting }>
                                    <X size={ 16 } />{ tc('cancel', 'Отмена') }
                                </button>
                            ) }
                            { (isCreate || isEdit) && (
                                <button type='submit' className='action-button primary-button' disabled={ isSubmitting || (!isDirty && !isCreate) }>
                                    <Save size={ 16 } />{ isCreate ? t('snippets.create_modal.actions.save', 'Сохранить') : t('snippets.details_modal.actions.update', 'Обновить') }
                                </button>
                            ) }
                        </div>
                    ) }
                </form>
            </div>
        </div>
    )
}
