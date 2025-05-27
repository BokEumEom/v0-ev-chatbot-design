import type { ChatScenario } from "@/data/chatbot-scenarios"

/**
 * 시나리오 평가 지표
 */
export interface ScenarioQualityMetrics {
  realism: number // 현실성 (0-10)
  relevance: number // 관련성 (0-10)
  complexity: number // 복잡성 (0-10)
  coherence: number // 일관성 (0-10)
  naturalness: number // 자연스러움 (0-10)
  coverage: number // 주제 커버리지 (0-10)
  userFocus: number // 사용자 중심성 (0-10)
  technicalAccuracy: number // 기술적 정확성 (0-10)
  overallScore: number // 종합 점수 (0-10)
}

/**
 * 시나리오 평가 결과
 */
export interface ScenarioEvaluationResult {
  id: string
  scenarioId: string
  metrics: ScenarioQualityMetrics
  strengths: string[] // 강점
  weaknesses: string[] // 약점
  improvementSuggestions: ScenarioImprovementSuggestion[] // 개선 제안
  evaluatedAt: string
  evaluationMethod: "ai" | "rule" | "hybrid" | "human"
  evaluatedBy?: string
  notes?: string
}

/**
 * 시나리오 개선 제안
 */
export interface ScenarioImprovementSuggestion {
  id: string
  type: "add" | "modify" | "remove" | "replace" | "reorder"
  target: "conversation" | "title" | "description" | "keyFeatures" | "entire"
  targetIndex?: number // 대화 인덱스 등
  confidence: number // 신뢰도 (0-1)
  impact: "high" | "medium" | "low" // 영향도
  suggestion: string // 제안 내용
  reasoning: string // 제안 이유
  exampleImplementation?: string // 구현 예시
}

/**
 * 시나리오 개선 결과
 */
export interface ScenarioImprovementResult {
  id: string
  originalScenarioId: string
  improvedScenario: ChatScenario
  appliedSuggestions: string[] // 적용된 제안 ID 목록
  improvementSummary: string
  improvedAt: string
  beforeMetrics?: ScenarioQualityMetrics
  afterMetrics?: ScenarioQualityMetrics
  improvementMethod: "ai" | "rule" | "hybrid" | "human"
}

/**
 * 시나리오 평가 작업
 */
export interface ScenarioEvaluationJob {
  id: string
  status: "pending" | "in_progress" | "completed" | "failed"
  scenarioIds: string[]
  evaluationMethod: "ai" | "rule" | "hybrid"
  settings: ScenarioEvaluationSettings
  progress: number // 0-100
  createdAt: string
  startedAt?: string
  completedAt?: string
  results?: ScenarioEvaluationResult[]
  error?: string
}

/**
 * 시나리오 개선 작업
 */
export interface ScenarioImprovementJob {
  id: string
  status: "pending" | "in_progress" | "completed" | "failed"
  evaluationResultIds: string[]
  improvementMethod: "ai" | "rule" | "hybrid"
  settings: ScenarioImprovementSettings
  progress: number // 0-100
  createdAt: string
  startedAt?: string
  completedAt?: string
  results?: ScenarioImprovementResult[]
  error?: string
}

/**
 * 시나리오 평가 설정
 */
export interface ScenarioEvaluationSettings {
  evaluationMethod: "ai" | "rule" | "hybrid"
  aiModel?: string
  metricWeights?: Partial<Record<keyof Omit<ScenarioQualityMetrics, "overallScore">, number>>
  minThresholds?: Partial<Record<keyof ScenarioQualityMetrics, number>>
  maxSuggestionsPerScenario?: number
  focusAreas?: Array<keyof Omit<ScenarioQualityMetrics, "overallScore">>
  customRules?: ScenarioEvaluationRule[]
}

/**
 * 시나리오 개선 설정
 */
export interface ScenarioImprovementSettings {
  improvementMethod: "ai" | "rule" | "hybrid"
  aiModel?: string
  suggestionTypes?: Array<ScenarioImprovementSuggestion["type"]>
  minConfidence?: number
  minImpact?: "high" | "medium" | "low"
  maxChangesPerScenario?: number
  preserveOriginalStructure?: boolean
  focusAreas?: Array<keyof Omit<ScenarioQualityMetrics, "overallScore">>
}

/**
 * 시나리오 평가 규칙
 */
export interface ScenarioEvaluationRule {
  id: string
  name: string
  description: string
  metric: keyof Omit<ScenarioQualityMetrics, "overallScore">
  condition: string
  weight: number
  checkFunction: (scenario: ChatScenario) => {
    pass: boolean
    score: number
    feedback?: string
  }
}

/**
 * 시나리오 평가 통계
 */
export interface ScenarioEvaluationStats {
  totalEvaluated: number
  averageMetrics: ScenarioQualityMetrics
  metricDistribution: Record<keyof ScenarioQualityMetrics, number[]>
  commonStrengths: Array<{ text: string; count: number }>
  commonWeaknesses: Array<{ text: string; count: number }>
  commonSuggestionTypes: Record<ScenarioImprovementSuggestion["type"], number>
  evaluationMethods: Record<ScenarioEvaluationResult["evaluationMethod"], number>
  timeRange: { start: string; end: string }
}

/**
 * 시나리오 개선 통계
 */
export interface ScenarioImprovementStats {
  totalImproved: number
  averageMetricImprovement: Partial<Record<keyof ScenarioQualityMetrics, number>>
  suggestionTypeDistribution: Record<ScenarioImprovementSuggestion["type"], number>
  targetDistribution: Record<ScenarioImprovementSuggestion["target"], number>
  averageAppliedSuggestions: number
  improvementMethods: Record<ScenarioImprovementResult["improvementMethod"], number>
  timeRange: { start: string; end: string }
}
