import type { ChatScenario } from "@/data/chatbot-scenarios"

export type ScenarioGenerationSettings = {
  category: string
  topic: string
  complexity: "simple" | "medium" | "complex"
  userType: "beginner" | "intermediate" | "expert"
  conversationTurns: number
  includeEntities: boolean
  includeNotes: boolean
  specificRequirements?: string
}

export type ScenarioGenerationRequest = {
  settings: ScenarioGenerationSettings
  existingScenarios?: string[] // 기존 시나리오 ID 목록 (중복 방지용)
}

export type ScenarioGenerationResult = {
  id: string
  status: "success" | "error" | "pending"
  scenario?: ChatScenario
  error?: string
  timestamp: string
}

export type ScenarioGenerationHistory = {
  id: string
  settings: ScenarioGenerationSettings
  result: ScenarioGenerationResult
  createdAt: string
}

export type ScenarioGenerationStats = {
  totalGenerated: number
  successRate: number
  categoryCounts: Record<string, number>
  averageConversationTurns: number
}
