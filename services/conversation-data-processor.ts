import { v4 as uuidv4 } from "uuid"
import type { ConversationMessage, ConversationSession } from "@/types/conversation-analytics"
import type {
  ConversationPattern,
  ConversationCluster,
  ConversationInsight,
  ConversationDataSummary,
  PatternExtractionConfig,
} from "@/types/conversation-data-processor"
import { conversationAnalyticsService } from "@/services/conversation-analytics-service"

export class ConversationDataProcessor {
  private static instance: ConversationDataProcessor

  private constructor() {}

  public static getInstance(): ConversationDataProcessor {
    if (!ConversationDataProcessor.instance) {
      ConversationDataProcessor.instance = new ConversationDataProcessor()
    }
    return ConversationDataProcessor.instance
  }

  /**
   * 대화 데이터에서 패턴 추출
   */
  public async extractPatterns(config: PatternExtractionConfig): Promise<ConversationPattern[]> {
    try {
      // 대화 데이터 가져오기
      const sessions = conversationAnalyticsService.getSessions({
        dateRange: config.timeRange,
      })

      // 세션별 메시지 수집
      const allMessages: ConversationMessage[] = []
      for (const session of sessions) {
        const sessionMessages = conversationAnalyticsService.getMessagesBySessionId(session.id)
        allMessages.push(...sessionMessages)
      }

      // 사용자 메시지만 필터링
      const userMessages = allMessages.filter((msg) => msg.sender === "user")

      // 간단한 패턴 추출 (실제 구현에서는 더 복잡한 NLP 기법 사용)
      const patterns = this.extractBasicPatterns(userMessages, sessions, config)

      // 패턴 클러스터링 및 정제
      const refinedPatterns = this.refinePatterns(patterns, config)

      return refinedPatterns
    } catch (error) {
      console.error("패턴 추출 오류:", error)
      throw new Error(
        `대화 패턴 추출 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * 기본 패턴 추출 (간단한 구현)
   */
  private extractBasicPatterns(
    messages: ConversationMessage[],
    sessions: ConversationSession[],
    config: PatternExtractionConfig,
  ): ConversationPattern[] {
    // 메시지 내용 기반 간단한 패턴화
    const patternMap = new Map<
      string,
      { count: number; examples: string[]; intents: Set<string>; entities: Map<string, number> }
    >()

    messages.forEach((message) => {
      // 실제 구현에서는 NLP를 사용하여 메시지를 정규화하고 패턴화
      // 여기서는 간단히 메시지 내용을 소문자화하고 불필요한 단어 제거
      const normalizedContent = this.normalizeMessage(message.content)

      // 패턴 추출 (실제 구현에서는 더 복잡한 알고리즘 사용)
      const pattern = this.extractPatternFromMessage(normalizedContent)

      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, {
          count: 0,
          examples: [],
          intents: new Set<string>(),
          entities: new Map<string, number>(),
        })
      }

      const patternData = patternMap.get(pattern)!
      patternData.count++

      // 예시 추가 (최대 5개)
      if (patternData.examples.length < 5) {
        patternData.examples.push(message.content)
      }

      // 인텐트 추가
      if (message.intent) {
        patternData.intents.add(message.intent)
      }

      // 엔티티 추가
      if (config.includeEntities && message.entities) {
        Object.keys(message.entities).forEach((entity) => {
          const currentCount = patternData.entities.get(entity) || 0
          patternData.entities.set(entity, currentCount + 1)
        })
      }
    })

    // 빈도 기준으로 필터링
    const filteredPatterns = Array.from(patternMap.entries())
      .filter(([_, data]) => data.count >= config.minFrequency)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, config.maxPatterns)

    // ConversationPattern 객체로 변환
    return filteredPatterns.map(([pattern, data]) => {
      // 관련 세션 찾기
      const relatedSessions = this.findRelatedSessions(pattern, messages, sessions)

      // 사용자 유형 추출
      const userTypes = this.extractUserTypes(relatedSessions)

      // 엔티티 변환
      const commonEntities: Record<string, number> = {}
      data.entities.forEach((count, entity) => {
        commonEntities[entity] = count
      })

      return {
        id: `pattern_${uuidv4().substring(0, 8)}`,
        pattern,
        frequency: data.count,
        examples: data.examples,
        relatedIntents: Array.from(data.intents),
        userTypes,
        commonEntities,
        averageSentimentScore: this.calculateAverageSentiment(pattern, messages),
      }
    })
  }

  /**
   * 메시지 정규화
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // 특수문자 제거
      .replace(/\s+/g, " ") // 연속된 공백 제거
      .trim()
  }

  /**
   * 메시지에서 패턴 추출
   */
  private extractPatternFromMessage(message: string): string {
    // 실제 구현에서는 NLP 기법을 사용하여 의미 기반 패턴 추출
    // 여기서는 간단히 핵심 키워드 추출로 대체

    // 불용어 목록 (실제 구현에서는 더 포괄적인 목록 사용)
    const stopWords = [
      "a",
      "an",
      "the",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "to",
      "of",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "for",
      "with",
      "by",
      "about",
      "like",
      "through",
      "over",
      "before",
      "after",
      "between",
      "under",
    ]

    // 전기차 충전 관련 중요 키워드
    const keyTerms = [
      "charge",
      "charging",
      "charger",
      "station",
      "battery",
      "ev",
      "electric",
      "vehicle",
      "power",
      "payment",
      "app",
      "connect",
      "error",
      "problem",
      "issue",
      "location",
      "find",
      "reservation",
      "book",
      "cancel",
      "payment",
      "cost",
      "price",
    ]

    // 단어 분리
    const words = message.split(" ")

    // 불용어 제거 및 중요 키워드 우선 처리
    const filteredWords = words
      .filter((word) => !stopWords.includes(word) || keyTerms.includes(word))
      .sort((a, b) => {
        const aIsKey = keyTerms.includes(a)
        const bIsKey = keyTerms.includes(b)
        if (aIsKey && !bIsKey) return -1
        if (!aIsKey && bIsKey) return 1
        return 0
      })

    // 최대 5개 단어로 패턴 구성
    return filteredWords.slice(0, 5).join(" ")
  }

  /**
   * 패턴과 관련된 세션 찾기
   */
  private findRelatedSessions(
    pattern: string,
    messages: ConversationMessage[],
    sessions: ConversationSession[],
  ): ConversationSession[] {
    // 패턴과 관련된 메시지 찾기
    const relatedMessageIds = messages
      .filter((msg) => this.normalizeMessage(msg.content).includes(pattern))
      .map((msg) => msg.sessionId)

    // 중복 제거
    const uniqueSessionIds = [...new Set(relatedMessageIds)]

    // 관련 세션 찾기
    return sessions.filter((session) => uniqueSessionIds.includes(session.id))
  }

  /**
   * 세션에서 사용자 유형 추출
   */
  private extractUserTypes(sessions: ConversationSession[]): string[] {
    // 실제 구현에서는 사용자 메타데이터나 행동 패턴을 분석하여 유형 분류
    // 여기서는 간단한 휴리스틱 사용

    const userTypes = new Set<string>()

    sessions.forEach((session) => {
      // 메시지 수에 따른 분류
      if (session.messageCount <= 3) {
        userTypes.add("beginner")
      } else if (session.messageCount <= 7) {
        userTypes.add("intermediate")
      } else {
        userTypes.add("expert")
      }

      // 해결 여부에 따른 분류
      if (session.issueResolved && session.resolutionSteps <= 2) {
        userTypes.add("efficient")
      }

      // 상담원 연결 여부에 따른 분류
      if (session.transferredToAgent) {
        userTypes.add("needs_assistance")
      }
    })

    return Array.from(userTypes)
  }

  /**
   * 평균 감정 점수 계산
   */
  private calculateAverageSentiment(pattern: string, messages: ConversationMessage[]): number | undefined {
    const relatedMessages = messages.filter(
      (msg) => this.normalizeMessage(msg.content).includes(pattern) && msg.sentimentScore !== undefined,
    )

    if (relatedMessages.length === 0) {
      return undefined
    }

    const sum = relatedMessages.reduce((acc, msg) => acc + (msg.sentimentScore || 0), 0)
    return sum / relatedMessages.length
  }

  /**
   * 패턴 정제 및 클러스터링
   */
  private refinePatterns(patterns: ConversationPattern[], config: PatternExtractionConfig): ConversationPattern[] {
    // 유사한 패턴 병합
    const mergedPatterns = this.mergeSimilarPatterns(patterns, config.similarityThreshold)

    // 빈도 기준 정렬
    return mergedPatterns.sort((a, b) => b.frequency - a.frequency)
  }

  /**
   * 유사한 패턴 병합
   */
  private mergeSimilarPatterns(patterns: ConversationPattern[], similarityThreshold: number): ConversationPattern[] {
    const result: ConversationPattern[] = []
    const processed = new Set<string>()

    for (let i = 0; i < patterns.length; i++) {
      if (processed.has(patterns[i].id)) continue

      const currentPattern = patterns[i]
      const similarPatterns: ConversationPattern[] = []

      for (let j = i + 1; j < patterns.length; j++) {
        if (processed.has(patterns[j].id)) continue

        const similarity = this.calculatePatternSimilarity(currentPattern.pattern, patterns[j].pattern)
        if (similarity >= similarityThreshold) {
          similarPatterns.push(patterns[j])
          processed.add(patterns[j].id)
        }
      }

      if (similarPatterns.length === 0) {
        result.push(currentPattern)
      } else {
        // 유사 패턴 병합
        const mergedPattern = this.mergePatterns(currentPattern, similarPatterns)
        result.push(mergedPattern)
      }

      processed.add(currentPattern.id)
    }

    return result
  }

  /**
   * 패턴 유사도 계산 (Jaccard 유사도)
   */
  private calculatePatternSimilarity(pattern1: string, pattern2: string): number {
    const words1 = new Set(pattern1.split(" "))
    const words2 = new Set(pattern2.split(" "))

    const intersection = new Set([...words1].filter((word) => words2.has(word)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  /**
   * 패턴 병합
   */
  private mergePatterns(mainPattern: ConversationPattern, similarPatterns: ConversationPattern[]): ConversationPattern {
    // 모든 패턴의 빈도 합산
    const totalFrequency = mainPattern.frequency + similarPatterns.reduce((sum, p) => sum + p.frequency, 0)

    // 예시 병합 (최대 5개)
    const allExamples = [...mainPattern.examples]
    similarPatterns.forEach((p) => allExamples.push(...p.examples))
    const uniqueExamples = [...new Set(allExamples)].slice(0, 5)

    // 인텐트 병합
    const allIntents = new Set([...mainPattern.relatedIntents])
    similarPatterns.forEach((p) => p.relatedIntents.forEach((intent) => allIntents.add(intent)))

    // 사용자 유형 병합
    const allUserTypes = new Set([...mainPattern.userTypes])
    similarPatterns.forEach((p) => p.userTypes.forEach((type) => allUserTypes.add(type)))

    // 엔티티 병합
    const mergedEntities: Record<string, number> = { ...mainPattern.commonEntities }
    similarPatterns.forEach((p) => {
      Object.entries(p.commonEntities).forEach(([entity, count]) => {
        mergedEntities[entity] = (mergedEntities[entity] || 0) + count
      })
    })

    // 감정 점수 계산
    const patternWithSentiment = [mainPattern, ...similarPatterns].filter((p) => p.averageSentimentScore !== undefined)
    let averageSentimentScore: number | undefined

    if (patternWithSentiment.length > 0) {
      const weightedSum = patternWithSentiment.reduce((sum, p) => sum + (p.averageSentimentScore || 0) * p.frequency, 0)
      const totalFrequencyWithSentiment = patternWithSentiment.reduce((sum, p) => sum + p.frequency, 0)
      averageSentimentScore = weightedSum / totalFrequencyWithSentiment
    }

    return {
      id: mainPattern.id, // 주 패턴의 ID 유지
      pattern: mainPattern.pattern, // 주 패턴의 패턴 유지
      frequency: totalFrequency,
      examples: uniqueExamples,
      relatedIntents: Array.from(allIntents),
      userTypes: Array.from(allUserTypes),
      commonEntities: mergedEntities,
      averageSentimentScore,
    }
  }

  /**
   * 패턴 클러스터링
   */
  public async clusterPatterns(patterns: ConversationPattern[]): Promise<ConversationCluster[]> {
    try {
      // 간단한 클러스터링 구현 (실제 구현에서는 K-means 등 사용)
      const clusters: ConversationCluster[] = []

      // 인텐트 기반 클러스터링
      const intentGroups = this.groupPatternsByIntent(patterns)

      // 각 인텐트 그룹을 클러스터로 변환
      Object.entries(intentGroups).forEach(([intent, groupPatterns]) => {
        // 그룹 내 가장 빈도가 높은 패턴을 중심 패턴으로 선택
        const sortedPatterns = [...groupPatterns].sort((a, b) => b.frequency - a.frequency)
        const centralPattern = sortedPatterns[0].pattern

        // 관련 세션 찾기
        const relatedSessions = this.findRelatedSessionsForPatterns(groupPatterns)

        // 해결률 계산
        const resolutionRate = this.calculateResolutionRate(relatedSessions)

        // 만족도 계산
        const satisfactionScore = this.calculateAverageSatisfaction(relatedSessions)

        // 일반적인 이슈 타입 추출
        const commonIssueTypes = this.extractCommonIssueTypes(relatedSessions)

        clusters.push({
          id: `cluster_${uuidv4().substring(0, 8)}`,
          name: intent, // 인텐트를 클러스터 이름으로 사용
          size: groupPatterns.length,
          centralPattern,
          patterns: groupPatterns,
          averageSatisfactionScore: satisfactionScore,
          commonIssueTypes,
          resolutionRate,
        })
      })

      return clusters
    } catch (error) {
      console.error("패턴 클러스터링 오류:", error)
      throw new Error(
        `패턴 클러스터링 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * 인텐트별 패턴 그룹화
   */
  private groupPatternsByIntent(patterns: ConversationPattern[]): Record<string, ConversationPattern[]> {
    const groups: Record<string, ConversationPattern[]> = {}

    patterns.forEach((pattern) => {
      // 인텐트가 없는 경우 "unknown" 그룹에 추가
      if (pattern.relatedIntents.length === 0) {
        if (!groups["unknown"]) {
          groups["unknown"] = []
        }
        groups["unknown"].push(pattern)
        return
      }

      // 각 인텐트에 패턴 추가
      pattern.relatedIntents.forEach((intent) => {
        if (!groups[intent]) {
          groups[intent] = []
        }
        groups[intent].push(pattern)
      })
    })

    return groups
  }

  /**
   * 패턴 그룹과 관련된 세션 찾기
   */
  private findRelatedSessionsForPatterns(patterns: ConversationPattern[]): ConversationSession[] {
    // 모든 세션 가져오기
    const allSessions = conversationAnalyticsService.getSessions()

    // 모든 메시지 가져오기
    const allMessages: ConversationMessage[] = []
    allSessions.forEach((session) => {
      const sessionMessages = conversationAnalyticsService.getMessagesBySessionId(session.id)
      allMessages.push(...sessionMessages)
    })

    // 패턴과 관련된 세션 ID 수집
    const relatedSessionIds = new Set<string>()

    patterns.forEach((pattern) => {
      allMessages
        .filter((msg) => this.normalizeMessage(msg.content).includes(pattern.pattern))
        .forEach((msg) => relatedSessionIds.add(msg.sessionId))
    })

    // 관련 세션 반환
    return allSessions.filter((session) => relatedSessionIds.has(session.id))
  }

  /**
   * 해결률 계산
   */
  private calculateResolutionRate(sessions: ConversationSession[]): number {
    if (sessions.length === 0) return 0

    const resolvedCount = sessions.filter((session) => session.issueResolved).length
    return resolvedCount / sessions.length
  }

  /**
   * 평균 만족도 계산
   */
  private calculateAverageSatisfaction(sessions: ConversationSession[]): number | undefined {
    const sessionsWithSatisfaction = sessions.filter((session) => session.userSatisfaction !== undefined)

    if (sessionsWithSatisfaction.length === 0) {
      return undefined
    }

    const sum = sessionsWithSatisfaction.reduce((acc, session) => acc + (session.userSatisfaction || 0), 0)
    return sum / sessionsWithSatisfaction.length
  }

  /**
   * 일반적인 이슈 타입 추출
   */
  private extractCommonIssueTypes(sessions: ConversationSession[]): string[] {
    if (sessions.length === 0) return []

    // 이슈 타입별 카운트
    const issueTypeCounts: Record<string, number> = {}

    sessions.forEach((session) => {
      issueTypeCounts[session.issueType] = (issueTypeCounts[session.issueType] || 0) + 1
    })

    // 빈도 기준 정렬 및 상위 3개 반환
    return Object.entries(issueTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issueType]) => issueType)
  }

  /**
   * 대화 데이터 인사이트 생성
   */
  public async generateInsights(
    patterns: ConversationPattern[],
    clusters: ConversationCluster[],
  ): Promise<ConversationInsight[]> {
    try {
      const insights: ConversationInsight[] = []

      // 패턴 기반 인사이트
      this.generatePatternBasedInsights(patterns, clusters).forEach((insight) => insights.push(insight))

      // 클러스터 기반 인사이트
      this.generateClusterBasedInsights(clusters).forEach((insight) => insights.push(insight))

      // 트렌드 기반 인사이트
      this.generateTrendBasedInsights(patterns).forEach((insight) => insights.push(insight))

      // 중요도 기준 정렬
      return insights.sort((a, b) => b.importance - a.importance)
    } catch (error) {
      console.error("인사이트 생성 오류:", error)
      throw new Error(`인사이트 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 패턴 기반 인사이트 생성
   */
  private generatePatternBasedInsights(
    patterns: ConversationPattern[],
    clusters: ConversationCluster[],
  ): ConversationInsight[] {
    const insights: ConversationInsight[] = []

    // 높은 빈도의 패턴 인사이트
    const highFrequencyPatterns = patterns
      .filter((p) => p.frequency > 10)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)

    highFrequencyPatterns.forEach((pattern) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "pattern",
        description: `자주 발생하는 패턴: "${pattern.pattern}" (${pattern.frequency}회)`,
        importance: Math.min(8, 5 + Math.floor(pattern.frequency / 20)),
        relatedPatterns: [pattern.id],
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    // 부정적 감정 패턴 인사이트
    const negativePatterns = patterns
      .filter((p) => p.averageSentimentScore !== undefined && p.averageSentimentScore < -0.3)
      .sort((a, b) => (a.averageSentimentScore || 0) - (b.averageSentimentScore || 0))
      .slice(0, 3)

    negativePatterns.forEach((pattern) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "pattern",
        description: `부정적 감정 패턴: "${pattern.pattern}" (감정 점수: ${pattern.averageSentimentScore?.toFixed(2)})`,
        importance: 9,
        relatedPatterns: [pattern.id],
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    // 클러스터에 속하지 않는 패턴 인사이트 (이상치)
    const clusterPatternIds = new Set<string>()
    clusters.forEach((cluster) => {
      cluster.patterns.forEach((p) => clusterPatternIds.add(p.id))
    })

    const outlierPatterns = patterns.filter((p) => !clusterPatternIds.has(p.id) && p.frequency > 5).slice(0, 3)

    outlierPatterns.forEach((pattern) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "anomaly",
        description: `분류되지 않은 중요 패턴: "${pattern.pattern}" (${pattern.frequency}회)`,
        importance: 7,
        relatedPatterns: [pattern.id],
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    return insights
  }

  /**
   * 클러스터 기반 인사이트 생성
   */
  private generateClusterBasedInsights(clusters: ConversationCluster[]): ConversationInsight[] {
    const insights: ConversationInsight[] = []

    // 낮은 해결률 클러스터 인사이트
    const lowResolutionClusters = clusters
      .filter((c) => c.resolutionRate < 0.6 && c.patterns.length > 3)
      .sort((a, b) => a.resolutionRate - b.resolutionRate)
      .slice(0, 3)

    lowResolutionClusters.forEach((cluster) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "suggestion",
        description: `낮은 해결률 클러스터: "${cluster.name}" (해결률: ${(cluster.resolutionRate * 100).toFixed(1)}%)`,
        importance: 10,
        relatedPatterns: cluster.patterns.map((p) => p.id),
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    // 낮은 만족도 클러스터 인사이트
    const lowSatisfactionClusters = clusters
      .filter((c) => c.averageSatisfactionScore !== undefined && c.averageSatisfactionScore < 3.5)
      .sort((a, b) => (a.averageSatisfactionScore || 0) - (b.averageSatisfactionScore || 0))
      .slice(0, 3)

    lowSatisfactionClusters.forEach((cluster) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "suggestion",
        description: `낮은 만족도 클러스터: "${cluster.name}" (만족도: ${cluster.averageSatisfactionScore?.toFixed(1)}/5)`,
        importance: 9,
        relatedPatterns: cluster.patterns.map((p) => p.id),
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    // 큰 클러스터 인사이트
    const largeClusters = clusters
      .filter((c) => c.patterns.length > 5)
      .sort((a, b) => b.patterns.length - a.patterns.length)
      .slice(0, 3)

    largeClusters.forEach((cluster) => {
      insights.push({
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "pattern",
        description: `주요 대화 클러스터: "${cluster.name}" (${cluster.patterns.length}개 패턴)`,
        importance: 6,
        relatedPatterns: cluster.patterns.map((p) => p.id),
        detectedAt: new Date().toISOString(),
        status: "new",
      })
    })

    return insights
  }

  /**
   * 트렌드 기반 인사이트 생성
   */
  private generateTrendBasedInsights(patterns: ConversationPattern[]): ConversationInsight[] {
    // 실제 구현에서는 시간에 따른 패턴 변화 분석
    // 여기서는 간단한 더미 인사이트 생성

    return [
      {
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "trend",
        description: "최근 충전 속도 관련 문의가 20% 증가했습니다.",
        importance: 8,
        relatedPatterns: patterns
          .filter((p) => p.pattern.includes("speed") || p.pattern.includes("slow") || p.pattern.includes("fast"))
          .map((p) => p.id),
        detectedAt: new Date().toISOString(),
        status: "new",
      },
      {
        id: `insight_${uuidv4().substring(0, 8)}`,
        type: "trend",
        description: "앱 연결 문제 관련 문의가 15% 감소했습니다.",
        importance: 6,
        relatedPatterns: patterns
          .filter((p) => p.pattern.includes("app") || p.pattern.includes("connect") || p.pattern.includes("connection"))
          .map((p) => p.id),
        detectedAt: new Date().toISOString(),
        status: "new",
      },
    ]
  }

  /**
   * 대화 데이터 요약 생성
   */
  public async generateDataSummary(
    patterns: ConversationPattern[],
    clusters: ConversationCluster[],
    insights: ConversationInsight[],
  ): Promise<ConversationDataSummary> {
    try {
      // 모든 세션 및 메시지 수 계산
      const allSessions = conversationAnalyticsService.getSessions()

      let totalMessages = 0
      allSessions.forEach((session) => {
        totalMessages += conversationAnalyticsService.getMessagesBySessionId(session.id).length
      })

      // 패턴 분포 계산
      const patternDistribution: Record<string, number> = {}
      clusters.forEach((cluster) => {
        patternDistribution[cluster.name] = cluster.patterns.reduce((sum, p) => sum + p.frequency, 0)
      })

      // 데이터 품질 점수 계산 (간단한 휴리스틱)
      const dataQualityScore = this.calculateDataQualityScore(patterns, clusters, allSessions)

      return {
        totalSessions: allSessions.length,
        totalMessages,
        uniquePatterns: patterns.length,
        topClusters: clusters.sort((a, b) => b.patterns.length - a.patterns.length).slice(0, 5),
        recentInsights: insights.sort((a, b) => b.importance - a.importance).slice(0, 5),
        patternDistribution,
        dataQualityScore,
      }
    } catch (error) {
      console.error("데이터 요약 생성 오류:", error)
      throw new Error(
        `데이터 요약 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * 데이터 품질 점수 계산
   */
  private calculateDataQualityScore(
    patterns: ConversationPattern[],
    clusters: ConversationCluster[],
    sessions: ConversationSession[],
  ): number {
    // 다양한 지표를 기반으로 품질 점수 계산 (0-100)
    let score = 0

    // 1. 데이터 양 (최대 20점)
    const sessionCountScore = Math.min(20, Math.floor(sessions.length / 10))
    score += sessionCountScore

    // 2. 패턴 다양성 (최대 20점)
    const patternDiversityScore = Math.min(20, Math.floor(patterns.length / 5))
    score += patternDiversityScore

    // 3. 클러스터 품질 (최대 20점)
    const clusterQualityScore = Math.min(20, Math.floor(clusters.length * 2))
    score += clusterQualityScore

    // 4. 해결률 (최대 20점)
    const averageResolutionRate =
      sessions.length > 0 ? sessions.filter((s) => s.issueResolved).length / sessions.length : 0
    const resolutionScore = Math.floor(averageResolutionRate * 20)
    score += resolutionScore

    // 5. 만족도 데이터 (최대 20점)
    const sessionsWithSatisfaction = sessions.filter((s) => s.userSatisfaction !== undefined)
    const satisfactionCoverageRate = sessions.length > 0 ? sessionsWithSatisfaction.length / sessions.length : 0
    const satisfactionScore = Math.floor(satisfactionCoverageRate * 20)
    score += satisfactionScore

    return score
  }
}

export const conversationDataProcessor = ConversationDataProcessor.getInstance()
