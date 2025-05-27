// 프롬프트 버전 상태
export type PromptVersionStatus = "draft" | "testing" | "active" | "inactive" | "archived"

// 프롬프트 버전 타입
export interface PromptVersion {
  id: string
  name: string
  version: string
  description: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  systemPrompt: string
  modules?: Record<string, string>
  targetIntents: string[]
  changeLog: string
  baseVersion?: string
  status: PromptVersionStatus
  performance?: PromptVersionPerformance
}

// 프롬프트 버전 성능 지표
export interface PromptVersionPerformance {
  qualityScore: number
  userRating: number
  latency: number
  tokenUsage: number
  intentSuccessRates: Record<string, number>
  sampleSize: number
  lastUpdated: string
}

// 프롬프트 버전 비교 결과
export interface PromptVersionComparison {
  baseVersion: PromptVersion
  comparisonVersion: PromptVersion
  differences: {
    systemPrompt: string[]
    modules?: Record<string, string[]>
    performance?: {
      qualityScore: number
      userRating: number
      latency: number
      tokenUsage: number
      intentSuccessRates: Record<string, number>
    }
  }
}

// 프롬프트 배포 이력
export interface PromptDeploymentHistory {
  id: string
  versionId: string
  versionName: string
  deployedAt: string
  deployedBy: string
  environment: "development" | "testing" | "production"
  status: "success" | "failed" | "rolled-back"
  metrics?: {
    beforeDeployment: PromptVersionPerformance
    afterDeployment: PromptVersionPerformance
  }
  rollbackInfo?: {
    rolledBackAt: string
    rolledBackBy: string
    reason: string
  }
}

// 프롬프트 버전 성능 지표 (일별 및 인텐트별)
export interface PromptVersionMetrics {
  dailyMetrics: {
    date: string
    accuracy: number
    latency: number
    satisfaction: number
  }[]
  intentMetrics: Record<string, { accuracy: number }>
}
