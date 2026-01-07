import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from '@/app/providers/store/store.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/providers/query-client';
import { initAuth } from '@/processes/auth/model/initAuth'
import App from '@/app/App.tsx';
import '@/shared/config/i18n/i18n';
import { BrowserRouter } from 'react-router-dom';

initAuth()
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={ store }>
                <QueryClientProvider client={ queryClient }>
                    <App />
                </QueryClientProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>,
)
