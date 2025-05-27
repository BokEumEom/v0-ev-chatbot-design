import type {
  EmotionState,
  EmotionHistory,
  EmotionResponseStrategy,
  EmotionAnalysisResult,
  EmotionAnalysisRequest,
  BasicEmotion,
  EmotionIntensity,
} from "@/types/emotion-recognition"
import type { SentimentType } from "@/types/feedback"
import {
  advancedSentimentAnalysisService,
  type DetailedSentimentAnalysis,
} from "@/services/advanced-sentiment-analysis"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

/**
 * 감정 인식 서비스
 * 사용자 메시지에서 감정을 분석하고 적절한 응답 전략을 제공합니다.
 */
export class EmotionRecognitionService {
  private static instance: EmotionRecognitionService

  // 감정 키워드 사전
  private emotionKeywords: Record<BasicEmotion, string[]> = {
    joy: ["좋아요", "감사", "행복", "기쁨", "만족", "좋네요", "좋았", "고마워", "감사합니다", "신나", "완벽"],
    sadness: ["슬퍼요", "실망", "아쉽", "안타깝", "속상", "슬픔", "우울", "서운", "안됐", "힘들어"],
    anger: ["화나", "짜증", "불만", "화가", "열받", "화났", "분노", "빡치", "짜증나", "화가나", "어이없"],
    fear: ["걱정", "불안", "두려움", "무서워", "겁나", "걱정돼", "불안해", "조마조마", "긴장", "무섭"],
    surprise: ["놀랐", "깜짝", "예상치", "뜻밖", "놀랍", "신기", "믿기힘들", "예상 밖", "깜짝 놀랐"],
    disgust: ["싫어", "역겨", "불쾌", "구역질", "혐오", "질색", "기분 나쁜", "메스꺼", "끔찍"],
    trust: ["믿어요", "신뢰", "확신", "의지", "믿음", "신용", "믿을 수 있", "확실", "안심"],
    anticipation: ["기대", "희망", "바라", "고대", "기다려", "예상", "기대해", "바라고", "희망해"],
  }

