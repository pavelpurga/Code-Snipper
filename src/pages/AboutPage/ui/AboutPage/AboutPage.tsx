import { useTranslation } from 'react-i18next'
import './AboutPage.css'
import { useMemo, useState } from 'react'
import { useGetTimeframeRatesQuery, type QueryError } from '@/features/currency/api/currencyApi.ts'
import { useCurrencySeries } from '@/pages/AboutPage/model/useCurrencySeries.ts'
import { ChartCard } from '@/pages/AboutPage/ui/ChartCard/ChartCard.tsx'

const AboutPage = () => {
    const { t } = useTranslation(['translation'])

    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const end = useMemo(() => new Date(), [])

    const [periodDays, setPeriodDays] = useState<7 | 14 | 30 | 90>(14)
    const start = useMemo(() => { const s = new Date(end); s.setDate(end.getDate() - periodDays); return s }, [end, periodDays])
    const startDate = fmt(start); const endDate = fmt(end)

    const { data, isLoading, isError, error } = useGetTimeframeRatesQuery({ startDate, endDate })

    const series = useCurrencySeries(data)
    const [target, setTarget] = useState<'RUB' | 'BYN'>('RUB')

    const usdSeries = target === 'RUB' ? series.usdRub : series.usdByn
    const eurSeries = target === 'RUB' ? series.eurRub : series.eurByn
    const currencyLabel = target === 'RUB' ? t('about.rub', '₽') : 'BYN'

    return (
        <div className='about'>
            <h1 className='about__title'>{ t('about.title', 'О нас') }</h1>
            <p className='about__text'>{ t('about.description', 'Это приложение помогает хранить и делиться сниппетами кода.') }</p>
            <p className='about__note'>{ t('about.note', 'здесь должно быть что-то полезное... пожалуй остановимся на этом') }</p>

            { /* Панель управления: слева период, справа валюта */ }
            <div className='about__controls'>
                <div className='about__switch' role='tablist' aria-label='Период'>
                    { [7, 14, 30, 90].map((d) => (
                        <button
                            key={ d }
                            className={ `about__switch-btn ${periodDays === d ? 'is-active' : ''}` }
                            onClick={ () => setPeriodDays(d as 7 | 14 | 30 | 90) }
                            role='tab'
                            aria-selected={ periodDays === d }
                        >
                            { d }d
                        </button>
                    )) }
                </div>

                <div className='about__switch' role='tablist' aria-label='Target currency'>
                    <button className={ `about__switch-btn ${target === 'RUB' ? 'is-active' : ''}` } onClick={ () => setTarget('RUB') } role='tab' aria-selected={ target === 'RUB' }>RUB ₽</button>
                    <button className={ `about__switch-btn ${target === 'BYN' ? 'is-active' : ''}` } onClick={ () => setTarget('BYN') } role='tab' aria-selected={ target === 'BYN' }>BYN Br</button>
                </div>
            </div>

            { /* Состояния загрузки/ошибки ниже панели */ }
            { isLoading && <p className='about__text'>{ t('common:loading', 'Загрузка данных...') }</p> }
            { isError && (
                <p className='about__note' style={ { color: 'var(--error-color, #ef4444)' } }>{ (error as QueryError)?.data || 'Failed to load rates' }</p>
            ) }

            { /* Большие графики на всю ширину страницы */ }
            <div className='about__charts about__charts--wide'>
                <ChartCard title={ `${t('about.usd', 'Курс доллара')} → ${currencyLabel}` } data={ usdSeries } dates={ series.dates } currency={ currencyLabel } />
                <ChartCard title={ `${t('about.eur', 'Курс евро')} → ${currencyLabel}` } data={ eurSeries } dates={ series.dates } currency={ currencyLabel } />
            </div>
        </div>
    )
}

export default AboutPage
