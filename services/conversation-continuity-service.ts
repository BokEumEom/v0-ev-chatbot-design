/**
 * 대화 지속성 관리 서비스
 * 사용자와의 대화를 지속적으로 유지하고 문제 해결을 완료하기 위한 기능 제공
 */

export type ConversationState = {
  problemSolved: boolean
  currentIssue: string | null
  issueStage: "identification" | "troubleshooting" | "resolution" | "confirmation" | "completed"
  followUpNeeded: boolean
  lastInteractionTime: Date
  interactionCount: number
  userSatisfaction: number | null
  resolutionAttempts: number
  contextualInfo: Record<string, any>
}

export type FollowUpQuestion = {
  id: string
  text: string
  priority: number
  context: Record<string, any>
}

export class ConversationContinuityService {
  private static instance: ConversationContinuityService

  private constructor() {}

  public static getInstance(): ConversationContinuityService {
    if (!ConversationContinuityService.instance) {
      ConversationContinuityService.instance = new ConversationContinuityService()
    }
    return ConversationContinuityService.instance
  }

  /**
   * 대화 상태 초기화
   */
  public initConversationState(): ConversationState {
    return {
      problemSolved: false,
      currentIssue: null,
      issueStage: "identification",
      followUpNeeded: false,
      lastInteractionTime: new Date(),
      interactionCount: 0,
      userSatisfaction: null,
      resolutionAttempts: 0,
      contextualInfo: {},
    }
  }

  /**
   * 문제 해결 단계 업데이트
   */
  public updateIssueStage(state: ConversationState, newStage: ConversationState["issueStage"]): ConversationState {
    return {
      ...state,
      issueStage: newStage,
      lastInteractionTime: new Date(),
    }
  }

  /**
   * 문제 해결 여부 확인
   */
  public checkResolutionStatus(
    state: ConversationState,
    userMessage: string,
  ): { resolved: boolean; confidence: number } {
    // 긍정적 표현 패턴
    const positivePatterns = [
      /감사합니다/i,
      /고마워요/i,
      /해결됐어요/i,
      /됐어요/i,
      /좋아요/i,
      /알겠어요/i,
      /이해했어요/i,
      /도움이 됐어요/i,
      /문제 없어요/i,
      /잘 작동해요/i,
    ]

    // 부정적 표현 패턴
    const negativePatterns = [
      /아직 안 돼요/i,
      /여전히 문제가/i,
      /해결이 안 됐어요/i,
      /아니요/i,
      /실패했어요/i,
      /작동하지 않아요/i,
      /도움이 안 됐어요/i,
      /이해가 안 돼요/i,
      /다시 설명해 주세요/i,
    ]

    let positiveScore = 0
    let negativeScore = 0

    // 긍정적 패턴 검사
    positivePatterns.forEach((pattern) => {
      if (pattern.test(userMessage)) positiveScore += 1
    })

    // 부정적 패턴 검사
    negativePatterns.forEach((pattern) => {
      if (pattern.test(userMessage)) negativeScore += 1
    })

    // 메시지 길이에 따른 가중치 (짧은 긍정 응답이 많음)
    const lengthFactor = userMessage.length < 15 ? 0.3 : 0

    // 최종 점수 계산
    const totalScore = positiveScore - negativeScore + lengthFactor
    const confidence = Math.min(Math.abs(totalScore) / 3, 1) // 0~1 사이 값으로 정규화

    return {
      resolved: totalScore > 0,
      confidence,
    }
  }

