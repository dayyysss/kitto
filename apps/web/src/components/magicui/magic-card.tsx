import * as React from 'react'
import { useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
  children: React.ReactNode
}

/**
 * Magic UI - Magic Card
 * Card with dynamic spotlight hover glow following cursor.
 */
export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = '#E14D2A',
  gradientOpacity = 0.15,
  ...props
}: MagicCardProps) {
  const [mouseX, setMouseX] = useState<number>(-1000)
  const [mouseY, setMouseY] = useState<number>(-1000)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    setMouseX(e.clientX - left)
    setMouseY(e.clientY - top)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(-1000)
    setMouseY(-1000)
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm transition-all',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`,
          opacity: gradientOpacity,
        }}
      />
      {children}
    </div>
  )
}
