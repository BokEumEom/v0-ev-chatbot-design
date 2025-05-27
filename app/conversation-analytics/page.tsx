import { ConversationAnalyticsDashboard } from "@/components/analytics/conversation-analytics-dashboard"

export const metadata = {
  title: "대화 분석 대시보드 | 전기차 충전 도우미",
  description: "AI 챗봇의 대화 지속성과 문제 해결률을 분석하는 대시보드",
}

export default function ConversationAnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">대화 분석 대시보드</h1>
        <p className="text-muted-foreground">
          AI 챗봇의 대화 지속성과 문제 해결률을 분석하여 성능을 개선하고 고객센터 연결 횟수를 줄이기 위한 인사이트를
          제공합니다.
        </p>
      </div>

      <ConversationAnalyticsDashboard />
    </div>
  )
}
