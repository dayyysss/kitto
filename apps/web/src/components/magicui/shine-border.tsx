import * as React from 'react'
import { cn } from '../../lib/utils'

interface ShineBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string | string[]
  className?: string
  children: React.ReactNode
}

/**
 * Magic UI - Shine Border
 * Dynamic animated gradient shine around containers.
 */
export function ShineBorder({
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 8,
  color = ['#E14D2A', '#F06543', '#D4A373', '#E14D2A'],
  className,
  children,
  ...props
}: ShineBorderProps) {
  const colorString = Array.isArray(color) ? color.join(',') : color

  return (
    <div
      style={
        {
          '--border-radius': `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        'relative rounded-[--border-radius] p-[1.5px] isolate overflow-hidden',
        className
      )}
      {...props}
    >
      <div
        style={
          {
            '--border-width': `${borderWidth}px`,
            '--border-radius': `${borderRadius}px`,
            '--shine-pulse-duration': `${duration}s`,
            '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            '--background-radial-gradient': `radial-gradient(transparent, transparent, ${colorString}, transparent, transparent)`,
          } as React.CSSProperties
        }
        className="pointer-events-none absolute inset-0 size-full rounded-[--border-radius] p-[--border-width] will-change-[background-position] content-[''] ![-webkit-mask-composite:xor] ![mask-composite:exclude] [background-image:var(--background-radial-gradient)] [background-size:300%_300%] [mask:var(--mask-linear-gradient)] animate-shine"
      />
      {children}
    </div>
  )
}
