import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 섹션 컨테이너 스타일
export const sectionStyles = cva("w-full", {
  variants: {
    size: {
      sm: "container-sm section-padding",
      md: "container-md section-padding",
      lg: "container-lg section-padding",
      xl: "container-xl section-padding",
      full: "container section-padding",
    },
    spacing: {
      none: "py-0",
      sm: "py-spacing-sm",
      md: "py-spacing-md",
      lg: "py-spacing-lg",
      xl: "py-spacing-xl",
    },
  },
  defaultVariants: {
    size: "lg",
    spacing: "xl",
  },
})

export interface SectionStylesProps extends VariantProps<typeof sectionStyles> {}

export function getSection({ size, spacing, className }: SectionStylesProps & { className?: string }) {
  return cn(sectionStyles({ size, spacing }), className)
}

// 그리드 레이아웃 스타일
export const gridStyles = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
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
    cols: 3,
    gap: "md",
  },
})

export interface GridStylesProps extends VariantProps<typeof gridStyles> {}

export function getGrid({ cols, gap, className }: GridStylesProps & { className?: string }) {
  return cn(gridStyles({ cols, gap }), className)
}

// 텍스트 스타일
export const textStyles = cva("", {
  variants: {
    variant: {
      h1: "text-heading-1 font-bold",
      h2: "text-heading-2 font-semibold",
      h3: "text-heading-3 font-semibold",
      h4: "text-heading-4 font-medium",
      bodyLg: "text-body-lg",
      body: "text-body-base",
      bodySm: "text-body-sm",
      bodyXs: "text-body-xs",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "body",
    weight: "normal",
    align: "left",
  },
})

export interface TextStylesProps extends VariantProps<typeof textStyles> {}

export function getText({ variant, weight, align, className }: TextStylesProps & { className?: string }) {
  return cn(textStyles({ variant, weight, align }), className)
}

// 카드 스타일
export const cardStyles = cva("rounded-md overflow-hidden", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground shadow-sm",
      outline: "border border-border bg-transparent",
      filled: "bg-secondary text-secondary-foreground",
    },
    padding: {
      none: "p-0",
      sm: "p-spacing-sm",
      md: "p-spacing-md",
      lg: "p-spacing-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
})

export interface CardStylesProps extends VariantProps<typeof cardStyles> {}

export function getCard({ variant, padding, className }: CardStylesProps & { className?: string }) {
  return cn(cardStyles({ variant, padding }), className)
}
