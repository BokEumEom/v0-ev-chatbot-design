import type React from "react"
import { type SectionStylesProps, sectionStyles } from "@/utils/design-system-utils"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLDivElement>, SectionStylesProps {
  as?: React.ElementType
  children: React.ReactNode
}

export function Section({
  as: Component = "section",
  size = "lg",
  spacing = "xl",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component className={cn(sectionStyles({ size, spacing }), className)} {...props}>
      {children}
    </Component>
  )
}
