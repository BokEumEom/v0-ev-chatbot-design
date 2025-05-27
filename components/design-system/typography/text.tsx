import type React from "react"
import { cn } from "@/lib/utils"
import { type TextStylesProps, textStyles } from "@/utils/design-system-utils"

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextStylesProps {
  as?: React.ElementType
}

export function Text({
  as: Component = "p",
  variant = "body",
  weight,
  align,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component className={cn(textStyles({ variant, weight, align }), className)} {...props}>
      {children}
    </Component>
  )
}
