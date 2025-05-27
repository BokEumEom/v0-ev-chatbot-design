import type React from "react"
import { cn } from "@/lib/utils"
import { type CardStylesProps, cardStyles } from "@/utils/design-system-utils"

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement>, CardStylesProps {
  children: React.ReactNode
}

export function CardContainer({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardContainerProps) {
  return (
    <div className={cn(cardStyles({ variant, padding }), className)} {...props}>
      {children}
    </div>
  )
}
