import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ ref }
                className={ twMerge('p-4 rounded-lg border bg-background shadow-sm', className) }
                { ...props }
            />
        )
    }
)

Card.displayName = 'Card'
