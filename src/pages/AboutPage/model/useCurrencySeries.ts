import { useMemo } from 'react'
import type { CurrencyLayerTimeframeResp } from '@/features/currency/api/currencyApi'

export type CurrencySeries = {
  dates: string[]
  usdRub: number[]
  eurRub: number[]
  usdByn: number[]
  eurByn: number[]
}

export function buildCurrencySeries(data?: CurrencyLayerTimeframeResp): CurrencySeries {
    const quotes = data?.quotes || {}
    const keys = Object.keys(quotes).sort()

    const usdRub: number[] = []
    const eurRub: number[] = []
    const usdByn: number[] = []
    const eurByn: number[] = []

    let lastUsdRub: number | null = null
    let lastEurRub: number | null = null
    let lastUsdByn: number | null = null
    let lastEurByn: number | null = null

    for (const k of keys) {
        const q = quotes[k] || {}
        const usdrub = q['USDRUB']
        const usdeur = q['USDEUR']
        const usdbyn = q['USDBYN']

        const eurrub = (typeof usdrub === 'number' && typeof usdeur === 'number' && usdeur !== 0)
            ? (usdrub / usdeur)
            : null
        const eurbyn = (typeof usdbyn === 'number' && typeof usdeur === 'number' && usdeur !== 0)
            ? (usdbyn / usdeur)
            : null

        if (typeof usdrub === 'number') lastUsdRub = usdrub
        if (eurrub != null) lastEurRub = eurrub
        if (typeof usdbyn === 'number') lastUsdByn = usdbyn
        if (eurbyn != null) lastEurByn = eurbyn

        usdRub.push(lastUsdRub ?? (usdRub.length ? usdRub[usdRub.length - 1] : 0))
        eurRub.push(lastEurRub ?? (eurRub.length ? eurRub[eurRub.length - 1] : 0))
        usdByn.push(lastUsdByn ?? (usdByn.length ? usdByn[usdByn.length - 1] : 0))
        eurByn.push(lastEurByn ?? (eurByn.length ? eurByn[eurByn.length - 1] : 0))
    }

    return {
        dates: keys,
        usdRub: usdRub.length ? usdRub : [92, 92.2, 92.4, 92.1, 92.8],
        eurRub: eurRub.length ? eurRub : [100, 100.3, 100.1, 100.9, 101.2],
        usdByn: usdByn.length ? usdByn : [3.1, 3.12, 3.11, 3.13, 3.15],
        eurByn: eurByn.length ? eurByn : [3.3, 3.31, 3.32, 3.35, 3.36],
    }
}

export function useCurrencySeries(data?: CurrencyLayerTimeframeResp): CurrencySeries {
    return useMemo(() => buildCurrencySeries(data), [data])
}

