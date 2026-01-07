import { useEffect, useState } from 'react'
import type{ ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/shared/config/supabase/api/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface ProtectedRouteProps {
    children: ReactNode
    redirectTo?: string
}

export const ProtectedRoute = ({ children, redirectTo = '/' }: ProtectedRouteProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
            setLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    if (loading) return <div>Loading...</div>

    return user ? <>{ children }</> : <Navigate to={ redirectTo } replace />
}
