import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const toastVariants = cva(
    'p-4 rounded-md shadow-lg bg-background border border-border text-foreground',
    {
        variants: {
            variant: {
                default: '',
                success: 'border-green-500 bg-green-50 text-green-800',
                error: 'border-red-500 bg-red-50 text-red-800',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface ToastProps
    extends ToastPrimitives.ToastProps,
        VariantProps<typeof toastVariants> {}

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <ToastPrimitives.Root
                ref={ ref }
                className={ twMerge(toastVariants({ variant, className })) }
                { ...props }
            />
        )
    }
)

Toast.displayName = 'Toast'
