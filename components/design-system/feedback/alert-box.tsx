import type React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Heading } from "../typography/heading"

const alertVariants = cva("rounded-md p-4", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      secondary: "bg-secondary/10 text-secondary",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      danger: "bg-destructive/10 text-destructive",
      info: "bg-info/10 text-info",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface AlertBoxProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function AlertBox({ variant, title, icon, action, className, children, ...props }: AlertBoxProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <div className="flex items-start">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div className="flex-1">
          {title && (
            <Heading level={4} className="mb-1">
              {title}
            </Heading>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {action && <div className="ml-3">{action}</div>}
      </div>
    </div>
  )
}
