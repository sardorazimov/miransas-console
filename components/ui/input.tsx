import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[6px] border border-[oklch(0.22_0_0)] bg-[oklch(0.175_0_0)] px-3 py-1 text-sm text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.55_0_0)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.65_0.18_259)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
