import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[oklch(0.65_0.18_259)] text-white hover:bg-[oklch(0.58_0.18_259)]',
        ghost:
          'hover:bg-[oklch(0.22_0_0)] hover:text-[oklch(0.95_0_0)]',
        outline:
          'border border-[oklch(0.22_0_0)] bg-transparent hover:bg-[oklch(0.22_0_0)]',
        destructive:
          'bg-[oklch(0.55_0.2_25)] text-white hover:bg-[oklch(0.48_0.2_25)]',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-[6px]',
        sm: 'h-7 px-3 text-xs rounded-[6px]',
        icon: 'h-9 w-9 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
