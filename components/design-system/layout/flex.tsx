import type React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const flexStyles = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
      rowReverse: "flex-row-reverse",
      colReverse: "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
      wrapReverse: "flex-wrap-reverse",
    },
    gap: {
      none: "gap-0",
      xs: "gap-spacing-xs",
      sm: "gap-spacing-sm",
      md: "gap-spacing-md",
      lg: "gap-spacing-lg",
      xl: "gap-spacing-xl",
    },
  },
  defaultVariants: {
    direction: "row",
    align: "start",
    justify: "start",
    wrap: "nowrap",
    gap: "md",
  },
})

interface FlexProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof flexStyles> {
  children: React.ReactNode
}

export function Flex({ direction, align, justify, wrap, gap, className, children, ...props }: FlexProps) {
  return (
    <div className={cn(flexStyles({ direction, align, justify, wrap, gap }), className)} {...props}>
      {children}
    </div>
  )
}
