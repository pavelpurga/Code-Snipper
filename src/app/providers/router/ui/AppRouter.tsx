import { Route, Routes } from 'react-router-dom';
import { routeConfig } from '@/shared/config/routeConfig/routeConfig.tsx';
import { Suspense } from 'react';

const AppRouter = () => {
    return (
        <Routes>
            { Object.values(routeConfig).map(({ path, element }) => (
                <Route
                    key={ path }
                    path={ path }
                    element={
                        <Suspense fallback={ <div>Loading...</div> }>
                            <div className='page-wrapper'>
                                { element }
                            </div>
                        </Suspense>
                    }
                />
            )) }
        </Routes>
    );
};

export default AppRouter;