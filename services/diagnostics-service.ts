import type {
  DiagnosticSession,
  DiagnosticStep,
  DiagnosticsStats,
  TimeSeriesData,
  DiagnosticsFilterOptions,
} from "@/types/diagnostics"
import type { TroubleshootingNode } from "@/types/troubleshooting"
import { troubleshootingTree } from "@/data/troubleshooting-tree"

// 노드 ID로 노드 찾기 헬퍼 함수
function findNodeById(nodeId: string, nodes: TroubleshootingNode[] = troubleshootingTree): TroubleshootingNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node
    if (node.children) {
      const found = findNodeById(nodeId, node.children)
      if (found) return found
    }
  }
  return null
}

export class DiagnosticsService {
  private static instance: DiagnosticsService

  // 실제 구현에서는 데이터베이스에 저장
  private sessions: DiagnosticSession[] = []
  private steps: DiagnosticStep[] = []

  private constructor() {
    // 개발용 더미 데이터 생성
    this.generateDummyData()
  }

  public static getInstance(): DiagnosticsService {
    if (!DiagnosticsService.instance) {
      DiagnosticsService.instance = new DiagnosticsService()
    }
    return DiagnosticsService.instance
  }

  // 새 진단 세션 시작
  public startSession(initialData: Partial<DiagnosticSession> = {}): DiagnosticSession {
    const session: DiagnosticSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      startTime: new Date(),
      completionStatus: "in_progress",
      userInputs: {},
      ...initialData,
    }

