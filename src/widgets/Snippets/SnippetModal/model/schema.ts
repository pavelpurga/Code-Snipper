import { z } from 'zod'

export const TITLE_MAX = 50
export const TEXT_MAX = 1500
export const TAGS_MAX = 4

// Zod-схема формы сниппета
export const snippetFormSchema = z.object({
    title: z.string()
        .min(1, 'Введите заголовок')
        .max(TITLE_MAX, `Заголовок не должен превышать ${TITLE_MAX} символов`),
    code: z.string()
        .min(1, 'Введите код')
        .max(TEXT_MAX, `Код не должен превышать ${TEXT_MAX} символов`),
    description: z.string()
        .max(TEXT_MAX, `Описание не должно превышать ${TEXT_MAX} символов`)
        .default(''),
    language: z.string().min(1, 'Выберите язык'),
    tags: z.array(z.string())
        .max(TAGS_MAX, `Можно выбрать не более ${TAGS_MAX} тегов`)
        .default([]),
})

export type SnippetFormInput = z.infer<typeof snippetFormSchema>
