import { v4 as uuidv4 } from "uuid"
import type { ChatScenario } from "@/data/chatbot-scenarios"
import type { ScenarioGenerationSettings } from "@/types/scenario-generator"
import type {
  ConversationPattern,
  ConversationCluster,
  ScenarioGenerationFromDataConfig,
} from "@/types/conversation-data-processor"
import { scenarioGeneratorService } from "@/services/scenario-generator-service"
import { conversationDataProcessor } from "@/services/conversation-data-processor"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class UserDataBasedScenarioGenerator {
  private static instance: UserDataBasedScenarioGenerator

  private constructor() {}

  public static getInstance(): UserDataBasedScenarioGenerator {
    if (!UserDataBasedScenarioGenerator.instance) {
      UserDataBasedScenarioGenerator.instance = new UserDataBasedScenarioGenerator()
    }
    return UserDataBasedScenarioGenerator.instance
  }

  /**
   * 사용자 대화 데이터 기반 시나리오 생성
   */
  public async generateScenariosFromData(
    config: ScenarioGenerationFromDataConfig,
    existingScenarios: string[] = [],
  ): Promise<ChatScenario[]> {
    try {
      // 1. 패턴 추출
      const patterns = await conversationDataProcessor.extractPatterns(config.patternExtractionConfig)

      // 2. 패턴 클러스터링
      const clusters = await conversationDataProcessor.clusterPatterns(patterns)

      // 3. 타겟 패턴 및 클러스터 필터링
      const targetPatterns = this.filterTargetPatterns(patterns, clusters, config)

      // 4. 시나리오 생성
      const scenarios = await this.createScenariosFromPatterns(targetPatterns, config, existingScenarios)

      return scenarios
    } catch (error) {
      console.error("사용자 데이터 기반 시나리오 생성 오류:", error)
      throw new Error(
        `사용자 데이터 기반 시나리오 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * 타겟 패턴 필터링
   */
  private filterTargetPatterns(
    patterns: ConversationPattern[],
    clusters: ConversationCluster[],
    config: ScenarioGenerationFromDataConfig,
  ): ConversationPattern[] {
    let filteredPatterns: ConversationPattern[] = []

    // 1. 특정 클러스터 ID가 지정된 경우
    if (config.targetClusterIds && config.targetClusterIds.length > 0) {
      const targetClusters = clusters.filter((cluster) => config.targetClusterIds?.includes(cluster.id))
      targetClusters.forEach((cluster) => {
        filteredPatterns.push(...cluster.patterns)
      })
    }

    // 2. 특정 패턴 ID가 지정된 경우
    if (config.targetPatternIds && config.targetPatternIds.length > 0) {
      const specificPatterns = patterns.filter((pattern) => config.targetPatternIds?.includes(pattern.id))
      filteredPatterns.push(...specificPatterns)
    }

    // 3. 특정 ID가 지정되지 않은 경우, 해결률 및 만족도 기준으로 필터링
    if (
      (!config.targetClusterIds || config.targetClusterIds.length === 0) &&
      (!config.targetPatternIds || config.targetPatternIds.length === 0)
    ) {
      // 해결률 기준 클러스터 필터링
      let filteredClusters = clusters
      if (config.minResolutionRate !== undefined) {
        filteredClusters = filteredClusters.filter(
          (cluster) => cluster.resolutionRate >= (config.minResolutionRate || 0),
        )
      }

      // 만족도 기준 클러스터 필터링
      if (config.minSatisfactionScore !== undefined) {
        filteredClusters = filteredClusters.filter(
          (cluster) =>
            cluster.averageSatisfactionScore !== undefined &&
            cluster.averageSatisfactionScore >= (config.minSatisfactionScore || 0),
        )
      }

      // 필터링된 클러스터의 패턴 추가
      filteredClusters.forEach((cluster) => {
        filteredPatterns.push(...cluster.patterns)
      })

      // 희귀 패턴 포함 옵션
      if (config.includeRarePatterns) {
        const rarePatternsThreshold = Math.floor(patterns.length * 0.1) // 하위 10% 빈도
        const rarePatterns = patterns
          .filter((p) => !filteredPatterns.some((fp) => fp.id === p.id)) // 이미 포함되지 않은 패턴
          .sort((a, b) => a.frequency - b.frequency)
          .slice(0, rarePatternsThreshold)

        filteredPatterns.push(...rarePatterns)
      }
    }

    // 중복 제거
    filteredPatterns = Array.from(new Map(filteredPatterns.map((p) => [p.id, p])).values())

    // 빈도 기준 정렬
    filteredPatterns.sort((a, b) => b.frequency - a.frequency)

    // 카테고리 균형 조정
    if (config.balanceCategories) {
      filteredPatterns = this.balanceCategoriesInPatterns(filteredPatterns)
    }

    // 최대 시나리오 수 제한
    return filteredPatterns.slice(0, config.maxScenarios)
  }

  /**
   * 패턴 카테고리 균형 조정
   */
  private balanceCategoriesInPatterns(patterns: ConversationPattern[]): ConversationPattern[] {
    // 인텐트별 패턴 그룹화
    const intentGroups: Record<string, ConversationPattern[]> = {}

    patterns.forEach((pattern) => {
      if (pattern.relatedIntents.length === 0) {
        const key = "unknown"
        if (!intentGroups[key]) intentGroups[key] = []
        intentGroups[key].push(pattern)
      } else {
        // 첫 번째 인텐트만 사용 (단순화)
        const key = pattern.relatedIntents[0]
        if (!intentGroups[key]) intentGroups[key] = []
        intentGroups[key].push(pattern)
      }
    })

    // 각 인텐트 그룹에서 균등하게 패턴 선택
    const balancedPatterns: ConversationPattern[] = []
    let remaining = true
    let index = 0

    while (remaining) {
      remaining = false

      Object.values(intentGroups).forEach((group) => {
        if (index < group.length) {
          balancedPatterns.push(group[index])
          remaining = true
        }
      })

      index++
    }

    return balancedPatterns
  }

  /**
   * 패턴에서 시나리오 생성
   */
  private async createScenariosFromPatterns(
    patterns: ConversationPattern[],
    config: ScenarioGenerationFromDataConfig,
    existingScenarios: string[],
  ): Promise<ChatScenario[]> {
    const scenarios: ChatScenario[] = []

    for (const pattern of patterns) {
      try {
        // 패턴 기반 시나리오 설정 생성
        const settings = this.createSettingsFromPattern(pattern, config)

        // AI 강화 옵션에 따라 시나리오 생성
        let scenario: ChatScenario

        if (config.enrichWithAI) {
          // AI를 사용하여 패턴 기반 시나리오 생성
          // scenario = await scenarioGeneratorService.generateScenario(settings, existingScenarios)
          const prompt = `다음 설정을 기반으로 시나리오를 생성하세요: ${JSON.stringify(settings)}`
          const { text } = await generateText({
            model: google("gemini-pro"),
            prompt: prompt,
            temperature: 0.7,
          })

          scenario = {
            id: `data_${settings.category.toLowerCase().replace(/\s+/g, "_")}_${uuidv4().substring(0, 8)}`,
            category: settings.category,
            title: settings.topic,
            description: text,
            conversations: [],
            keyFeatures: [],
          }
        } else {
          // 패턴에서 직접 간단한 시나리오 생성
          scenario = this.createBasicScenarioFromPattern(pattern, settings)
        }

        // 생성된 시나리오 유효성 검사
        const validation = scenarioGeneratorService.validateScenario(scenario)
        if (validation.valid) {
          scenarios.push(scenario)
          existingScenarios.push(scenario.id) // 중복 방지를 위해 ID 추가
        }
      } catch (error) {
        console.error(`패턴 "${pattern.pattern}"에서 시나리오 생성 실패:`, error)
        // 오류가 발생해도 다음 패턴으로 계속 진행
        continue
      }
    }

    return scenarios
  }

  /**
   * 패턴에서 시나리오 설정 생성
   */
  private createSettingsFromPattern(
    pattern: ConversationPattern,
    config: ScenarioGenerationFromDataConfig,
  ): ScenarioGenerationSettings {
    // 패턴에서 카테고리 추출
    let category = "일반 문의"
    if (pattern.relatedIntents.length > 0) {
      // 첫 번째 인텐트를 카테고리로 사용
      category = pattern.relatedIntents[0]
    }

    // 사용자 유형 결정
    let userType: "beginner" | "intermediate" | "expert" = "intermediate"
    if (pattern.userTypes.includes("beginner")) {
      userType = "beginner"
    } else if (pattern.userTypes.includes("expert")) {
      userType = "expert"
    }

    // 복잡도 결정 (패턴 예시의 길이 기반)
    let complexity: "simple" | "medium" | "complex" = "medium"
    const avgExampleLength = pattern.examples.reduce((sum, ex) => sum + ex.length, 0) / pattern.examples.length

    if (avgExampleLength < 50) {
      complexity = "simple"
    } else if (avgExampleLength > 100) {
      complexity = "complex"
    }

    // 대화 턴 수 결정
    const conversationTurns = complexity === "simple" ? 2 : complexity === "medium" ? 3 : 4

    return {
      category,
      topic: pattern.pattern,
      complexity,
      userType,
      conversationTurns,
      includeEntities: config.patternExtractionConfig.includeEntities,
      includeNotes: true,
      specificRequirements: `이 시나리오는 실제 사용자 대화 패턴 "${pattern.pattern}"을 기반으로 합니다. 다음 예시를 참고하세요: ${pattern.examples[0]}`,
    }
  }

  /**
   * 패턴에서 기본 시나리오 직접 생성 (AI 없이)
   */
  private createBasicScenarioFromPattern(
    pattern: ConversationPattern,
    settings: ScenarioGenerationSettings,
  ): ChatScenario {
    // 카테고리 결정
    const category = settings.category

    // 제목 생성
    const title = `${pattern.pattern} 관련 문의`

    // 설명 생성
    const description = `사용자가 "${pattern.pattern}"에 관한 정보를 요청하는 시나리오입니다.`

    // 대화 생성
    const conversations = []

    // 첫 번째 대화: 패턴 예시 사용
    const firstUserMessage = pattern.examples[0] || `${pattern.pattern}에 대해 알려주세요.`
    conversations.push({
      user: firstUserMessage,
      bot: `${pattern.pattern}에 대한 정보를 안내해 드리겠습니다. 어떤 부분이 궁금하신가요?`,
      intent: pattern.relatedIntents[0] || "정보_요청",
      entities: this.extractEntitiesFromPattern(pattern),
      notes: "사용자의 초기 질문을 인식하고 추가 정보를 요청합니다.",
    })

    // 추가 대화 생성
    for (let i = 1; i < settings.conversationTurns; i++) {
      const userExample = pattern.examples[i] || `${pattern.pattern}에 대해 더 자세히 알려주세요.`

      conversations.push({
        user: userExample,
        bot: `${pattern.pattern}에 관한 추가 정보입니다. [여기에 상세 정보가 들어갑니다]`,
        intent: "추가_정보_요청",
        entities: {},
        notes: "사용자의 후속 질문에 대한 상세 정보를 제공합니다.",
      })
    }

    // 핵심 기능 생성
    const keyFeatures = [`${pattern.pattern} 관련 정보 제공`, "사용자 질문에 대한 단계별 응답", "관련 문제 해결 안내"]

    return {
      id: `data_${category.toLowerCase().replace(/\s+/g, "_")}_${uuidv4().substring(0, 8)}`,
      category,
      title,
      description,
      conversations,
      keyFeatures,
    }
  }

  /**
   * 패턴에서 엔티티 추출
   */
  private extractEntitiesFromPattern(pattern: ConversationPattern): Record<string, string> {
    const entities: Record<string, string> = {}

    // 가장 빈번한 엔티티 추출
    const topEntities = Object.entries(pattern.commonEntities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    topEntities.forEach(([entity]) => {
      entities[entity] = `[${entity} 값]`
    })

    return entities
  }
}

export const userDataBasedScenarioGenerator = UserDataBasedScenarioGenerator.getInstance()
