import React, { Component } from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className='min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-900 p-6'>
                    <h1 className='text-3xl font-bold mb-4'>Что-то пошло не так 😔</h1>
                    <p className='mb-6'>
                        Произошла ошибка в приложении. Попробуйте перезагрузить страницу.
                    </p>
                    <button
                        onClick={ this.handleReload }
                        className='px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition'
                    >
                        Перезагрузить
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
