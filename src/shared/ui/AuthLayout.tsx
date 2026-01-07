import type{ ReactNode } from 'react'

interface AuthLayoutProps {
    children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background/50'>
            <div className='w-full max-w-md bg-background rounded-xl shadow-lg p-8 sm:p-10'>
                { children }
            </div>
        </div>
    )
}
