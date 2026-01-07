import { Code2, CheckCircle, Zap, Shield, Globe } from 'lucide-react'
import { CursorTrail } from '@/shared/ui/CursorTrail/CursorTrail'
import './AuthPage.css'
import { AuthForm } from '../AuthForm/AuthForm'

export const AuthPage = () => {
    const isLogin = true

    return (
        <div className='auth-page'>
            <CursorTrail />
            <section className='auth-page__info'>
                <div className='auth-info__content'>
                    <div>
                        <div className='auth-info__logo'>
                            <Code2 size={ 28 } color='#ffffff' />
                            <span className='logo-text'>SnippetBox</span>
                        </div>

                        <div className='auth-badge'>
                            { isLogin ? 'Войдите в свой аккаунт' : 'Начните бесплатно' }
                        </div>

                        <h1 className='auth-title'>
                            { isLogin ? 'Добро пожаловать назад!' : 'Создавайте. Храните. Делитесь.' }
                        </h1>

                        <p className='auth-description'>
                            { isLogin
                                ? 'Вернитесь к своей коллекции сниппетов и продолжайте работу с того места, где остановились.'
                                : 'Платформа для разработчиков, которая упрощает хранение, организацию и обмен сниппетами кода.'
                            }
                        </p>

                        <ul className='auth-features'>
                            <li>
                                <CheckCircle size={ 20 } />
                                <span>Храните сниппеты в облаке</span>
                            </li>
                            <li>
                                <Zap size={ 20 } />
                                <span>Синхронизация между устройствами</span>
                            </li>
                            <li>
                                <Shield size={ 20 } />
                                <span>Защищённое хранение</span>
                            </li>
                            <li>
                                <Globe size={ 20 } />
                                <span>Доступ из любой точки мира</span>
                            </li>
                        </ul>
                    </div>

                    <div className='auth-info__footer'>
                        © 2024 SnippetBox. Все права защищены.
                    </div>
                </div>
            </section>

            <section className='auth-page__form-section'>
                <div className='auth-form__container'>
                    <AuthForm />
                </div>
            </section>
        </div>
    )
}