  /**
   * 후속 질문 생성
   */
  public generateFollowUpQuestions(
    state: ConversationState,
    intent: string,
    entities: Record<string, any>,
  ): FollowUpQuestion[] {
    const followUps: FollowUpQuestion[] = []

    // 문제 식별 단계
    if (state.issueStage === "identification") {
      if (intent === "charger_issue") {
        followUps.push({
          id: "charger_issue_details",
          text: "충전기 화면에 오류 코드가 표시되나요?",
          priority: 5,
          context: { errorCodeCheck: true },
        })
        followUps.push({
          id: "charger_issue_alternative",
          text: "다른 충전기도 시도해 보셨나요?",
          priority: 4,
          context: { alternativeCheck: true },
        })
      } else if (intent === "payment_issue") {
        followUps.push({
          id: "payment_issue_method",
          text: "어떤 결제 수단을 사용하고 계신가요?",
          priority: 5,
          context: { paymentMethodCheck: true },
        })
        followUps.push({
          id: "payment_issue_error",
          text: "결제 시 어떤 오류 메시지가 표시되나요?",
          priority: 4,
          context: { errorMessageCheck: true },
        })
      }
    }

    // 문제 해결 단계
    else if (state.issueStage === "troubleshooting") {
      if (intent === "charger_issue") {
        followUps.push({
          id: "charger_issue_step_check",
          text: "안내해 드린 단계를 시도해 보셨나요?",
          priority: 5,
          context: { stepCheck: true },
        })
        followUps.push({
          id: "charger_issue_result",
          text: "충전기가 정상적으로 작동하나요?",
          priority: 4,
          context: { resultCheck: true },
        })
      } else if (intent === "payment_issue") {
        followUps.push({
          id: "payment_issue_retry",
          text: "결제를 다시 시도해 보셨나요?",
          priority: 5,
          context: { retryCheck: true },
        })
        followUps.push({
          id: "payment_issue_app_update",
          text: "앱이 최신 버전으로 업데이트되어 있나요?",
          priority: 3,
          context: { appUpdateCheck: true },
        })
      }
    }

    // 해결 확인 단계
    else if (state.issueStage === "confirmation") {
      followUps.push({
        id: "general_resolution_check",
        text: "문제가 해결되었나요?",
        priority: 5,
        context: { resolutionCheck: true },
      })
      followUps.push({
        id: "general_additional_help",
        text: "추가로 도움이 필요한 부분이 있으신가요?",
        priority: 4,
        context: { additionalHelpCheck: true },
      })
    }

    // 기본 후속 질문 (모든 단계에 적용)
    followUps.push({
      id: "general_satisfaction",
      text: "지금까지의 안내가 도움이 되셨나요?",
      priority: 2,
      context: { satisfactionCheck: true },
    })

    // 우선순위에 따라 정렬
    return followUps.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 대화 컨텍스트 업데이트
   */
  public updateContextualInfo(state: ConversationState, newInfo: Record<string, any>): ConversationState {
    return {
      ...state,
      contextualInfo: {
        ...state.contextualInfo,
        ...newInfo,
      },
      lastInteractionTime: new Date(),
      interactionCount: state.interactionCount + 1,
    }
  }

  /**
   * 사용자 만족도 업데이트
   */
  public updateUserSatisfaction(state: ConversationState, satisfaction: number): ConversationState {
    return {
      ...state,
      userSatisfaction: satisfaction,
      lastInteractionTime: new Date(),
    }
  }

  /**
   * 대화 종료 여부 확인
   */
  public shouldEndConversation(state: ConversationState): boolean {
    // 문제가 해결되었고, 사용자 만족도가 높으며, 후속 질문이 필요 없는 경우
    return (
      state.problemSolved && state.userSatisfaction !== null && state.userSatisfaction >= 4 && !state.followUpNeeded
    )
  }

  /**
   * 고객센터 연결 필요 여부 확인
   */
  public shouldTransferToAgent(state: ConversationState): boolean {
    // 여러 번의 해결 시도에도 문제가 해결되지 않은 경우
    return (
      !state.problemSolved &&
      state.resolutionAttempts >= 3 &&
      state.userSatisfaction !== null &&
      state.userSatisfaction <= 2
    )
  }
}

export const conversationContinuityService = ConversationContinuityService.getInstance()
