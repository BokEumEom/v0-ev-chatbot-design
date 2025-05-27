import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ComponentExampleProps {
  title: string
  description?: string
  preview: React.ReactNode
  code?: string
  className?: string
}

export function ComponentExample({ title, description, preview, code, className }: ComponentExampleProps) {
  return (
    <Card className={cn("mb-8", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="preview">
          <TabsList className="mx-6">
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            {code && <TabsTrigger value="code">코드</TabsTrigger>}
          </TabsList>
          <TabsContent value="preview" className="p-6 border-t">
            <div className="flex min-h-[200px] items-center justify-center p-4 rounded-md border">{preview}</div>
          </TabsContent>
          {code && (
            <TabsContent value="code" className="p-6 border-t">
              <pre className="p-4 rounded-md bg-muted overflow-x-auto">
                <code className="text-sm">{code}</code>
              </pre>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
