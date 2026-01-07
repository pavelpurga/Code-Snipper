import { Suspense, type ComponentType, type ReactNode } from 'react'

export function withSuspense<T extends object>(LazyComp: ComponentType<T>, fallback: ReactNode = null) {
    return function Loadable(props: T) {
        return (
            <Suspense fallback={ fallback }>
                <LazyComp { ...props } />
            </Suspense>
        )
    }
}

