import React from 'react'
import './ErrorPage.css'
import { useNavigate } from 'react-router-dom'

export const ErrorPage: React.FC = () => {
    const navigate = useNavigate()
    const reload = () => window.location.reload()

    return (
        <div className='error-page'>
            <div className='error-card'>
                <div className='error-emoji'>⚠️</div>
                <h2 className='error-title'>Что‑то пошло не так</h2>
                <p className='error-desc'>Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.</p>
                <div className='error-actions'>
                    <button className='error-btn error-btn--primary' onClick={ () => navigate('/') }>На главную</button>
                    <button className='error-btn error-btn--ghost' onClick={ reload }>Перезагрузить</button>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage

