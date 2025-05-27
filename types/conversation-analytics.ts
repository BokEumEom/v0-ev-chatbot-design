// 대화 세션 데이터 타입
export interface ConversationSession {
  id: string
  userId?: string
  startTime: Date
  endTime?: Date
  messageCount: number
  duration: number // 초 단위
  issueType: string
  issueResolved: boolean
  resolutionSteps: number
  transferredToAgent: boolean
  abandonedByUser: boolean
  userSatisfaction?: number // 1-5 점수
  deviceType: "mobile" | "desktop" | "tablet" | "unknown"
}

// 대화 메시지 데이터 타입
export interface ConversationMessage {
  id: string
  sessionId: string
  timestamp: Date
  sender: "user" | "bot" | "agent"
  content: string
  messageType: "question" | "answer" | "followUp" | "confirmation" | "other"
  intent?: string
  entities?: Record<string, any>
  sentimentScore?: number // -1 ~ 1 범위
  followUpAccepted?: boolean
}

// 대화 단계 데이터 타입
export interface ConversationStage {
  sessionId: string
  stage: "identification" | "troubleshooting" | "resolution" | "confirmation" | "completed"
  startTime: Date
  endTime?: Date
  duration: number // 초 단위
  successful: boolean
}

// 대화 지속성 지표
export interface ContinuityMetrics {
  averageMessageCount: number
  averageDuration: number // 초 단위
  abandonmentRate: number // 0-1 범위
  followUpAcceptanceRate: number // 0-1 범위
  conversationReengagementRate: number // 0-1 범위
  averageResponseTime: number // 초 단위
  singleMessageConversationRate: number // 0-1 범위
}

// 해결률 지표
export interface ResolutionMetrics {
  overallResolutionRate: number // 0-1 범위
  averageResolutionSteps: number
  resolutionRateByIssueType: Record<string, number>
  agentTransferRate: number // 0-1 범위
  firstResponseResolutionRate: number // 0-1 범위
  averageTimeToResolution: number // 초 단위
}

// 사용자 만족도 지표
export interface SatisfactionMetrics {
  averageSatisfactionScore: number // 1-5 범위
  satisfactionDistribution: Record<number, number> // 점수별 분포
  satisfactionByIssueType: Record<string, number>
  satisfactionByResolutionStatus: {
    resolved: number
    unresolved: number
  }
}

// 시계열 데이터 포인트
export interface TimeSeriesDataPoint {
  date: string
  resolutionRate: number
  averageMessageCount: number
  averageDuration: number
  satisfactionScore: number
  agentTransferRate: number
}

// 필터 옵션
export interface ConversationAnalyticsFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  issueTypes?: string[]
  resolutionStatus?: "resolved" | "unresolved" | "all"
  deviceTypes?: Array<"mobile" | "desktop" | "tablet" | "unknown">
  satisfactionRange?: {
    min: number
    max: number
  }
  transferredToAgent?: boolean
}

// 대화 분석 요약
export interface ConversationAnalyticsSummary {
  totalConversations: number
  continuityMetrics: ContinuityMetrics
  resolutionMetrics: ResolutionMetrics
  satisfactionMetrics: SatisfactionMetrics
  timeSeriesData: TimeSeriesDataPoint[]
  topIssueTypes: Array<{
    issueType: string
    count: number
    resolutionRate: number
  }>
  abandonmentPoints: Array<{
    stage: string
    count: number
    percentage: number
  }>
}
