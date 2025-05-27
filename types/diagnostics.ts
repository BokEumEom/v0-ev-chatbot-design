// 진단 세션 데이터 타입
export interface DiagnosticSession {
  id: string
  userId?: string // 로그인한 사용자의 경우
  startTime: Date
  endTime?: Date
  completionStatus: "completed" | "abandoned" | "in_progress"
  vehicleModel?: string
  chargingStationType?: string
  initialProblemCategory?: string
  finalNodeId?: string // 최종 도달한 진단 노드
  userFeedback?: {
    helpful: boolean
    comments?: string
  }
  userInputs: Record<string, string> // 사용자가 입력한 추가 정보
}

// 진단 단계 데이터
export interface DiagnosticStep {
  sessionId: string
  timestamp: Date
  nodeId: string
  responseTime?: number // 사용자 응답 시간 (밀리초)
  userChoice?: string // 사용자가 선택한 옵션
}

// 진단 통계 요약
export interface DiagnosticsStats {
  totalSessions: number
  completedSessions: number
  abandonedSessions: number
  averageCompletionTime: number // 밀리초
  mostCommonProblems: Array<{
    category: string
    count: number
    percentage: number
  }>
  mostCommonSolutions: Array<{
    nodeId: string
    title: string
    count: number
    percentage: number
  }>
  averageStepsPerSession: number
  userSatisfactionRate: number // 0-100%
}

// 시간별 통계 데이터
export interface TimeSeriesData {
  date: string // ISO 형식 날짜
  sessions: number
  completionRate: number
  averageSteps: number
  satisfactionRate: number
}

// 필터 옵션
export interface DiagnosticsFilterOptions {
  dateRange?: {
    start: Date
    end: Date
  }
  vehicleModels?: string[]
  chargingStationTypes?: string[]
  problemCategories?: string[]
  completionStatus?: Array<"completed" | "abandoned" | "in_progress">
}
