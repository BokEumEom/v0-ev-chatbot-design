import type React from "react"
import { Section } from "./layout/section"
import { Heading } from "./typography/heading"
import { Paragraph } from "./typography/paragraph"

interface ComponentShowcaseProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function ComponentShowcase({ title, description, children }: ComponentShowcaseProps) {
  return (
    <Section spacing="xl">
      <Heading level={2} className="mb-4">
        {title}
      </Heading>
      {description && (
        <Paragraph size="lg" color="muted" className="mb-8 max-w-3xl">
          {description}
        </Paragraph>
      )}
      <div>{children}</div>
    </Section>
  )
}
