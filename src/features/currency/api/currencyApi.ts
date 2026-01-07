import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export type TimeframeArgs = {
  startDate: string
  endDate: string
}

export type CurrencyLayerTimeframeResp = {
  success: boolean
  quotes: Record<string, Record<string, number>>
  error?: { code?: number; info?: string }
}

// Тип ошибки для RTK Query (HTTP статус + текст/сообщение)
export type QueryError = { status: number; data: string }

const LS_KEY_PREFIX = 'currencylayer_timeframe_cache_v1'
const TTL_MS_24H = 24 * 60 * 60 * 1000

const makeCacheKey = (startDate: string, endDate: string) => `${LS_KEY_PREFIX}:${startDate}:${endDate}`

type CachedPayload = { ts: number; data: CurrencyLayerTimeframeResp }

export const currencyApi = createApi({
    reducerPath: 'currencyApi',
    baseQuery: fakeBaseQuery<QueryError>(),
    tagTypes: ['Currency'],
    endpoints: (builder) => ({
        getTimeframeRates: builder.query<CurrencyLayerTimeframeResp, TimeframeArgs>({
            async queryFn({ startDate, endDate }) {
                try {
                    const LS_KEY = makeCacheKey(startDate, endDate)
                    // 1) Читаем персистентный кэш
                    const raw = localStorage.getItem(LS_KEY)
                    if (raw) {
                        try {
                            const cached = JSON.parse(raw) as CachedPayload
                            if (cached && cached.ts && Date.now() - cached.ts < TTL_MS_24H && cached.data?.quotes) {
                                return { data: cached.data }
                            }
                        } catch { /* ignore broken cache */ }
                    }

                    // 2) Запрос к API
                    const accessKey = (import.meta as { env: { VITE_CURRENCYLAYER_API_KEY?: string } }).env?.VITE_CURRENCYLAYER_API_KEY
                    if (!accessKey) {
                        return { error: { status: 400, data: 'Missing VITE_CURRENCYLAYER_API_KEY' } }
                    }
                    const url = `https://api.currencylayer.com/timeframe?access_key=${accessKey}&start_date=${startDate}&end_date=${endDate}&currencies=RUB,EUR,BYN&source=USD`
                    const res = await fetch(url)
                    if (!res.ok) return { error: { status: res.status, data: await res.text() } }
                    const json: CurrencyLayerTimeframeResp = await res.json()
                    if (!json.success) {
                        return { error: { status: 400, data: json.error?.info || 'API error' } }
                    }

                    // 3) Кэшируем на 24 часа
                    try {
                        const payload: CachedPayload = { ts: Date.now(), data: json }
                        localStorage.setItem(LS_KEY, JSON.stringify(payload))
                    } catch { /* ignore quota */ }

                    return { data: json }
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e)
                    return { error: { status: 0, data: message } }
                }
            },
            keepUnusedDataFor: 60 * 60 * 24,
            // Параметры refetchOnFocus/refetchOnReconnect можно задать в хук-опциях, их нет в определении эндпоинта
        }),
    })
})

export const { useGetTimeframeRatesQuery } = currencyApi
