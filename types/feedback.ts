// 피드백 유형
export type FeedbackType = "rating" | "text" | "choice" | "suggestion"

// 피드백 감정 분석 결과
export type SentimentType = "positive" | "neutral" | "negative"

// 피드백 카테고리
export type FeedbackCategory =
  | "usability" // 사용성
  | "accuracy" // 정확성
  | "speed" // 속도
  | "clarity" // 명확성
  | "completeness" // 완전성
  | "relevance" // 관련성
  | "other" // 기타

// 기본 피드백 인터페이스
export interface BaseFeedback {
  id: string
  sessionId: string
  nodeId?: string
  timestamp: Date
  userId?: string
  deviceInfo?: {
    type: "mobile" | "tablet" | "desktop"
    browser?: string
    os?: string
  }
  context?: {
    previousNodeId?: string
    pathToNode?: string[]
    timeSpentOnNode?: number // 밀리초
    totalSessionTime?: number // 밀리초
    attemptCount?: number // 해당 문제 해결 시도 횟수
  }
}

// 평점 피드백
export interface RatingFeedback extends BaseFeedback {
  type: "rating"
  rating: number // 1-5
  category?: FeedbackCategory
}

// 텍스트 피드백
export interface TextFeedback extends BaseFeedback {
  type: "text"
  text: string
  sentiment?: SentimentType
  keywords?: string[]
  category?: FeedbackCategory
}

// 선택형 피드백
export interface ChoiceFeedback extends BaseFeedback {
  type: "choice"
  question: string
  options: string[]
  selectedOption: string
  category?: FeedbackCategory
}

// 제안 피드백
export interface SuggestionFeedback extends BaseFeedback {
  type: "suggestion"
  suggestion: string
  category?: FeedbackCategory
  sentiment?: SentimentType
  keywords?: string[]
}

// 통합 피드백 타입
export type Feedback = RatingFeedback | TextFeedback | ChoiceFeedback | SuggestionFeedback

// 피드백 분석 결과
export interface FeedbackAnalysis {
  nodeId: string
  feedbackCount: number
  averageRating: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  categoryDistribution: Record<FeedbackCategory, number>
  commonKeywords: Array<{
    keyword: string
    count: number
    sentiment: SentimentType
  }>
  trends: Array<{
    date: string
    averageRating: number
    feedbackCount: number
  }>
  suggestions: Array<{
    text: string
    sentiment: SentimentType
    timestamp: Date
  }>
}

// 피드백 기반 최적화 제안
export interface FeedbackBasedSuggestion {
  nodeId: string
  type: "modify" | "remove" | "reorder" | "add" | "merge" | "split"
  confidence: number // 0-1
  impact: "high" | "medium" | "low"
  description: string
  reasoning: string
  supportingFeedback: Array<{
    id: string
    type: FeedbackType
    summary: string
    sentiment: SentimentType
  }>
}

// 피드백 필터 옵션
export interface FeedbackFilterOptions {
  dateRange?: {
    start: Date
    end: Date
  }
  feedbackTypes?: FeedbackType[]
  sentiments?: SentimentType[]
  categories?: FeedbackCategory[]
  minRating?: number
  maxRating?: number
  nodeIds?: string[]
  keywords?: string[]
  hasText?: boolean
}
