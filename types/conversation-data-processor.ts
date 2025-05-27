export type ConversationPattern = {
  id: string
  pattern: string
  frequency: number
  examples: string[]
  relatedIntents: string[]
  averageSentimentScore?: number
  userTypes: string[]
  commonEntities: Record<string, number> // 엔티티 이름과 빈도
}

export type ConversationCluster = {
  id: string
  name: string
  size: number
  centralPattern: string
  patterns: ConversationPattern[]
  averageSatisfactionScore?: number
  commonIssueTypes: string[]
  resolutionRate: number
}

export type ConversationInsight = {
  id: string
  type: "pattern" | "anomaly" | "trend" | "suggestion"
  description: string
  importance: number // 1-10
  relatedPatterns: string[]
  detectedAt: string
  status: "new" | "acknowledged" | "implemented" | "ignored"
}

export type ConversationDataSummary = {
  totalSessions: number
  totalMessages: number
  uniquePatterns: number
  topClusters: ConversationCluster[]
  recentInsights: ConversationInsight[]
  patternDistribution: Record<string, number>
  dataQualityScore: number // 0-100
}

export type PatternExtractionConfig = {
  minFrequency: number
  maxPatterns: number
  similarityThreshold: number
  includeEntities: boolean
  includeIntents: boolean
  includeSentiment: boolean
  timeRange?: {
    start: Date
    end: Date
  }
}

export type ScenarioGenerationFromDataConfig = {
  patternExtractionConfig: PatternExtractionConfig
  targetClusterIds?: string[]
  targetPatternIds?: string[]
  minResolutionRate?: number
  minSatisfactionScore?: number
  maxScenarios: number
  balanceCategories: boolean
  includeRarePatterns: boolean
  enrichWithAI: boolean
}
