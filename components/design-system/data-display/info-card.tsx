import type React from "react"
import { CardContainer } from "./card-container"
import { Heading } from "../typography/heading"
import { Paragraph } from "../typography/paragraph"
import { cn } from "@/lib/utils"

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  variant?: "default" | "outline" | "filled"
}

export function InfoCard({
  title,
  description,
  icon,
  footer,
  variant = "default",
  className,
  ...props
}: InfoCardProps) {
  return (
    <CardContainer variant={variant} className={cn("", className)} {...props}>
      <div className="flex items-start gap-4">
        {icon && <div className="text-primary shrink-0">{icon}</div>}
        <div className="space-y-2">
          <Heading level={4}>{title}</Heading>
          <Paragraph size="base" color="muted">
            {description}
          </Paragraph>
        </div>
      </div>
      {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
    </CardContainer>
  )
}
