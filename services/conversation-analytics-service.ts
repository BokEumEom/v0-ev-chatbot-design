import type {
  ConversationSession,
  ConversationMessage,
  ConversationStage,
  ConversationAnalyticsSummary,
  ConversationAnalyticsFilters,
  ContinuityMetrics,
  ResolutionMetrics,
  SatisfactionMetrics,
  TimeSeriesDataPoint,
} from "@/types/conversation-analytics"
import { addDays, format, subDays, differenceInDays } from "date-fns"

export class ConversationAnalyticsService {
  private static instance: ConversationAnalyticsService
  private sessions: ConversationSession[] = []
  private messages: ConversationMessage[] = []
  private stages: ConversationStage[] = []

  private constructor() {
    // 개발용 더미 데이터 생성
    this.generateDummyData()
  }

  public static getInstance(): ConversationAnalyticsService {
    if (!ConversationAnalyticsService.instance) {
      ConversationAnalyticsService.instance = new ConversationAnalyticsService()
    }
    return ConversationAnalyticsService.instance
  }

  /**
   * 대화 세션 추가
   */
  public addSession(session: Omit<ConversationSession, "id">): ConversationSession {
    const newSession: ConversationSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }
    this.sessions.push(newSession)
    return newSession
  }

  /**
   * 대화 메시지 추가
   */
  public addMessage(message: Omit<ConversationMessage, "id">): ConversationMessage {
    const newMessage: ConversationMessage = {
      ...message,
      id: `message_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }
    this.messages.push(newMessage)
    return newMessage
  }

  /**
   * 대화 단계 추가
   */
  public addStage(stage: ConversationStage): ConversationStage {
    this.stages.push(stage)
    return stage
  }

  /**
   * 필터링된 세션 목록 조회
   */
  public getSessions(filters?: ConversationAnalyticsFilters): ConversationSession[] {
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

      // 이슈 타입 필터
      if (filters.issueTypes?.length && !filters.issueTypes.includes(session.issueType)) {
        return false
      }

      // 해결 상태 필터
      if (filters.resolutionStatus && filters.resolutionStatus !== "all") {
        if (
          (filters.resolutionStatus === "resolved" && !session.issueResolved) ||
          (filters.resolutionStatus === "unresolved" && session.issueResolved)
        ) {
          return false
        }
      }

      // 기기 타입 필터
      if (filters.deviceTypes?.length && !filters.deviceTypes.includes(session.deviceType)) {
        return false
      }

      // 만족도 범위 필터
      if (filters.satisfactionRange && session.userSatisfaction) {
        if (
          session.userSatisfaction < filters.satisfactionRange.min ||
          session.userSatisfaction > filters.satisfactionRange.max
        ) {
          return false
        }
      }

      // 상담원 연결 필터
      if (filters.transferredToAgent !== undefined && session.transferredToAgent !== filters.transferredToAgent) {
        return false
      }

      return true
    })
  }

  /**
   * 세션 ID로 메시지 목록 조회
   */
  public getMessagesBySessionId(sessionId: string): ConversationMessage[] {
    return this.messages
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * 세션 ID로 단계 목록 조회
   */
  public getStagesBySessionId(sessionId: string): ConversationStage[] {
    return this.stages
      .filter((stage) => stage.sessionId === sessionId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  /**
   * 대화 지속성 지표 계산
   */
  private calculateContinuityMetrics(
    sessions: ConversationSession[],
    messages: ConversationMessage[],
  ): ContinuityMetrics {
    // 평균 메시지 수
    const averageMessageCount =
      sessions.length > 0 ? sessions.reduce((sum, session) => sum + session.messageCount, 0) / sessions.length : 0

    // 평균 대화 시간 (초)
    const averageDuration =
      sessions.length > 0 ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length : 0

    // 중단율
    const abandonmentRate =
      sessions.length > 0 ? sessions.filter((session) => session.abandonedByUser).length / sessions.length : 0

    // 후속 질문 수락률
    const followUpMessages = messages.filter(
      (message) => message.messageType === "followUp" && message.followUpAccepted !== undefined,
    )
    const followUpAcceptanceRate =
      followUpMessages.length > 0
        ? followUpMessages.filter((message) => message.followUpAccepted).length / followUpMessages.length
        : 0

    // 대화 재개율 (24시간 내에 다시 대화를 시작한 사용자 비율)
    // 실제 구현에서는 사용자 ID를 기반으로 계산해야 함
    const conversationReengagementRate = 0.15 // 더미 데이터

    // 평균 응답 시간 (초)
    // 실제 구현에서는 연속된 메시지 간의 시간 차이를 계산해야 함
    const averageResponseTime = 25 // 더미 데이터

    // 단일 메시지 대화율
    const singleMessageConversationRate =
      sessions.length > 0 ? sessions.filter((session) => session.messageCount <= 2).length / sessions.length : 0

    return {
      averageMessageCount,
      averageDuration,
      abandonmentRate,
      followUpAcceptanceRate,
      conversationReengagementRate,
      averageResponseTime,
      singleMessageConversationRate,
    }
  }

  /**
   * 해결률 지표 계산
   */
  private calculateResolutionMetrics(sessions: ConversationSession[]): ResolutionMetrics {
    // 전체 해결률
    const overallResolutionRate =
      sessions.length > 0 ? sessions.filter((session) => session.issueResolved).length / sessions.length : 0

    // 평균 해결 단계 수
    const resolvedSessions = sessions.filter((session) => session.issueResolved)
    const averageResolutionSteps =
      resolvedSessions.length > 0
        ? resolvedSessions.reduce((sum, session) => sum + session.resolutionSteps, 0) / resolvedSessions.length
        : 0

    // 이슈 타입별 해결률
    const issueTypes = [...new Set(sessions.map((session) => session.issueType))]
    const resolutionRateByIssueType: Record<string, number> = {}

    issueTypes.forEach((issueType) => {
      const issueTypeSessions = sessions.filter((session) => session.issueType === issueType)
      resolutionRateByIssueType[issueType] =
        issueTypeSessions.length > 0
          ? issueTypeSessions.filter((session) => session.issueResolved).length / issueTypeSessions.length
          : 0
    })

    // 상담원 연결률
    const agentTransferRate =
      sessions.length > 0 ? sessions.filter((session) => session.transferredToAgent).length / sessions.length : 0

    // 첫 응답 해결률 (메시지 수가 3개 이하인 해결된 대화)
    const firstResponseResolutionRate =
      sessions.length > 0
        ? sessions.filter((session) => session.issueResolved && session.messageCount <= 3).length / sessions.length
        : 0

    // 평균 해결 시간 (초)
    const averageTimeToResolution =
      resolvedSessions.length > 0
        ? resolvedSessions.reduce((sum, session) => sum + session.duration, 0) / resolvedSessions.length
        : 0

    return {
      overallResolutionRate,
      averageResolutionSteps,
      resolutionRateByIssueType,
      agentTransferRate,
      firstResponseResolutionRate,
      averageTimeToResolution,
    }
  }

  /**
   * 사용자 만족도 지표 계산
   */
  private calculateSatisfactionMetrics(sessions: ConversationSession[]): SatisfactionMetrics {
    // 만족도가 있는 세션만 필터링
    const sessionsWithSatisfaction = sessions.filter((session) => session.userSatisfaction !== undefined)

    // 평균 만족도 점수
    const averageSatisfactionScore =
      sessionsWithSatisfaction.length > 0
        ? sessionsWithSatisfaction.reduce((sum, session) => sum + (session.userSatisfaction || 0), 0) /
          sessionsWithSatisfaction.length
        : 0

    // 만족도 분포
    const satisfactionDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    sessionsWithSatisfaction.forEach((session) => {
      if (session.userSatisfaction) {
        satisfactionDistribution[session.userSatisfaction] =
          (satisfactionDistribution[session.userSatisfaction] || 0) + 1
      }
    })

    // 이슈 타입별 만족도
    const issueTypes = [...new Set(sessions.map((session) => session.issueType))]
    const satisfactionByIssueType: Record<string, number> = {}

    issueTypes.forEach((issueType) => {
      const issueTypeSessions = sessionsWithSatisfaction.filter((session) => session.issueType === issueType)
      satisfactionByIssueType[issueType] =
        issueTypeSessions.length > 0
          ? issueTypeSessions.reduce((sum, session) => sum + (session.userSatisfaction || 0), 0) /
            issueTypeSessions.length
          : 0
    })

    // 해결 상태별 만족도
    const resolvedSessions = sessionsWithSatisfaction.filter((session) => session.issueResolved)
    const unresolvedSessions = sessionsWithSatisfaction.filter((session) => !session.issueResolved)

    const satisfactionByResolutionStatus = {
      resolved:
        resolvedSessions.length > 0
          ? resolvedSessions.reduce((sum, session) => sum + (session.userSatisfaction || 0), 0) /
            resolvedSessions.length
          : 0,
      unresolved:
        unresolvedSessions.length > 0
          ? unresolvedSessions.reduce((sum, session) => sum + (session.userSatisfaction || 0), 0) /
            unresolvedSessions.length
          : 0,
    }

    return {
      averageSatisfactionScore,
      satisfactionDistribution,
      satisfactionByIssueType,
      satisfactionByResolutionStatus,
    }
  }

  /**
   * 시계열 데이터 생성
   */
  private generateTimeSeriesData(sessions: ConversationSession[]): TimeSeriesDataPoint[] {
    // 날짜별로 세션 그룹화
    const sessionsByDate: Record<string, ConversationSession[]> = {}

    sessions.forEach((session) => {
      const dateKey = format(session.startTime, "yyyy-MM-dd")
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = []
      }
      sessionsByDate[dateKey].push(session)
    })

    // 날짜 범위 결정
    let dates: string[] = []
    if (sessions.length > 0) {
      const startDate = new Date(Math.min(...sessions.map((s) => s.startTime.getTime())))
      const endDate = new Date(Math.max(...sessions.map((s) => s.startTime.getTime())))
      const dayCount = differenceInDays(endDate, startDate) + 1

      // 날짜 범위 생성
      dates = Array.from({ length: dayCount }, (_, i) => {
        return format(addDays(startDate, i), "yyyy-MM-dd")
      })
    } else {
      // 세션이 없는 경우 최근 7일 데이터 생성
      const endDate = new Date()
      dates = Array.from({ length: 7 }, (_, i) => {
        return format(subDays(endDate, 6 - i), "yyyy-MM-dd")
      })
    }

    // 시계열 데이터 생성
    return dates.map((date) => {
      const dateSessions = sessionsByDate[date] || []
      const resolvedSessions = dateSessions.filter((session) => session.issueResolved)
      const sessionsWithSatisfaction = dateSessions.filter((session) => session.userSatisfaction !== undefined)
      const transferredSessions = dateSessions.filter((session) => session.transferredToAgent)

      return {
        date,
        resolutionRate: dateSessions.length > 0 ? resolvedSessions.length / dateSessions.length : 0,
        averageMessageCount:
          dateSessions.length > 0
            ? dateSessions.reduce((sum, session) => sum + session.messageCount, 0) / dateSessions.length
            : 0,
        averageDuration:
          dateSessions.length > 0
            ? dateSessions.reduce((sum, session) => sum + session.duration, 0) / dateSessions.length
            : 0,
        satisfactionScore:
          sessionsWithSatisfaction.length > 0
            ? sessionsWithSatisfaction.reduce((sum, session) => sum + (session.userSatisfaction || 0), 0) /
              sessionsWithSatisfaction.length
            : 0,
        agentTransferRate: dateSessions.length > 0 ? transferredSessions.length / dateSessions.length : 0,
      }
    })
  }

  /**
   * 상위 이슈 타입 추출
   */
  private extractTopIssueTypes(sessions: ConversationSession[]): Array<{
    issueType: string
    count: number
    resolutionRate: number
  }> {
    // 이슈 타입별 세션 수 계산
    const issueTypeCounts: Record<string, { count: number; resolved: number }> = {}

    sessions.forEach((session) => {
      if (!issueTypeCounts[session.issueType]) {
        issueTypeCounts[session.issueType] = { count: 0, resolved: 0 }
      }
      issueTypeCounts[session.issueType].count++
      if (session.issueResolved) {
        issueTypeCounts[session.issueType].resolved++
      }
    })

    // 상위 이슈 타입 추출
    return Object.entries(issueTypeCounts)
      .map(([issueType, { count, resolved }]) => ({
        issueType,
        count,
        resolutionRate: count > 0 ? resolved / count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  /**
   * 중단 지점 분석
   */
  private analyzeAbandonmentPoints(sessions: ConversationSession[]): Array<{
    stage: string
    count: number
    percentage: number
  }> {
    const abandonedSessions = sessions.filter((session) => session.abandonedByUser)
    const stageMapping: Record<string, string> = {
      identification: "문제 식별",
      troubleshooting: "문제 해결",
      resolution: "해결책 제시",
      confirmation: "해결 확인",
      completed: "완료",
    }

    // 세션별 마지막 단계 추출
    const lastStages: Record<string, number> = {
      identification: 0,
      troubleshooting: 0,
      resolution: 0,
      confirmation: 0,
      completed: 0,
    }

    abandonedSessions.forEach((session) => {
      const stages = this.getStagesBySessionId(session.id)
      if (stages.length > 0) {
        const lastStage = stages[stages.length - 1]
        lastStages[lastStage.stage] = (lastStages[lastStage.stage] || 0) + 1
      } else {
        // 단계 정보가 없는 경우 식별 단계로 간주
        lastStages.identification = (lastStages.identification || 0) + 1
      }
    })

    // 중단 지점 분석 결과 생성
    return Object.entries(lastStages)
      .map(([stage, count]) => ({
        stage: stageMapping[stage] || stage,
        count,
        percentage: abandonedSessions.length > 0 ? count / abandonedSessions.length : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 대화 분석 요약 생성
   */
  public generateAnalyticsSummary(filters?: ConversationAnalyticsFilters): ConversationAnalyticsSummary {
    const filteredSessions = this.getSessions(filters)
    const allMessages = filteredSessions.flatMap((session) => this.getMessagesBySessionId(session.id))

    const continuityMetrics = this.calculateContinuityMetrics(filteredSessions, allMessages)
    const resolutionMetrics = this.calculateResolutionMetrics(filteredSessions)
    const satisfactionMetrics = this.calculateSatisfactionMetrics(filteredSessions)
    const timeSeriesData = this.generateTimeSeriesData(filteredSessions)
    const topIssueTypes = this.extractTopIssueTypes(filteredSessions)
    const abandonmentPoints = this.analyzeAbandonmentPoints(filteredSessions)

    return {
      totalConversations: filteredSessions.length,
      continuityMetrics,
      resolutionMetrics,
      satisfactionMetrics,
      timeSeriesData,
      topIssueTypes,
      abandonmentPoints,
    }
  }

  /**
   * 개발용 더미 데이터 생성
   */
  private generateDummyData() {
    const issueTypes = [
      "충전이 시작되지 않음",
      "충전 중 오류 발생",
      "결제 문제",
      "앱 연결 문제",
      "충전 속도 저하",
      "계정 문제",
      "충전소 위치 문제",
      "예약 문제",
    ]

    const deviceTypes: Array<"mobile" | "desktop" | "tablet" | "unknown"> = ["mobile", "desktop", "tablet", "unknown"]

    const stageTypes: Array<"identification" | "troubleshooting" | "resolution" | "confirmation" | "completed"> = [
      "identification",
      "troubleshooting",
      "resolution",
      "confirmation",
      "completed",
    ]

    const messageTypes: Array<"question" | "answer" | "followUp" | "confirmation" | "other"> = [
      "question",
      "answer",
      "followUp",
      "confirmation",
      "other",
    ]

    const senderTypes: Array<"user" | "bot" | "agent"> = ["user", "bot", "agent"]

    // 최근 30일 동안의 더미 데이터 생성
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // 200개의 더미 세션 생성
    for (let i = 0; i < 200; i++) {
      // 랜덤 날짜 (지난 30일 이내)
      const sessionDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()))

      // 랜덤 세션 데이터
      const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)]
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
      const messageCount = 2 + Math.floor(Math.random() * 10) // 2-11 메시지
      const duration = 30 + Math.floor(Math.random() * 570) // 30-600초
      const issueResolved = Math.random() < 0.75 // 75% 해결률
      const resolutionSteps = 1 + Math.floor(Math.random() * 5) // 1-5 단계
      const transferredToAgent = Math.random() < 0.15 // 15% 상담원 연결률
      const abandonedByUser = !issueResolved && Math.random() < 0.3 // 미해결 중 30%는 중단

      // 세션 종료 시간
      const endTime = new Date(sessionDate)
      endTime.setSeconds(endTime.getSeconds() + duration)

      // 만족도 (해결된 경우 높은 점수 확률 증가)
      let userSatisfaction: number | undefined
      if (Math.random() < 0.8) {
        // 80%는 만족도 제공
        if (issueResolved) {
          // 해결된 경우 높은 점수 확률 증가
          const satisfactionDistribution = [0.05, 0.1, 0.15, 0.3, 0.4] // 1-5점 확률
          const rand = Math.random()
          let cumulativeProbability = 0
          for (let j = 0; j < satisfactionDistribution.length; j++) {
            cumulativeProbability += satisfactionDistribution[j]
            if (rand < cumulativeProbability) {
              userSatisfaction = j + 1
              break
            }
          }
        } else {
          // 미해결된 경우 낮은 점수 확률 증가
          const satisfactionDistribution = [0.3, 0.3, 0.2, 0.15, 0.05] // 1-5점 확률
          const rand = Math.random()
          let cumulativeProbability = 0
          for (let j = 0; j < satisfactionDistribution.length; j++) {
            cumulativeProbability += satisfactionDistribution[j]
            if (rand < cumulativeProbability) {
              userSatisfaction = j + 1
              break
            }
          }
        }
      }

      // 세션 생성
      const session: ConversationSession = {
        id: `dummy_session_${i}`,
        startTime: sessionDate,
        endTime,
        messageCount,
        duration,
        issueType,
        issueResolved,
        resolutionSteps,
        transferredToAgent,
        abandonedByUser,
        userSatisfaction,
        deviceType,
      }

      this.sessions.push(session)

      // 메시지 생성
      for (let j = 0; j < messageCount; j++) {
        const messageTime = new Date(sessionDate)
        messageTime.setSeconds(messageTime.getSeconds() + Math.floor((duration / messageCount) * j))

        const sender = j % 2 === 0 ? "user" : Math.random() < 0.9 ? "bot" : "agent"
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
        const followUpAccepted = messageType === "followUp" ? Math.random() < 0.7 : undefined

        const message: ConversationMessage = {
          id: `dummy_message_${i}_${j}`,
          sessionId: session.id,
          timestamp: messageTime,
          sender,
          content: `Dummy message content ${j + 1}`,
          messageType,
          followUpAccepted,
          sentimentScore: -0.5 + Math.random() * 1, // -0.5 ~ 0.5
        }

        this.messages.push(message)
      }

      // 단계 생성
      const stageCount = Math.min(resolutionSteps + 1, stageTypes.length)
      const stageIndices = Array.from({ length: stageTypes.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, stageCount)
        .sort((a, b) => a - b)

      for (let j = 0; j < stageCount; j++) {
        const stageStartTime = new Date(sessionDate)
        stageStartTime.setSeconds(stageStartTime.getSeconds() + Math.floor((duration / stageCount) * j))

        const stageEndTime = j < stageCount - 1 ? new Date(sessionDate) : endTime
        if (j < stageCount - 1) {
          stageEndTime.setSeconds(stageEndTime.getSeconds() + Math.floor((duration / stageCount) * (j + 1)))
        }

        const stageDuration = (stageEndTime.getTime() - stageStartTime.getTime()) / 1000
        const successful = issueResolved || j < stageCount - 1

        const stage: ConversationStage = {
          sessionId: session.id,
          stage: stageTypes[stageIndices[j]],
          startTime: stageStartTime,
          endTime: stageEndTime,
          duration: stageDuration,
          successful,
        }

        this.stages.push(stage)
      }
    }
  }
}

export const conversationAnalyticsService = ConversationAnalyticsService.getInstance()
