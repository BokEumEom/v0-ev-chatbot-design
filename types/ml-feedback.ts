import type { Feedback, FeedbackCategory } from "./feedback"

// 피드백 분류 모델 유형
export type ClassificationModelType = "naive-bayes" | "random-forest" | "neural-network" | "ensemble"

// 분류 신뢰도 수준
export type ConfidenceLevel = "high" | "medium" | "low"

// 피드백 우선순위 레벨
export type PriorityLevel = "critical" | "high" | "medium" | "low" | "trivial"

// 피드백 주제 (세부 카테고리)
export type FeedbackTopic =
  | "charging_speed" // 충전 속도
  | "app_usability" // 앱 사용성
  | "payment_issues" // 결제 문제
  | "station_availability" // 충전소 가용성
  | "connection_problems" // 연결 문제
  | "account_issues" // 계정 문제
  | "ui_design" // UI 디자인
  | "feature_request" // 기능 요청
  | "bug_report" // 버그 신고
  | "performance" // 성능
  | "documentation" // 문서화
  | "customer_service" // 고객 서비스
  | "pricing" // 가격 정책
  | "other" // 기타

// 분류 결과 인터페이스
export interface ClassificationResult {
  category: FeedbackCategory
  topics: Array<{
    topic: FeedbackTopic
    confidence: number // 0-1 사이의 신뢰도
  }>
  confidenceLevel: ConfidenceLevel
  modelUsed: ClassificationModelType
  classificationTime: Date
}

// 우선순위 계산 결과 인터페이스
export interface PriorityResult {
  level: PriorityLevel
  score: number // 0-100 사이의 점수
  factors: Array<{
    name: string
    contribution: number // 각 요소의 기여도 (0-1)
    description: string
  }>
  calculationTime: Date
}

// 분류 및 우선순위가 추가된 피드백 인터페이스
export interface ClassifiedFeedback extends Feedback {
  classification?: ClassificationResult
  priority?: PriorityResult
}

// 모델 성능 메트릭
export interface ModelPerformanceMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: number[][]
  lastEvaluated: Date
  sampleSize: number
}

// 모델 학습 설정
export interface ModelTrainingConfig {
  modelType: ClassificationModelType
  trainingDataPercentage: number // 0-1 사이의 값
  features: string[] // 사용할 특성들
  hyperparameters: Record<string, any> // 모델별 하이퍼파라미터
  balanceClasses: boolean // 클래스 불균형 처리 여부
}

// 모델 학습 결과
export interface ModelTrainingResult {
  modelId: string
  modelType: ClassificationModelType
  trainingStartTime: Date
  trainingEndTime: Date
  iterations: number
  performance: ModelPerformanceMetrics
  config: ModelTrainingConfig
}

// 분류 모델 정보
export interface ClassificationModel {
  id: string
  name: string
  description: string
  type: ClassificationModelType
  version: string
  createdAt: Date
  updatedAt: Date
  trainedBy: string
  isActive: boolean
  performance: ModelPerformanceMetrics
  config: ModelTrainingConfig
}

// 우선순위 계산 설정
export interface PriorityCalculationConfig {
  weights: {
    urgency: number // 긴급성 가중치
    impact: number // 영향도 가중치
    effort: number // 노력 가중치
    userSegment: number // 사용자 세그먼트 가중치
    recency: number // 최신성 가중치
    frequency: number // 빈도 가중치
  }
  thresholds: {
    critical: number // 위기 수준 임계값
    high: number // 높음 수준 임계값
    medium: number // 중간 수준 임계값
    low: number // 낮음 수준 임계값
  }
  decayFactor: number // 시간 경과에 따른 감소 계수
  userSegmentMultipliers: Record<string, number> // 사용자 세그먼트별 승수
}
