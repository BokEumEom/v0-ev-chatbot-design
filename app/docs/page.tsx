import { ApiDocumentation } from "@/components/api-documentation"

export default function DocsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <h1 className="text-3xl font-bold mb-8">API 문서</h1>
      <ApiDocumentation />
    </main>
  )
}
