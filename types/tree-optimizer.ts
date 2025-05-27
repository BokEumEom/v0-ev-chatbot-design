import type { TroubleshootingNode } from "./troubleshooting"

// 노드 사용 통계
export interface NodeUsageStats {
  nodeId: string
  visits: number
  exitRate: number // 이 노드에서 진단을 종료하는 비율
  averageTimeSpent: number // 이 노드에서 소요되는 평균 시간 (ms)
  successRate: number // 이 노드를 통과한 후 성공적으로 진단을 완료하는 비율
}

// 경로 통계
export interface PathStats {
  path: string[] // 노드 ID 배열
  frequency: number // 이 경로가 사용된 횟수
  completionRate: number // 이 경로로 진단을 완료한 비율
  averageCompletionTime: number // 이 경로의 평균 완료 시간 (ms)
  satisfactionRate: number // 이 경로의 사용자 만족도
}

// 최적화 제안
export interface OptimizationSuggestion {
  type: "reorder" | "merge" | "split" | "remove" | "add" | "modify"
  description: string
  confidence: number // 0-1 사이의 신뢰도
  impact: "high" | "medium" | "low" // 예상 영향도
  affectedNodes: string[] // 영향을 받는 노드 ID 배열
  before?: Partial<TroubleshootingNode>[] // 변경 전 노드 (일부만 포함할 수 있음)
  after?: Partial<TroubleshootingNode>[] // 변경 후 노드 (일부만 포함할 수 있음)
  reasoning: string // 이 제안의 근거
}

// 트리 최적화 결과
export interface TreeOptimizationResult {
  originalTree: TroubleshootingNode[]
  optimizedTree: TroubleshootingNode[]
  suggestions: OptimizationSuggestion[]
  metrics: {
    averagePathLength: {
      before: number
      after: number
      improvement: number // 백분율
    }
    averageCompletionTime: {
      before: number
      after: number
      improvement: number // 백분율
    }
    estimatedSuccessRate: {
      before: number
      after: number
      improvement: number // 백분율
    }
  }
}

// 최적화 설정
export interface OptimizationSettings {
  minDataPoints: number // 최적화에 필요한 최소 데이터 포인트 수
  targetMetrics: ("pathLength" | "completionTime" | "successRate")[] // 최적화 대상 지표
  optimizationStrength: "conservative" | "balanced" | "aggressive" // 최적화 강도
  preserveNodes: string[] // 보존할 노드 ID 배열 (변경 불가)
  dateRange?: {
    start: Date
    end: Date
  }
}

// 시뮬레이션 결과
export interface SimulationResult {
  sessionCount: number
  originalMetrics: {
    averageSteps: number
    averageTime: number
    completionRate: number
    satisfactionRate: number
  }
  optimizedMetrics: {
    averageSteps: number
    averageTime: number
    completionRate: number
    satisfactionRate: number
  }
  improvement: {
    steps: number // 백분율
    time: number // 백분율
    completionRate: number // 백분율
    satisfactionRate: number // 백분율
  }
}

// 트리 변경 이력
export interface TreeChangeHistory {
  id: string
  timestamp: Date
  description: string
  author: string
  changes: OptimizationSuggestion[]
  metrics?: {
    before: {
      averagePathLength: number
      averageCompletionTime: number
      estimatedSuccessRate: number
    }
    after: {
      averagePathLength: number
      averageCompletionTime: number
      estimatedSuccessRate: number
    }
  }
  applied: boolean
  rollbackId?: string // 롤백된 경우, 원본 변경 ID
}
