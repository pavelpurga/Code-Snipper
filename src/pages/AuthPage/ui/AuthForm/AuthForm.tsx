import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/config/supabase/api/supabaseClient'
import { Button } from '@/shared/ui/Button/ui/button'
import { ArrowRight, Loader2, Shield } from 'lucide-react'
import './AuthForm.css'

export const AuthForm: React.FC = () => {
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/about` }
                })
                if (error) throw error
                alert('Проверьте почту для подтверждения регистрации!')
            }
            navigate('/about', { replace: true })
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Ошибка авторизации'
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className='auth-form__header'>
                <h2>{ isLogin ? 'С возвращением' : 'Создать аккаунт' }</h2>
                <p>
                    { isLogin
                        ? 'Введите свои учетные данные для доступа к аккаунту'
                        : 'Зарегистрируйтесь, чтобы начать использовать все возможности' }
                </p>
            </div>

            <form className='auth-form' onSubmit={ handleAuth }>
                { error && (
                    <div className='auth-error-message'>
                        <Shield size={ 16 } />
                        <span>{ error }</span>
                    </div>
                ) }

                <div className='form-group'>
                    <label>Email адрес</label>
                    <input
                        type='email'
                        value={ email }
                        onChange={ (e) => setEmail(e.target.value) }
                        placeholder='your@email.com'
                        className='auth-input'
                        required
                        disabled={ isLoading }
                    />
                </div>

                <div className='form-group'>
                    <label>Пароль</label>
                    <input
                        type='password'
                        value={ password }
                        onChange={ (e) => setPassword(e.target.value) }
                        placeholder='Введите пароль'
                        className='auth-input'
                        required
                        disabled={ isLoading }
                        minLength={ 6 }
                    />
                </div>

                <Button className='auth-submit-btn' disabled={ isLoading } type='submit'>
                    { isLoading ? (
                        <>
                            <Loader2 className='animate-spin' size={ 20 } />
                            <span>Загрузка...</span>
                        </>
                    ) : (
                        <>
                            <span>{ isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться' }</span>
                            <ArrowRight size={ 20 } />
                        </>
                    ) }
                </Button>
            </form>

            <div className='auth-form__footer'>
                <span>{ isLogin ? 'Впервые у нас?' : 'Уже есть аккаунт?' }</span>
                <button
                    onClick={ () => {
                        setIsLogin(!isLogin)
                        setError(null)
                        setEmail('')
                        setPassword('')
                    } }
                    className='toggle-auth-btn'
                    disabled={ isLoading }
                >
                    { isLogin ? 'Создать аккаунт' : 'Войти в систему' }
                </button>
            </div>
        </>
    )
}

export default AuthForm