    this.sessions.push(session)
    return session
  }

  // 진단 세션 업데이트
  public updateSession(sessionId: string, updates: Partial<DiagnosticSession>): DiagnosticSession | null {
    const sessionIndex = this.sessions.findIndex((s) => s.id === sessionId)
    if (sessionIndex === -1) return null

    this.sessions[sessionIndex] = {
      ...this.sessions[sessionIndex],
      ...updates,
    }

    return this.sessions[sessionIndex]
  }

  // 진단 세션 완료
  public completeSession(
    sessionId: string,
    finalNodeId: string,
    userFeedback?: DiagnosticSession["userFeedback"],
  ): DiagnosticSession | null {
    return this.updateSession(sessionId, {
      endTime: new Date(),
      completionStatus: "completed",
      finalNodeId,
      userFeedback,
    })
  }

  // 진단 세션 포기
  public abandonSession(sessionId: string): DiagnosticSession | null {
    return this.updateSession(sessionId, {
      endTime: new Date(),
      completionStatus: "abandoned",
    })
  }

  // 진단 단계 기록
  public recordStep(step: Omit<DiagnosticStep, "timestamp">): DiagnosticStep {
    const newStep: DiagnosticStep = {
      ...step,
      timestamp: new Date(),
    }

    this.steps.push(newStep)
    return newStep
  }

  // 세션 조회
  public getSession(sessionId: string): DiagnosticSession | null {
    return this.sessions.find((s) => s.id === sessionId) || null
  }

  // 세션 목록 조회 (필터링 지원)
  public getSessions(filters?: DiagnosticsFilterOptions): DiagnosticSession[] {
    if (!filters) return [...this.sessions]

    return this.sessions.filter((session) => {
      // 날짜 범위 필터
      if (filters.dateRange) {
        if (
          session.startTime < filters.dateRange.start ||
          (session.endTime && session.endTime > filters.dateRange.end)
        ) {
          return false
        }
      }

      // 차량 모델 필터
      if (filters.vehicleModels?.length && session.vehicleModel) {
        if (!filters.vehicleModels.includes(session.vehicleModel)) {
          return false
        }
      }

      // 충전소 타입 필터
      if (filters.chargingStationTypes?.length && session.chargingStationType) {
        if (!filters.chargingStationTypes.includes(session.chargingStationType)) {
          return false
        }
      }

      // 문제 카테고리 필터
      if (filters.problemCategories?.length && session.initialProblemCategory) {
        if (!filters.problemCategories.includes(session.initialProblemCategory)) {
          return false
        }
      }

      // 완료 상태 필터
      if (filters.completionStatus?.length) {
        if (!filters.completionStatus.includes(session.completionStatus)) {
          return false
        }
      }

      return true
    })
  }

  // 세션 단계 조회
  public getSessionSteps(sessionId: string): DiagnosticStep[] {
    return this.steps
      .filter((step) => step.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // 통계 요약 생성
  public generateStats(filters?: DiagnosticsFilterOptions): DiagnosticsStats {
    const filteredSessions = this.getSessions(filters)
    const completedSessions = filteredSessions.filter((s) => s.completionStatus === "completed")
    const abandonedSessions = filteredSessions.filter((s) => s.completionStatus === "abandoned")

    // 완료 시간 계산
    const completionTimes = completedSessions
      .filter((s) => s.endTime)
      .map((s) => s.endTime!.getTime() - s.startTime.getTime())

    const averageCompletionTime =
      completionTimes.length > 0 ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0

    // 가장 흔한 문제 카테고리
    const problemCounts: Record<string, number> = {}
    filteredSessions.forEach((session) => {
      if (session.initialProblemCategory) {
        problemCounts[session.initialProblemCategory] = (problemCounts[session.initialProblemCategory] || 0) + 1
      }
    })

    const mostCommonProblems = Object.entries(problemCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / filteredSessions.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 가장 흔한 해결책
    const solutionCounts: Record<string, number> = {}
    completedSessions.forEach((session) => {
      if (session.finalNodeId) {
        solutionCounts[session.finalNodeId] = (solutionCounts[session.finalNodeId] || 0) + 1
      }
    })

    const mostCommonSolutions = Object.entries(solutionCounts)
      .map(([nodeId, count]) => {
        const node = findNodeById(nodeId)
        return {
          nodeId,
          title: node?.title || "Unknown",
          count,
          percentage: (count / completedSessions.length) * 100,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 세션당 평균 단계 수
    const stepsPerSession = filteredSessions.map((session) => this.getSessionSteps(session.id).length)

    const averageStepsPerSession =
      stepsPerSession.length > 0 ? stepsPerSession.reduce((sum, steps) => sum + steps, 0) / stepsPerSession.length : 0

    // 사용자 만족도
    const sessionsWithFeedback = completedSessions.filter((s) => s.userFeedback)
    const satisfiedSessions = sessionsWithFeedback.filter((s) => s.userFeedback?.helpful)

    const userSatisfactionRate =
      sessionsWithFeedback.length > 0 ? (satisfiedSessions.length / sessionsWithFeedback.length) * 100 : 0

    return {
      totalSessions: filteredSessions.length,
      completedSessions: completedSessions.length,
      abandonedSessions: abandonedSessions.length,
      averageCompletionTime,
      mostCommonProblems,
      mostCommonSolutions,
      averageStepsPerSession,
      userSatisfactionRate,
    }
  }

  // 시계열 데이터 생성
  public generateTimeSeriesData(
    interval: "day" | "week" | "month" = "day",
    filters?: DiagnosticsFilterOptions,
  ): TimeSeriesData[] {
    const filteredSessions = this.getSessions(filters)

    // 날짜별로 세션 그룹화
    const sessionsByDate: Record<string, DiagnosticSession[]> = {}

    filteredSessions.forEach((session) => {
      let dateKey: string

      const date = new Date(session.startTime)

      if (interval === "day") {
        dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else if (interval === "week") {
        // 주의 시작일 (일요일)로 설정
        const day = date.getDay()
        const diff = date.getDate() - day
        const weekStart = new Date(date)
        weekStart.setDate(diff)
        dateKey = weekStart.toISOString().split("T")[0]
      } else {
        // month
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = []
      }

      sessionsByDate[dateKey].push(session)
    })

    // 시계열 데이터 생성
    return Object.entries(sessionsByDate)
      .map(([date, sessions]) => {
        const completedSessions = sessions.filter((s) => s.completionStatus === "completed")
        const completionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0

        // 세션당 평균 단계 수
        const stepsPerSession = sessions.map((session) => this.getSessionSteps(session.id).length)

        const averageSteps =
          stepsPerSession.length > 0
            ? stepsPerSession.reduce((sum, steps) => sum + steps, 0) / stepsPerSession.length
            : 0

        // 사용자 만족도
        const sessionsWithFeedback = completedSessions.filter((s) => s.userFeedback)
        const satisfiedSessions = sessionsWithFeedback.filter((s) => s.userFeedback?.helpful)

        const satisfactionRate =
          sessionsWithFeedback.length > 0 ? (satisfiedSessions.length / sessionsWithFeedback.length) * 100 : 0

        return {
          date,
          sessions: sessions.length,
          completionRate,
          averageSteps,
          satisfactionRate,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 개발용 더미 데이터 생성
  private generateDummyData() {
    const vehicleModels = ["테슬라 모델 3", "현대 아이오닉 5", "기아 EV6", "테슬라 모델 Y", "폭스바겐 ID.4"]
    const chargingTypes = ["AC 완속 충전", "DC 급속 충전", "가정용 충전기", "공용 충전소"]
    const problemCategories = [
      "충전이 시작되지 않음",
      "충전 속도가 느림",
      "충전 중 오류 발생",
      "앱 연결 문제",
      "결제 문제",
    ]

    // 노드 ID 목록 (마지막 노드들)
    const finalNodeIds = [
      "cable_connection_issue",
      "station_power_issue",
      "vehicle_battery_issue",
      "payment_method_issue",
      "app_connection_issue",
      "account_issue",
    ]

    // 지난 30일 동안의 더미 데이터 생성
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // 100개의 더미 세션 생성
    for (let i = 0; i < 100; i++) {
      // 랜덤 날짜 (지난 30일 이내)
      const sessionDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()))

      // 랜덤 세션 데이터
      const vehicleModel = vehicleModels[Math.floor(Math.random() * vehicleModels.length)]
      const chargingType = chargingTypes[Math.floor(Math.random() * chargingTypes.length)]
      const problemCategory = problemCategories[Math.floor(Math.random() * problemCategories.length)]

      // 완료 상태 (80% 완료, 20% 포기)
      const isCompleted = Math.random() < 0.8

      // 세션 생성
      const session: DiagnosticSession = {
        id: `dummy_session_${i}`,
        startTime: sessionDate,
        completionStatus: isCompleted ? "completed" : "abandoned",
        vehicleModel,
        chargingStationType: chargingType,
        initialProblemCategory: problemCategory,
        userInputs: {},
      }

      if (isCompleted) {
        // 세션 완료 시간 (5-15분 후)
        const endTime = new Date(sessionDate)
        endTime.setMinutes(endTime.getMinutes() + 5 + Math.floor(Math.random() * 10))

        session.endTime = endTime
        session.finalNodeId = finalNodeIds[Math.floor(Math.random() * finalNodeIds.length)]

        // 90%의 확률로 피드백 추가
        if (Math.random() < 0.9) {
          session.userFeedback = {
            helpful: Math.random() < 0.85, // 85% 만족
            comments: Math.random() < 0.3 ? "매우 도움이 되었습니다." : undefined,
          }
        }
      } else if (Math.random() < 0.7) {
        // 70%의 포기한 세션에 종료 시간 추가
        const endTime = new Date(sessionDate)
        endTime.setMinutes(endTime.getMinutes() + 1 + Math.floor(Math.random() * 5))
        session.endTime = endTime
      }

      this.sessions.push(session)

      // 세션에 대한 단계 생성 (3-8 단계)
      const stepCount = 3 + Math.floor(Math.random() * 6)

      for (let j = 0; j < stepCount; j++) {
        const stepTime = new Date(sessionDate)
        stepTime.setMinutes(stepTime.getMinutes() + j * (1 + Math.random()))

        this.steps.push({
          sessionId: session.id,
          timestamp: stepTime,
          nodeId: `node_${j}`,
          responseTime: 1000 + Math.floor(Math.random() * 10000), // 1-11초
          userChoice: `choice_${Math.floor(Math.random() * 3)}`,
        })
      }
    }
  }

  // 필터 옵션 목록 가져오기 (차량 모델, 충전소 타입, 문제 카테고리)
  public getFilterOptions() {
    const vehicleModels = new Set<string>()
    const chargingStationTypes = new Set<string>()
    const problemCategories = new Set<string>()

    this.sessions.forEach((session) => {
      if (session.vehicleModel) vehicleModels.add(session.vehicleModel)
      if (session.chargingStationType) chargingStationTypes.add(session.chargingStationType)
      if (session.initialProblemCategory) problemCategories.add(session.initialProblemCategory)
    })

    return {
      vehicleModels: Array.from(vehicleModels),
      chargingStationTypes: Array.from(chargingStationTypes),
      problemCategories: Array.from(problemCategories),
    }
  }

  // CSV 형식으로 데이터 내보내기
  public exportSessionsToCSV(filters?: DiagnosticsFilterOptions): string {
    const sessions = this.getSessions(filters)

    // CSV 헤더
    const headers = [
      "ID",
      "시작 시간",
      "종료 시간",
      "상태",
      "차량 모델",
      "충전소 타입",
      "초기 문제 카테고리",
      "최종 노드",
      "만족도",
      "코멘트",
    ]

    // CSV 행 데이터
    const rows = sessions.map((session) => [
      session.id,
      session.startTime.toISOString(),
      session.endTime ? session.endTime.toISOString() : "",
      session.completionStatus,
      session.vehicleModel || "",
      session.chargingStationType || "",
      session.initialProblemCategory || "",
      session.finalNodeId || "",
      session.userFeedback ? (session.userFeedback.helpful ? "만족" : "불만족") : "",
      session.userFeedback?.comments || "",
    ])

    // CSV 문자열 생성
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    return csvContent
  }
}

// 서비스 인스턴스 내보내기
export const diagnosticsService = DiagnosticsService.getInstance()
