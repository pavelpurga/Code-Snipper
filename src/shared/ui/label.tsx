import { forwardRef } from 'react'
import type { LabelHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const labelVariants = cva('text-sm font-medium text-foreground', {
    variants: {
        size: {
            default: 'text-sm',
            sm: 'text-xs',
            lg: 'text-base',
        },
    },
    defaultVariants: {
        size: 'default',
    },
})

export interface LabelProps
    extends LabelHTMLAttributes<HTMLLabelElement>,
        VariantProps<typeof labelVariants> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, size, ...props }, ref) => {
        return <label ref={ ref } className={ twMerge(labelVariants({ size, className })) } { ...props } />
    }
)

Label.displayName = 'Label'
