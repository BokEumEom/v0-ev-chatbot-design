import { intentDetectionService } from "./intent-detection-service"

/**
 * 향상된 인텐트 감지 서비스
 * 기존 인텐트 감지 서비스를 확장하여 정확도를 높입니다.
 */
export class ImprovedIntentDetectionService {
  private static instance: ImprovedIntentDetectionService
  private fallbackIntent = "general_inquiry"
  private confidenceThreshold = 0.3
  private contextualBoost = 0.2

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ImprovedIntentDetectionService {
    if (!ImprovedIntentDetectionService.instance) {
      ImprovedIntentDetectionService.instance = new ImprovedIntentDetectionService()
    }
    return ImprovedIntentDetectionService.instance
  }

  /**
   * 인텐트 감지 함수 - 대화 이력 활용
   * @param message 사용자 메시지
   * @param conversationHistory 대화 이력
   * @returns 감지된 인텐트 정보
   */
  public async detectIntent(
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>,
  ): Promise<{
    intent: string
    confidence: number
    entities: Record<string, any>
    alternativeIntents?: Array<{ intent: string; confidence: number }>
  }> {
    // 기본 인텐트 감지 서비스 호출
    const baseResult = intentDetectionService.detectIntent(message)

    // 결과 초기화
    let enhancedResult = {
      intent: baseResult.topIntent.id,
      confidence: baseResult.topIntent.confidence,
      entities: baseResult.entities,
      alternativeIntents: baseResult.allIntents
        .filter((intent) => intent.id !== baseResult.topIntent.id)
        .map((intent) => ({ intent: intent.id, confidence: intent.confidence })),
    }

    // 대화 이력이 있는 경우 컨텍스트 기반 인텐트 보정
    if (conversationHistory && conversationHistory.length > 0) {
      enhancedResult = this.applyContextualCorrection(enhancedResult, conversationHistory)
    }

    // 질문-응답 일관성 검사
    enhancedResult = this.checkQuestionAnswerConsistency(message, enhancedResult)

    // 신뢰도가 너무 낮은 경우 일반 문의로 처리
    if (enhancedResult.confidence < this.confidenceThreshold) {
      enhancedResult.intent = this.fallbackIntent
    }

    return enhancedResult
  }

  /**
   * 컨텍스트 기반 인텐트 보정
   */
  private applyContextualCorrection(
    result: {
      intent: string
      confidence: number
      entities: Record<string, any>
      alternativeIntents?: Array<{ intent: string; confidence: number }>
    },
    conversationHistory: Array<{ role: string; content: string }>,
  ) {
    // 최근 대화 이력 분석 (최대 3개)
    const recentHistory = conversationHistory.slice(-6)

    // 이전 사용자 메시지에서 인텐트 추출
    const userMessages = recentHistory.filter((msg) => msg.role === "user").map((msg) => msg.content)

    // 이전 어시스턴트 메시지에서 인텐트 추출
    const assistantMessages = recentHistory.filter((msg) => msg.role === "assistant").map((msg) => msg.content)

    // 이전 대화에서 인텐트 추출
    const previousIntents: string[] = []
    for (const message of userMessages) {
      const detectedIntent = intentDetectionService.detectIntent(message)
      if (detectedIntent.topIntent.confidence > this.confidenceThreshold) {
        previousIntents.push(detectedIntent.topIntent.id)
      }
    }

    // 가장 최근 인텐트 (있는 경우)
    const mostRecentIntent = previousIntents.length > 0 ? previousIntents[previousIntents.length - 1] : null

    // 후속 질문 패턴 감지
    const isFollowUpQuestion = this.detectFollowUpPattern(userMessages[userMessages.length - 1] || "")

    // 후속 질문이고 이전 인텐트가 있는 경우, 이전 인텐트에 가중치 부여
    if (isFollowUpQuestion && mostRecentIntent) {
      // 현재 인텐트가 이전 인텐트와 다르고, 대안 인텐트 중에 이전 인텐트가 있는 경우
      if (
        result.intent !== mostRecentIntent &&
        result.alternativeIntents?.some((alt) => alt.intent === mostRecentIntent)
      ) {
        // 대안 인텐트 중 이전 인텐트 찾기
        const prevIntentInAlternatives = result.alternativeIntents.find((alt) => alt.intent === mostRecentIntent)

        // 이전 인텐트의 신뢰도가 현재 인텐트의 신뢰도에 가까운 경우 (80% 이상)
        if (prevIntentInAlternatives && prevIntentInAlternatives.confidence >= result.confidence * 0.8) {
          // 이전 인텐트로 교체
          result.intent = mostRecentIntent
          result.confidence = Math.min(prevIntentInAlternatives.confidence + this.contextualBoost, 1.0)
        }
      }
    }

    return result
  }

