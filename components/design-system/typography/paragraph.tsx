import type React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const paragraphVariants = cva("", {
  variants: {
    size: {
      lg: "text-body-lg",
      base: "text-body-base",
      sm: "text-body-sm",
      xs: "text-body-xs",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
    },
    leading: {
      tight: "leading-tight",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    align: "left",
    color: "default",
    leading: "normal",
  },
})

export interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {}

export function Paragraph({ size, weight, align, color, leading, className, children, ...props }: ParagraphProps) {
  return (
    <p className={cn(paragraphVariants({ size, weight, align, color, leading }), className)} {...props}>
      {children}
    </p>
  )
}