  // 감정 강도 표현 사전
  private intensityKeywords: Record<EmotionIntensity, string[]> = {
    high: ["매우", "정말", "너무", "완전히", "극도로", "엄청", "굉장히", "진짜", "완전", "최고로"],
    medium: ["꽤", "상당히", "제법", "좀", "약간", "조금", "다소", "어느 정도"],
    low: ["살짝", "조금", "약간", "미세하게", "소량", "약하게", "미약하게"],
  }

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): EmotionRecognitionService {
    if (!EmotionRecognitionService.instance) {
      EmotionRecognitionService.instance = new EmotionRecognitionService()
    }
    return EmotionRecognitionService.instance
  }

  /**
   * 텍스트에서 감정 분석
   */
  public async analyzeEmotion(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResult> {
    const { text, conversationHistory, previousEmotions, language = "ko" } = request

    // 감정 분석 결과 초기화
    const result: EmotionAnalysisResult = {
      text,
      emotion: {
        primary: null,
        intensity: "medium",
      },
      sentiment: "neutral",
      confidence: 0.5,
      language,
    }

    try {
      // 고급 감정 분석 서비스 사용
      const sentimentAnalysis = advancedSentimentAnalysisService.analyzeText(text, language)

      // 감정 분석 결과 매핑
      result.sentiment = sentimentAnalysis.sentiment
      result.confidence = sentimentAnalysis.confidence

      // 기본 감정 분석
      const emotionResult = this.detectBasicEmotion(text, sentimentAnalysis)
      result.emotion = emotionResult.emotion

      // 감정 트리거 식별
      result.triggers = this.identifyEmotionTriggers(text, sentimentAnalysis, conversationHistory)

      // 이전 감정 이력이 있는 경우 감정 변화 패턴 분석
      if (previousEmotions && previousEmotions.emotions.length > 0) {
        const pattern = this.analyzeEmotionPattern(previousEmotions, result.emotion.primary)
        // 패턴 분석 결과를 활용할 수 있음
      }

      return result
    } catch (error) {
      console.error("감정 분석 중 오류 발생:", error)

      // 오류 발생 시 기본값 반환
      return result
    }
  }

  /**
   * 기본 감정 감지
   */
  private detectBasicEmotion(
    text: string,
    sentimentAnalysis: DetailedSentimentAnalysis,
  ): {
    emotion: {
      primary: BasicEmotion | null
      secondary?: BasicEmotion
      intensity: EmotionIntensity
    }
  } {
    // 감정 점수 초기화
    const emotionScores: Record<BasicEmotion, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      trust: 0,
      anticipation: 0,
    }

    // 텍스트에서 감정 키워드 검색
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords) as [BasicEmotion, string[]][]) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // 키워드 발견 시 점수 증가
          emotionScores[emotion] += 1

          // 감정 강도 검사
          for (const [intensity, intensityWords] of Object.entries(this.intensityKeywords)) {
            // 강도 표현이 감정 키워드 주변에 있는지 확인
            const keywordIndex = text.indexOf(keyword)
            const surroundingText = text.substring(
              Math.max(0, keywordIndex - 10),
              Math.min(text.length, keywordIndex + keyword.length + 10),
            )

            for (const intensityWord of intensityWords) {
              if (surroundingText.includes(intensityWord)) {
                // 강도 표현 발견 시 추가 점수
                const intensityMultiplier = intensity === "high" ? 2 : intensity === "medium" ? 1.5 : 1.2
                emotionScores[emotion] *= intensityMultiplier
                break
              }
            }
          }
        }
      }
    }

    // 감정 분석 결과에서 키워드 활용
    sentimentAnalysis.keywords.forEach((keyword) => {
      for (const [emotion, keywords] of Object.entries(this.emotionKeywords) as [BasicEmotion, string[]][]) {
        if (keywords.some((k) => keyword.word.includes(k))) {
          // 감정 키워드 발견 시 점수 증가 (중요도에 따라 가중치 부여)
          emotionScores[emotion] += keyword.importance * 2
        }
      }
    })

    // 감정 점수에 감정 톤 반영
    if (sentimentAnalysis.sentiment === "positive") {
      emotionScores.joy *= 1.5
      emotionScores.trust *= 1.3
      emotionScores.anticipation *= 1.2
    } else if (sentimentAnalysis.sentiment === "negative") {
      emotionScores.sadness *= 1.5
      emotionScores.anger *= 1.5
      emotionScores.fear *= 1.3
      emotionScores.disgust *= 1.3
    }

    // 가장 높은 점수의 감정 찾기
    let primaryEmotion: BasicEmotion | null = null
    let secondaryEmotion: BasicEmotion | undefined = undefined
    let maxScore = 0
    let secondMaxScore = 0

    for (const [emotion, score] of Object.entries(emotionScores) as [BasicEmotion, number][]) {
      if (score > maxScore) {
        secondMaxScore = maxScore
        secondaryEmotion = primaryEmotion
        maxScore = score
        primaryEmotion = emotion
      } else if (score > secondMaxScore) {
        secondMaxScore = score
        secondaryEmotion = emotion
      }
    }

    // 최소 점수 임계값 (감정이 명확하게 표현되지 않은 경우)
    if (maxScore < 0.5) {
      primaryEmotion = null
      secondaryEmotion = undefined
    }

    // 감정 강도 결정
    let intensity: EmotionIntensity = "medium"
    if (maxScore > 3) {
      intensity = "high"
    } else if (maxScore < 1) {
      intensity = "low"
    }

    return {
      emotion: {
        primary: primaryEmotion,
        secondary: secondaryEmotion,
        intensity,
      },
    }
  }

  /**
   * 감정 트리거 식별
   */
  private identifyEmotionTriggers(
    text: string,
    sentimentAnalysis: DetailedSentimentAnalysis,
    conversationHistory?: Array<{ role: string; content: string }>,
  ): string[] {
    const triggers: string[] = []

    // 감정 트리거 키워드
    const triggerKeywords = {
      service: ["서비스", "고객", "지원", "상담", "응대", "직원"],
      app: ["앱", "어플", "애플리케이션", "소프트웨어", "프로그램", "인터페이스"],
      charger: ["충전기", "충전소", "충전", "케이블", "플러그", "커넥터"],
      payment: ["결제", "지불", "카드", "요금", "비용", "청구", "환불"],
      waiting: ["대기", "기다림", "줄", "순서", "예약", "시간"],
      error: ["오류", "에러", "문제", "버그", "고장", "작동", "안됨", "실패"],
    }

    // 텍스트에서 트리거 키워드 검색
    for (const [category, keywords] of Object.entries(triggerKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // 키워드 주변 텍스트 추출
          const keywordIndex = text.indexOf(keyword)
          const surroundingText = text.substring(
            Math.max(0, keywordIndex - 15),
            Math.min(text.length, keywordIndex + keyword.length + 15),
          )

          // 트리거 추가 (중복 방지)
          const trigger = `${category}: ${surroundingText.trim()}`
          if (!triggers.includes(trigger)) {
            triggers.push(trigger)
          }
        }
      }
    }

    // 감정 분석 결과의 aspects 활용
    for (const [aspect, data] of Object.entries(sentimentAnalysis.aspects)) {
      if (data.sentiment !== "neutral") {
        const trigger = `${aspect}: ${data.mentions[0] || "언급됨"} (${data.sentiment})`
        if (!triggers.includes(trigger)) {
          triggers.push(trigger)
        }
      }
    }

    // 대화 이력 활용 (있는 경우)
    if (conversationHistory && conversationHistory.length > 0) {
      // 최근 어시스턴트 메시지 확인
      const recentAssistantMessages = conversationHistory.filter((msg) => msg.role === "assistant").slice(-2)

      for (const msg of recentAssistantMessages) {
        // 어시스턴트 메시지에 해결책이나 안내가 있었는지 확인
        const solutionPatterns = ["시도해 보세요", "확인해 보세요", "해보세요", "방법은", "해결 방법", "단계를 따라"]

        for (const pattern of solutionPatterns) {
          if (msg.content.includes(pattern)) {
            // 해결책 제시 후 부정적 감정이 있다면 해결책 실패로 간주
            if (sentimentAnalysis.sentiment === "negative") {
              triggers.push("제안된 해결책 실패")
              break
            }
          }
        }
      }
    }

    return triggers
  }

  /**
   * 감정 변화 패턴 분석
   */
  private analyzeEmotionPattern(
    history: EmotionHistory,
    currentEmotion: BasicEmotion | null,
  ): "improving" | "worsening" | "fluctuating" | "stable" {
    if (history.emotions.length < 2) {
      return "stable" // 이력이 충분하지 않음
    }

    // 감정 변화 추적을 위한 감정 점수 매핑
    const emotionScores: Record<SentimentType, number> = {
      positive: 1,
      neutral: 0,
      negative: -1,
    }

    // 최근 감정 이력 (최대 5개)
    const recentEmotions = history.emotions.slice(-5)

    // 현재 감정 추가
    const allEmotions = [
      ...recentEmotions,
      {
        emotion: currentEmotion,
        sentiment: this.mapEmotionToSentiment(currentEmotion),
        intensity: "medium", // 기본값
        timestamp: Date.now(),
        messageId: "current",
      },
    ]

    // 감정 점수 변화 계산
    const sentimentScores = allEmotions.map((e) => emotionScores[e.sentiment])

    // 감정 변화 방향 계산
    let improvements = 0
    let worsenings = 0

    for (let i = 1; i < sentimentScores.length; i++) {
      const diff = sentimentScores[i] - sentimentScores[i - 1]
      if (diff > 0) improvements++
      else if (diff < 0) worsenings++
    }

    // 패턴 결정
    if (improvements > worsenings && improvements > 0) {
      return "improving"
    } else if (worsenings > improvements && worsenings > 0) {
      return "worsening"
    } else if (improvements > 0 && worsenings > 0) {
      return "fluctuating"
    } else {
      return "stable"
    }
  }

  /**
   * 감정을 감정 톤으로 매핑
   */
  private mapEmotionToSentiment(emotion: BasicEmotion | null): SentimentType {
    if (!emotion) return "neutral"

    const positiveEmotions: BasicEmotion[] = ["joy", "trust", "anticipation"]
    const negativeEmotions: BasicEmotion[] = ["sadness", "anger", "fear", "disgust"]

    if (positiveEmotions.includes(emotion)) return "positive"
    if (negativeEmotions.includes(emotion)) return "negative"

    // surprise는 맥락에 따라 다름, 기본값은 neutral
    return "neutral"
  }

  /**
   * 감정 상태 업데이트
   */
  public updateEmotionState(currentState: EmotionState | null, analysisResult: EmotionAnalysisResult): EmotionState {
    const now = Date.now()

    // 이전 상태가 없는 경우 새로운 상태 생성
    if (!currentState) {
      return {
        primaryEmotion: analysisResult.emotion.primary,
        secondaryEmotion: analysisResult.emotion.secondary,
        intensity: analysisResult.emotion.intensity,
        sentiment: analysisResult.sentiment,
        confidence: analysisResult.confidence,
        context: {
          trigger: analysisResult.triggers?.[0],
          duration: "momentary",
        },
        timestamp: now,
      }
    }

    // 감정 변화 감지
    const emotionShift = this.detectEmotionShift(currentState.sentiment, analysisResult.sentiment)

    // 새로운 감정 상태 생성
    return {
      primaryEmotion: analysisResult.emotion.primary,
      secondaryEmotion: analysisResult.emotion.secondary,
      intensity: analysisResult.emotion.intensity,
      previousEmotion: currentState.primaryEmotion,
      emotionShift,
      sentiment: analysisResult.sentiment,
      confidence: analysisResult.confidence,
      context: {
        trigger: analysisResult.triggers?.[0],
        // 같은 감정이 지속되면 'persistent'로 설정
        duration:
          currentState.primaryEmotion === analysisResult.emotion.primary &&
          currentState.sentiment === analysisResult.sentiment
            ? "persistent"
            : "momentary",
        relatedIssue: currentState.context?.relatedIssue,
      },
      timestamp: now,
    }
  }

  /**
   * 감정 변화 감지
   */
  private detectEmotionShift(
    previousSentiment: SentimentType,
    currentSentiment: SentimentType,
  ): "improving" | "worsening" | "stable" {
    const sentimentScores: Record<SentimentType, number> = {
      positive: 1,
      neutral: 0,
      negative: -1,
    }

    const diff = sentimentScores[currentSentiment] - sentimentScores[previousSentiment]

    if (diff > 0) return "improving"
    if (diff < 0) return "worsening"
    return "stable"
  }

  /**
   * 감정 기반 응답 전략 생성
   */
  public generateResponseStrategy(emotionState: EmotionState): EmotionResponseStrategy {
    // 기본 응답 전략
    const defaultStrategy: EmotionResponseStrategy = {
      emotion: emotionState.primaryEmotion,
      intensity: emotionState.intensity,
      sentiment: emotionState.sentiment,
      acknowledgment: "이해합니다.",
      tone: "professional",
      approachStrategy: "information",
      responseTemplates: ["어떻게 도와드릴까요?"],
      avoidPhrases: ["문제가 없습니다", "걱정하지 마세요"],
    }

    // 감정별 응답 전략
    switch (emotionState.primaryEmotion) {
      case "joy":
        return {
          ...defaultStrategy,
          acknowledgment: "좋은 소식이네요!",
          tone: "enthusiastic",
          approachStrategy: "information",
          responseTemplates: [
            "정말 기쁘네요! 어떤 부분이 특히 만족스러우셨나요?",
            "좋은 경험을 하셨다니 저희도 기쁩니다. 더 도와드릴 일이 있을까요?",
            "멋지네요! 다른 부분에서도 도움이 필요하신가요?",
          ],
          avoidPhrases: ["그렇군요", "알겠습니다", "네"],
        }

      case "sadness":
        return {
          ...defaultStrategy,
          acknowledgment: "불편을 드려 정말 죄송합니다.",
          tone: "empathetic",
          approachStrategy: "emotional-support",
          responseTemplates: [
            "불편을 겪고 계신 점 정말 죄송합니다. 어떻게 도와드릴 수 있을까요?",
            "그런 경험을 하셨다니 정말 안타깝습니다. 문제를 해결해 드리겠습니다.",
            "많이 실망하셨을 것 같아 죄송합니다. 상황을 개선할 수 있는 방법을 찾아보겠습니다.",
          ],
          avoidPhrases: ["걱정하지 마세요", "문제 없어요", "그냥"],
        }

      case "anger":
        return {
          ...defaultStrategy,
          acknowledgment: "불편을 드려 정말 죄송합니다. 충분히 화가 나실 만한 상황입니다.",
          tone: "empathetic",
          approachStrategy: "problem-solving",
          responseTemplates: [
            "불편을 겪으셔서 정말 죄송합니다. 문제를 즉시 해결해 드리겠습니다.",
            "그런 경험을 하셨다니 정말 죄송합니다. 어떻게 도와드릴 수 있을지 구체적으로 알려주시겠어요?",
            "많이 답답하셨을 것 같습니다. 최대한 빠르게 해결책을 찾아보겠습니다.",
          ],
          avoidPhrases: ["진정하세요", "화내지 마세요", "과장하고 계신 것 같습니다"],
        }

      case "fear":
        return {
          ...defaultStrategy,
          acknowledgment: "걱정되는 상황이시군요. 도와드리겠습니다.",
          tone: "reassuring",
          approachStrategy: "emotional-support",
          responseTemplates: [
            "걱정되는 부분을 말씀해 주셔서 감사합니다. 함께 해결책을 찾아보겠습니다.",
            "그런 상황이라면 불안하실 만 합니다. 차분히 단계별로 도와드리겠습니다.",
            "걱정마세요, 비슷한 상황을 많이 해결해 왔습니다. 천천히 진행해 보겠습니다.",
          ],
          avoidPhrases: ["걱정할 필요 없어요", "별일 아닙니다", "너무 예민하게 반응하고 계세요"],
        }

      case "surprise":
        return {
          ...defaultStrategy,
          acknowledgment: "예상치 못한 상황이셨군요.",
          tone: "calm",
          approachStrategy: "information",
          responseTemplates: [
            "놀라셨을 것 같습니다. 어떤 부분이 가장 의외였나요?",
            "예상과 다른 상황이셨군요. 자세한 내용을 알려주시면 설명해 드리겠습니다.",
            "그런 상황이 발생했군요. 원인을 파악하고 설명해 드리겠습니다.",
          ],
          avoidPhrases: ["당연한 일입니다", "항상 그렇습니다", "알고 계셨을 텐데요"],
        }

      case "disgust":
        return {
          ...defaultStrategy,
          acknowledgment: "불쾌한 경험을 하셨군요. 정말 죄송합니다.",
          tone: "empathetic",
          approachStrategy: "problem-solving",
          responseTemplates: [
            "불쾌한 경험을 하셨다니 정말 죄송합니다. 즉시 조치하겠습니다.",
            "그런 경험을 하셨다니 정말 유감입니다. 어떻게 상황을 개선할 수 있을지 알려주시겠어요?",
            "불편을 드려 죄송합니다. 이런 일이 재발하지 않도록 조치하겠습니다.",
          ],
          avoidPhrases: ["대수롭지 않은 일입니다", "과민반응이십니다", "그렇게까지 불쾌할 일인가요"],
        }

      case "trust":
        return {
          ...defaultStrategy,
          acknowledgment: "저희를 신뢰해 주셔서 감사합니다.",
          tone: "professional",
          approachStrategy: "information",
          responseTemplates: [
            "저희를 믿어주셔서 감사합니다. 기대에 부응하도록 최선을 다하겠습니다.",
            "신뢰해 주셔서 감사합니다. 어떤 부분에서 더 도움이 필요하신가요?",
            "말씀해 주셔서 감사합니다. 계속해서 좋은 서비스를 제공하겠습니다.",
          ],
          avoidPhrases: ["당연한 일입니다", "그냥 제 일을 하는 겁니다", "별말씀을요"],
        }

      case "anticipation":
        return {
          ...defaultStrategy,
          acknowledgment: "기대하고 계시는군요.",
          tone: "enthusiastic",
          approachStrategy: "information",
          responseTemplates: [
            "어떤 부분을 가장 기대하고 계신가요? 자세히 알려드리겠습니다.",
            "기대하고 계신 부분에 대해 더 자세한 정보를 제공해 드리겠습니다.",
            "기대에 부응할 수 있도록 최선을 다하겠습니다. 구체적으로 어떤 정보가 필요하신가요?",
          ],
          avoidPhrases: ["기대하지 마세요", "그렇게 좋지 않을 수도 있어요", "실망하실 수도 있어요"],
        }

      default:
        // 감정이 명확하지 않은 경우 감정 톤에 따라 응답
        if (emotionState.sentiment === "positive") {
          return {
            ...defaultStrategy,
            acknowledgment: "말씀 감사합니다.",
            tone: "enthusiastic",
            approachStrategy: "information",
            responseTemplates: [
              "어떻게 더 도와드릴까요?",
              "다른 질문이 있으신가요?",
              "추가로 필요한 정보가 있으신가요?",
            ],
            avoidPhrases: ["그렇군요", "알겠습니다", "네"],
          }
        } else if (emotionState.sentiment === "negative") {
          return {
            ...defaultStrategy,
            acknowledgment: "불편을 드려 죄송합니다.",
            tone: "empathetic",
            approachStrategy: "problem-solving",
            responseTemplates: [
              "어떤 부분이 가장 불편하셨나요?",
              "어떻게 도와드릴 수 있을까요?",
              "문제를 해결해 드리겠습니다. 자세한 상황을 알려주시겠어요?",
            ],
            avoidPhrases: ["걱정하지 마세요", "문제 없어요", "대수롭지 않은 일입니다"],
          }
        } else {
          return defaultStrategy
        }
    }
  }

  /**
   * 감정 기반 프롬프트 생성
   */
  public async generateEmotionBasedPrompt(
    emotionState: EmotionState,
    userMessage: string,
    conversationContext: any,
  ): Promise<string> {
    // 응답 전략 생성
    const strategy = this.generateResponseStrategy(emotionState)

    // 감정 인식 및 공감 표현
    let prompt = `사용자가 다음과 같은 메시지를 보냈습니다: "${userMessage}"\n\n`

    // 감정 상태 정보 추가
    prompt += "## 감정 분석 결과\n"
    prompt += `- 주요 감정: ${emotionState.primaryEmotion ? this.translateEmotion(emotionState.primaryEmotion) : "명확하지 않음"}\n`
    if (emotionState.secondaryEmotion) {
      prompt += `- 부차적 감정: ${this.translateEmotion(emotionState.secondaryEmotion)}\n`
    }
    prompt += `- 감정 강도: ${this.translateIntensity(emotionState.intensity)}\n`
    prompt += `- 감정 톤: ${emotionState.sentiment === "positive" ? "긍정적" : emotionState.sentiment === "negative" ? "부정적" : "중립적"}\n`

    if (emotionState.emotionShift) {
      prompt += `- 감정 변화: ${
        emotionState.emotionShift === "improving"
          ? "개선 중"
          : emotionState.emotionShift === "worsening"
            ? "악화 중"
            : "안정적"
      }\n`
    }

    if (emotionState.context?.trigger) {
      prompt += `- 감정 유발 요인: ${emotionState.context.trigger}\n`
    }

    // 응답 지침 추가
    prompt += "\n## 응답 지침\n"
    prompt += `1. 감정 인정: "${strategy.acknowledgment}"\n`
    prompt += `2. 어조: ${this.translateTone(strategy.tone)}\n`
    prompt += `3. 접근 방식: ${this.translateApproach(strategy.approachStrategy)}\n`

    // 추천 응답 템플릿
    prompt += "\n## 추천 응답 템플릿\n"
    strategy.responseTemplates.forEach((template, index) => {
      prompt += `${index + 1}. ${template}\n`
    })

    // 피해야 할 표현
    prompt += "\n## 피해야 할 표현\n"
    strategy.avoidPhrases.forEach((phrase, index) => {
      prompt += `${index + 1}. "${phrase}"\n`
    })

    // 사용자 컨텍스트 추가
    prompt += "\n## 사용자 컨텍스트\n"
    prompt += `- 차량 모델: ${conversationContext.vehicleModel || "알 수 없음"}\n`
    prompt += `- 위치: ${conversationContext.location || "알 수 없음"}\n`

    if (conversationContext.paymentMethods && conversationContext.paymentMethods.length > 0) {
      prompt += `- 결제 수단: ${conversationContext.paymentMethods.join(", ")}\n`
    }

    // 응답 요구사항
    prompt += "\n## 응답 요구사항\n"
    prompt += "1. 사용자의 감정을 인정하고 공감을 표현하세요.\n"
    prompt += "2. 위에 제시된 어조와 접근 방식을 사용하세요.\n"
    prompt += "3. 피해야 할 표현을 사용하지 마세요.\n"
    prompt += "4. 사용자의 문제를 해결하는 데 집중하세요.\n"
    prompt += "5. 필요한 경우 추가 질문을 통해 더 많은 정보를 수집하세요.\n"

    if (
      emotionState.sentiment === "negative" &&
      (emotionState.primaryEmotion === "anger" || emotionState.primaryEmotion === "disgust")
    ) {
      prompt += "6. 특히 사용자의 불만을 진지하게 받아들이고, 구체적인 해결책을 제시하세요.\n"
      prompt += "7. 문제 해결 후 후속 조치나 보상 방안을 언급하는 것이 좋습니다.\n"
    }

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: prompt,
      temperature: 0.3,
    })

    return text
  }

  /**
   * 감정 한글 변환
   */
  private translateEmotion(emotion: BasicEmotion): string {
    const translations: Record<BasicEmotion, string> = {
      joy: "기쁨",
      sadness: "슬픔",
      anger: "분노",
      fear: "두려움",
      surprise: "놀람",
      disgust: "불쾌감",
      trust: "신뢰",
      anticipation: "기대감",
    }

    return translations[emotion] || emotion
  }

  /**
   * 감정 강도 한글 변환
   */
  private translateIntensity(intensity: EmotionIntensity): string {
    const translations: Record<EmotionIntensity, string> = {
      low: "약함",
      medium: "보통",
      high: "강함",
    }

    return translations[intensity] || intensity
  }

  /**
   * 어조 한글 변환
   */
  private translateTone(tone: string): string {
    const translations: Record<string, string> = {
      empathetic: "공감적",
      reassuring: "안심시키는",
      enthusiastic: "열정적",
      calm: "차분한",
      professional: "전문적",
    }

    return translations[tone] || tone
  }

  /**
   * 접근 방식 한글 변환
   */
  private translateApproach(approach: string): string {
    const translations: Record<string, string> = {
      "problem-solving": "문제 해결 중심",
      "emotional-support": "감정적 지원",
      information: "정보 제공",
      redirection: "방향 전환",
    }

    return translations[approach] || approach
  }
}

// 감정 인식 서비스 인스턴스 내보내기
export const emotionRecognitionService = EmotionRecognitionService.getInstance()