  /**
   * 후속 질문 패턴 감지
   */
  private detectFollowUpPattern(message: string): boolean {
    // 후속 질문 패턴 (대명사, 생략된 주어, 짧은 질문 등)
    const followUpPatterns = [
      /^그(럼|러면|건|거는|렇다면)/,
      /^(이|저|그|요|이것|저것|그것)/,
      /^어떻게/,
      /^왜/,
      /^언제/,
      /^어디/,
      /^누가/,
      /^무엇/,
      /^얼마/,
      /^\?/,
      /^그리고/,
      /^또/,
      /^그 다음/,
    ]

    // 메시지 길이가 짧은 경우 (15자 이하)
    if (message.length <= 15) {
      // 패턴 매칭
      for (const pattern of followUpPatterns) {
        if (pattern.test(message)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 질문-응답 일관성 검사
   */
  private checkQuestionAnswerConsistency(
    message: string,
    result: {
      intent: string
      confidence: number
      entities: Record<string, any>
      alternativeIntents?: Array<{ intent: string; confidence: number }>
    },
  ) {
    // 질문 유형 감지
    const questionType = this.detectQuestionType(message)

    // 인텐트와 질문 유형 간의 일관성 검사
    if (questionType && !this.isIntentConsistentWithQuestionType(result.intent, questionType)) {
      // 대안 인텐트 중에서 질문 유형과 일치하는 것 찾기
      const consistentAlternative = result.alternativeIntents?.find((alt) =>
        this.isIntentConsistentWithQuestionType(alt.intent, questionType),
      )

      // 일치하는 대안 인텐트가 있고 신뢰도가 충분히 높은 경우
      if (consistentAlternative && consistentAlternative.confidence >= result.confidence * 0.7) {
        result.intent = consistentAlternative.intent
        result.confidence = Math.min(consistentAlternative.confidence + 0.1, 1.0)
      }
    }

    return result
  }

  /**
   * 질문 유형 감지
   */
  private detectQuestionType(message: string): string | null {
    // 위치 관련 질문
    if (/어디|위치|장소|근처|가까운|찾아|어느|지도/.test(message)) {
      return "location"
    }

    // 방법 관련 질문
    if (/어떻게|방법|절차|단계|사용법|이용법|하는 법|하는 방법/.test(message)) {
      return "how_to"
    }

    // 시간 관련 질문
    if (/언제|시간|기간|얼마나|오래|걸리|소요|몇 시|몇분|몇 분|몇시간|몇 시간/.test(message)) {
      return "time"
    }

    // 이유 관련 질문
    if (/왜|이유|원인|때문|문제|오류|에러|고장/.test(message)) {
      return "why"
    }

    // 비용 관련 질문
    if (/얼마|가격|비용|요금|지불|결제|청구|환불|무료|유료/.test(message)) {
      return "cost"
    }

    // 비교 관련 질문
    if (/차이|비교|더 나은|좋은|추천|어떤 것|어느 것|어떤게|어느게/.test(message)) {
      return "comparison"
    }

    // 명확한 질문 패턴이 없는 경우
    return null
  }

  /**
   * 인텐트와 질문 유형의 일관성 검사
   */
  private isIntentConsistentWithQuestionType(intent: string, questionType: string): boolean {
    // 인텐트와 질문 유형 간의 매핑
    const intentQuestionTypeMap: Record<string, string[]> = {
      find_charger: ["location", "comparison"],
      usage_guide: ["how_to"],
      charger_issue: ["why", "how_to"],
      payment_issue: ["cost", "why", "how_to"],
      charging_history: ["time", "cost"],
      pricing_inquiry: ["cost", "comparison"],
      membership_inquiry: ["how_to", "comparison", "cost"],
      reservation_inquiry: ["time", "how_to"],
      vehicle_compatibility: ["comparison", "how_to"],
    }

    // 해당 인텐트에 대한 일관된 질문 유형 목록
    const consistentTypes = intentQuestionTypeMap[intent] || []

    // 일관성 검사
    return consistentTypes.includes(questionType)
  }

  /**
   * 신뢰도 임계값 설정
   */
  public setConfidenceThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 1) {
      this.confidenceThreshold = threshold
    }
  }

  /**
   * 컨텍스트 가중치 설정
   */
  public setContextualBoost(boost: number): void {
    if (boost >= 0 && boost <= 0.5) {
      this.contextualBoost = boost
    }
  }

  /**
   * 폴백 인텐트 설정
   */
  public setFallbackIntent(intent: string): void {
    this.fallbackIntent = intent
  }
}

// 향상된 인텐트 감지 서비스 인스턴스 내보내기
export const improvedIntentDetectionService = ImprovedIntentDetectionService.getInstance()
