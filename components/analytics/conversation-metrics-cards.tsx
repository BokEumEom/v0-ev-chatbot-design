import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"
import { MessageSquareIcon, ClockIcon, CheckCircleIcon, UserIcon } from "lucide-react"

interface ConversationMetricsCardsProps {
  summary: ConversationAnalyticsSummary
}

export function ConversationMetricsCards({ summary }: ConversationMetricsCardsProps) {
  const { totalConversations, continuityMetrics, resolutionMetrics, satisfactionMetrics } = summary

  // 시간 형식 변환 (초 -> 분:초)
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // 퍼센트 형식 변환
  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 총 대화 수 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">총 대화 수</CardTitle>
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            평균 {Math.round(continuityMetrics.averageMessageCount)} 메시지/대화
          </p>
        </CardContent>
      </Card>

      {/* 평균 대화 시간 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">평균 대화 시간</CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(continuityMetrics.averageDuration)}</div>
          <p className="text-xs text-muted-foreground">
            응답 시간: {Math.round(continuityMetrics.averageResponseTime)}초
          </p>
        </CardContent>
      </Card>

      {/* 문제 해결률 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">문제 해결률</CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(resolutionMetrics.overallResolutionRate)}</div>
          <p className="text-xs text-muted-foreground">
            평균 {Math.round(resolutionMetrics.averageResolutionSteps)} 단계 소요
          </p>
        </CardContent>
      </Card>

      {/* 사용자 만족도 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">사용자 만족도</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{satisfactionMetrics.averageSatisfactionScore.toFixed(1)}/5</div>
          <p className="text-xs text-muted-foreground">
            상담원 연결률: {formatPercent(resolutionMetrics.agentTransferRate)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
