import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const inputVariants = cva(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                default: '',
                ghost: 'bg-transparent border-0 focus:ring-0',
            },
            inputSize: {   // <- переименовали
                default: 'h-10 px-3',
                sm: 'h-9 px-2',
                lg: 'h-11 px-4',
            },
        },
        defaultVariants: {
            variant: 'default',
            inputSize: 'default', // <- тоже
        },
    }
)

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement>,
        Omit<VariantProps<typeof inputVariants>, 'size'> {
    inputSize?: VariantProps<typeof inputVariants>['inputSize']
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, inputSize, ...props }, ref) => {
        return (
            <input
                ref={ ref }
                className={ twMerge(inputVariants({ variant, inputSize, className })) }
                { ...props }
            />
        )
    }
)

Input.displayName = 'Input'
