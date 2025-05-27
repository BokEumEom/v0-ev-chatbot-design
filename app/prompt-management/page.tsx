import { PromptVersionDashboard } from "@/components/prompt-management/prompt-version-dashboard"

export default function PromptManagementPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">프롬프트 버전 관리 대시보드</h1>
      <PromptVersionDashboard />
    </main>
  )
}
