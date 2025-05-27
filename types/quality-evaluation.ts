/**
 * 품질 지표 타입
 */
export interface QualityMetrics {
  relevance: number // 관련성
  accuracy: number // 정확성
  completeness: number // 완전성
  clarity: number // 명확성
  helpfulness: number // 유용성
  conciseness: number // 간결성
  tone: number // 어조
  overallScore: number // 종합 점수
}

/**
 * 평가 방법 타입
 */
export type EvaluationMethod = "ai" | "rule" | "human" | "hybrid"

/**
 * 평가 결과 타입
 */
export interface EvaluationResult {
  id: string
  promptVersionId: string
  conversationId: string
  userMessage: string
  botResponse: string
  detectedIntent: string
  metrics: QualityMetrics
  method: EvaluationMethod
  evaluatedAt: string
  evaluatedBy?: string
  feedback?: string
  examples?: {
    good?: string
    bad?: string
  }
}

/**
 * 평가 규칙 타입
 */
export interface EvaluationRule {
  id: string
  name: string
  description: string
  metric: keyof Omit<QualityMetrics, "overallScore">
  condition: string
  weight: number
  examples: {
    pass: string[]
    fail: string[]
  }
}

/**
 * 평가 작업 타입
 */
export interface EvaluationJob {
  id: string
  promptVersionId: string
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled"
  method: EvaluationMethod
  createdAt: string
  startedAt?: string
  completedAt?: string
  totalConversations: number
  evaluatedConversations: number
  error?: string
}

/**
 * 평가 설정 타입
 */
export interface EvaluationConfig {
  defaultMethod: EvaluationMethod
  metrics: Record<
    keyof Omit<QualityMetrics, "overallScore">,
    {
      weight: number
      threshold: number
      description: string
    }
  >
  rules: EvaluationRule[]
  aiEvaluator: {
    model: string
    prompt: string
    temperature: number
  }
}
