import type React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  children: React.ReactNode
}

export function Container({ size = "lg", className, children, ...props }: ContainerProps) {
  const containerClass = {
    sm: "container-sm",
    md: "container-md",
    lg: "container-lg",
    xl: "container-xl",
    full: "container",
  }[size]

  return (
    <div className={cn(containerClass, "mx-auto px-4", className)} {...props}>
      {children}
    </div>
  )
}
