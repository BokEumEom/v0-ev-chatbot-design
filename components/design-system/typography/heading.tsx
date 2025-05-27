import type React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const headingVariants = cva("", {
  variants: {
    level: {
      1: "text-heading-1 font-bold",
      2: "text-heading-2 font-semibold",
      3: "text-heading-3 font-semibold",
      4: "text-heading-4 font-medium",
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
      accent: "text-accent",
    },
  },
  defaultVariants: {
    level: 2,
    align: "left",
    color: "default",
  },
})

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export function Heading({ level = 2, align, color, as, className, children, ...props }: HeadingProps) {
  const Component = as || (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6")

  return (
    <Component className={cn(headingVariants({ level, align, color }), className)} {...props}>
      {children}
    </Component>
  )
}
