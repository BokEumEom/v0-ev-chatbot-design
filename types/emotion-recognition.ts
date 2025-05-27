import type { SentimentType } from "@/types/feedback"

// 감정 강도 레벨
export type EmotionIntensity = "low" | "medium" | "high"

// 기본 감정 타입
export type BasicEmotion =
  | "joy" // 기쁨
  | "sadness" // 슬픔
  | "anger" // 분노
  | "fear" // 두려움
  | "surprise" // 놀람
  | "disgust" // 혐오
  | "trust" // 신뢰
  | "anticipation" // 기대

// 사용자 감정 상태
export interface EmotionState {
  // 기본 감정 분석
  primaryEmotion: BasicEmotion | null
  secondaryEmotion?: BasicEmotion
  intensity: EmotionIntensity

  // 감정 변화 추적
  previousEmotion?: BasicEmotion
  emotionShift?: "improving" | "worsening" | "stable"

  // 전반적인 감정 톤
  sentiment: SentimentType
  confidence: number // 0-1

  // 맥락 정보
  context?: {
    trigger?: string // 감정 유발 요인
    duration?: "momentary" | "persistent" // 감정 지속 시간
    relatedIssue?: string // 관련 문제
  }

  // 시간 정보
  timestamp: number
}

// 감정 변화 이력
export interface EmotionHistory {
  emotions: Array<{
    emotion: BasicEmotion | null
    sentiment: SentimentType
    intensity: EmotionIntensity
    timestamp: number
    messageId: string
  }>

  // 감정 변화 패턴
  pattern?: "improving" | "worsening" | "fluctuating" | "stable"

  // 주요 감정 트리거
  triggers?: string[]
}

// 감정 기반 응답 전략
export interface EmotionResponseStrategy {
  emotion: BasicEmotion | null
  intensity: EmotionIntensity
  sentiment: SentimentType

  // 응답 전략
  acknowledgment: string // 감정 인정 문구
  tone: "empathetic" | "reassuring" | "enthusiastic" | "calm" | "professional"
  approachStrategy: "problem-solving" | "emotional-support" | "information" | "redirection"

  // 추천 응답 템플릿
  responseTemplates: string[]

  // 피해야 할 표현
  avoidPhrases: string[]
}

// 감정 분석 결과
export interface EmotionAnalysisResult {
  text: string
  emotion: {
    primary: BasicEmotion | null
    secondary?: BasicEmotion
    intensity: EmotionIntensity
  }
  sentiment: SentimentType
  confidence: number
  triggers?: string[]
  language: string
}

// 감정 분석 요청
export interface EmotionAnalysisRequest {
  text: string
  conversationHistory?: Array<{
    role: string
    content: string
  }>
  previousEmotions?: EmotionHistory
  language?: string
}
