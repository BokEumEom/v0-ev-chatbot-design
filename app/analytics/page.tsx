import { PromptAnalyticsDashboard } from "@/components/analytics/prompt-analytics-dashboard"

export const metadata = {
  title: "프롬프트 분석 대시보드 | 전기차 충전 도우미",
  description: "프롬프트 성능 분석 및 최적화 대시보드",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">프롬프트 분석 대시보드</h1>
        <p className="text-muted-foreground">프롬프트 성능을 분석하고 최적화하는 도구입니다.</p>
      </div>

      <PromptAnalyticsDashboard />
    </div>
  )
}
