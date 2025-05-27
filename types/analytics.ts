// 프롬프트 분석을 위한 타입 정의

// 프롬프트 변형 정보
export interface PromptVariant {
  id: string
  name: string
  description: string
  systemPrompt: string
  createdAt: Date
  updatedAt?: Date
  isActive: boolean
}

// 응답 품질 평가 지표
export interface QualityMetrics {
  relevance: number // 0-10: 질문에 대한 관련성
  accuracy: number // 0-10: 정보의 정확성
  completeness: number // 0-10: 응답의 완전성
  clarity: number // 0-10: 명확성
  tone: number // 0-10: 톤의 적절성
  overallScore: number // 0-10: 종합 점수
}

// 성능 지표
export interface PerformanceMetrics {
  promptTokens: number // 프롬프트 토큰 수
  completionTokens: number // 응답 토큰 수
  totalTokens: number // 총 토큰 수
  latency: number // 응답 시간 (ms)
  processingTime: number // 처리 시간 (ms)
  timestamp: Date // 타임스탬프
}

// 사용자 피드백
export interface UserFeedback {
  rating: number // 1-5 별점
  comment?: string // 선택적 코멘트
  timestamp: Date
}

// 응답 분석 데이터
export interface ResponseAnalysis {
  id: string
  promptVariantId: string
  userMessage: string
  detectedIntent: string
  botResponse: string
  performance: PerformanceMetrics
  quality?: QualityMetrics // 자동 또는 수동 평가
  userFeedback?: UserFeedback // 사용자 피드백
  metadata?: Record<string, any> // 추가 메타데이터
}

// 프롬프트 분석 결과 요약
export interface PromptAnalyticsSummary {
  variantId: string
  variantName: string
  totalInteractions: number
  averageQualityScore: number
  averageUserRating: number
  averageLatency: number
  averageTokenUsage: number
  intentDistribution: Record<string, number>
  timeRange: {
    start: Date
    end: Date
  }
}

// 프롬프트 비교 결과
export interface PromptComparisonResult {
  baselineVariantId: string
  testVariantId: string
  qualityDifference: number // 품질 점수 차이 (%)
  latencyDifference: number // 응답 시간 차이 (%)
  tokenUsageDifference: number // 토큰 사용량 차이 (%)
  userRatingDifference: number // 사용자 평가 차이 (%)
  significanceLevel: number // 통계적 유의성 (p-value)
  sampleSize: {
    baseline: number
    test: number
  }
}
