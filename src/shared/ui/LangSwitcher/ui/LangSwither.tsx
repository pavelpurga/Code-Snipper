import { useTranslation } from 'react-i18next';
import './LangSwitcher.css'

export const LangSwitcher = () => {
    const { i18n } = useTranslation()

    const toggle = () => {
        i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
    }
    return (
        <button
            type='button'
            className='lang-switcher'
            onClick={ toggle }
            title={ i18n.language === 'ru' ? 'Switch to English' : 'Переключить на русский' }
        >
            <span className='lang-switcher__label'>{ i18n.language.toUpperCase() }</span>
        </button>
    );
};
