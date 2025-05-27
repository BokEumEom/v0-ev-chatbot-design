import type React from "react"
import { type GridStylesProps, gridStyles } from "@/utils/design-system-utils"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement>, GridStylesProps {
  children: React.ReactNode
}

export function Grid({ cols = 3, gap = "md", className, children, ...props }: GridProps) {
  return (
    <div className={cn(gridStyles({ cols, gap }), className)} {...props}>
      {children}
    </div>
  )
}
