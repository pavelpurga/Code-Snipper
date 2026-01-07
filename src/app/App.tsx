import '../index.css';
import '../App.css';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary.tsx';
import AppRouter from '@/app/providers/router/index.ts';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/config/supabase/api/supabaseClient.ts';
import AuthPage from '@/pages/AuthPage';
import Navbar from '@/widgets/Navbar/index.ts';
import Sidebar from '@/widgets/Sidebar/index.ts';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from '@/shared/ui/Toast/ToastProvider'
import { ConfirmProvider } from '@/shared/ui/Confirm/ConfirmProvider'
import ErrorPage from '@/pages/ErrorPage/ui/ErrorPage'
import { useLocation } from 'react-router-dom'
import ScrollTop from '@/shared/ui/ScrollTop/ScrollTop'
import type { Session } from '@supabase/supabase-js'

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation()
    const isStandalone = location.pathname === '/auth' || location.pathname === '/error'

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('sidebar-collapsed')
            return saved ? JSON.parse(saved) : false
        } catch {
            return false
        }
    })
    useEffect(() => {
        try {
            localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed))
        } catch {
            // ignore localStorage write error
        }
    }, [isSidebarCollapsed])

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className='loading-screen'>
                <div className='flex flex-col items-center justify-center gap-4'>
                    <div className='relative'>
                        <Loader2 className='w-8 h-8 animate-spin text-primary' />
                        <div className='absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl rounded-full'></div>
                    </div>
                    <span className='text-lg font-medium'>Загрузка приложения...</span>
                </div>
            </div>
        );
    }

    if (!session) {
        return <AuthPage />;
    }

    return (
        <ErrorBoundary fallback={
            <ErrorPage />
        }>
            <ToastProvider>
                <ConfirmProvider>
                    { isStandalone ? (
                        <div style={ { height: '100svh', width: '100%', overflow: 'hidden' } }>
                            <AppRouter />
                            <ScrollTop />
                        </div>
                    ) : (
                        <div className={ `app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}` }>
                            <Navbar />
                            <div className='app-shell'>
                                <Sidebar isCollapsed={ isSidebarCollapsed } onToggle={ () => setIsSidebarCollapsed(v => !v) } />
                                <main className='app-content'>
                                    <div className='min-h-[calc(100vh-var(--navbar-height))] p-6 md:p-8'>
                                        <AppRouter />
                                    </div>
                                </main>
                            </div>
                            <ScrollTop />
                        </div>
                    ) }
                </ConfirmProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;