import type {
  Feedback,
  FeedbackAnalysis,
  FeedbackBasedSuggestion,
  FeedbackFilterOptions,
  SentimentType,
  TextFeedback,
  RatingFeedback,
  SuggestionFeedback,
  ChoiceFeedback,
  FeedbackCategory,
} from "@/types/feedback"
import { diagnosticsService } from "./diagnostics-service"
import { treeOptimizerService } from "./tree-optimizer-service"
import type { TroubleshootingNode } from "@/types/troubleshooting"

export class FeedbackAnalysisService {
  private static instance: FeedbackAnalysisService
  private feedbackData: Feedback[] = []

  private constructor() {
    // 개발용 더미 데이터 생성
    this.generateDummyFeedback()
  }

  public static getInstance(): FeedbackAnalysisService {
    if (!FeedbackAnalysisService.instance) {
      FeedbackAnalysisService.instance = new FeedbackAnalysisService()
    }
    return FeedbackAnalysisService.instance
  }

  // 피드백 저장
  public saveFeedback(feedback: Omit<Feedback, "id" | "timestamp">): Feedback {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    }

    this.feedbackData.push(newFeedback)
    return newFeedback
  }

  // 피드백 조회
  public getFeedback(id: string): Feedback | null {
    return this.feedbackData.find((f) => f.id === id) || null
  }

  // 피드백 목록 조회 (필터링 지원)
  public getFeedbackList(filters?: FeedbackFilterOptions): Feedback[] {
    if (!filters) return [...this.feedbackData]

    return this.feedbackData.filter((feedback) => {
      // 날짜 범위 필터
      if (filters.dateRange) {
        if (feedback.timestamp < filters.dateRange.start || feedback.timestamp > filters.dateRange.end) {
          return false
        }
      }

      // 피드백 유형 필터
      if (filters.feedbackTypes?.length && !filters.feedbackTypes.includes(feedback.type)) {
        return false
      }

      // 감정 필터
      if (filters.sentiments?.length) {
        if (
          feedback.type === "text" ||
          feedback.type === "suggestion" ||
          (feedback.type === "rating" && feedback.rating)
        ) {
          const sentiment = this.getSentimentFromFeedback(feedback)
          if (!filters.sentiments.includes(sentiment)) {
            return false
          }
        }
      }

      // 카테고리 필터
      if (filters.categories?.length && feedback.category && !filters.categories.includes(feedback.category)) {
        return false
      }

      // 평점 범위 필터
      if (feedback.type === "rating") {
        if (filters.minRating !== undefined && feedback.rating < filters.minRating) {
          return false
        }
        if (filters.maxRating !== undefined && feedback.rating > filters.maxRating) {
          return false
        }
      }

      // 노드 ID 필터
      if (filters.nodeIds?.length && feedback.nodeId && !filters.nodeIds.includes(feedback.nodeId)) {
        return false
      }

      // 키워드 필터
      if (filters.keywords?.length) {
        if (feedback.type === "text") {
          const hasKeyword = filters.keywords.some((keyword) =>
            feedback.text.toLowerCase().includes(keyword.toLowerCase()),
          )
          if (!hasKeyword) {
            return false
          }
        } else if (feedback.type === "suggestion") {
          const hasKeyword = filters.keywords.some((keyword) =>
            feedback.suggestion.toLowerCase().includes(keyword.toLowerCase()),
          )
          if (!hasKeyword) {
            return false
          }
        } else if (feedback.type === "choice") {
          const hasKeyword = filters.keywords.some(
            (keyword) =>
              feedback.question.toLowerCase().includes(keyword.toLowerCase()) ||
              feedback.selectedOption.toLowerCase().includes(keyword.toLowerCase()),
          )
          if (!hasKeyword) {
            return false
          }
        }
      }

      // 텍스트 포함 여부 필터
      if (filters.hasText) {
        if (feedback.type === "rating" || (feedback.type === "choice" && !feedback.selectedOption)) {
          return false
        }
      }

      return true
    })
  }

  // 노드별 피드백 분석
  public analyzeNodeFeedback(nodeId: string, filters?: FeedbackFilterOptions): FeedbackAnalysis {
    // 노드에 대한 피드백 필터링
    const nodeFeedback = this.getFeedbackList({
      ...filters,
      nodeIds: [nodeId],
    })

    // 기본 분석 결과 초기화
    const analysis: FeedbackAnalysis = {
      nodeId,
      feedbackCount: nodeFeedback.length,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      categoryDistribution: {
        usability: 0,
        accuracy: 0,
        speed: 0,
        clarity: 0,
        completeness: 0,
        relevance: 0,
        other: 0,
      },
      commonKeywords: [],
      trends: [],
      suggestions: [],
    }

    // 피드백이 없는 경우 빈 분석 결과 반환
    if (nodeFeedback.length === 0) {
      return analysis
    }

    // 평점 평균 계산
    const ratings = nodeFeedback
      .filter((f): f is Feedback & { type: "rating"; rating: number } => f.type === "rating")
      .map((f) => f.rating)

    if (ratings.length > 0) {
      analysis.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    }

    // 감정 분포 계산
    nodeFeedback.forEach((feedback) => {
      const sentiment = this.getSentimentFromFeedback(feedback)
      analysis.sentimentDistribution[sentiment]++
    })

    // 카테고리 분포 계산
    nodeFeedback.forEach((feedback) => {
      if (feedback.category) {
        analysis.categoryDistribution[feedback.category]++
      } else {
        analysis.categoryDistribution.other++
      }
    })

    // 키워드 추출 및 분석
    const keywordMap = new Map<
      string,
      {
        count: number
        sentiments: Record<SentimentType, number>
      }
    >()

    nodeFeedback.forEach((feedback) => {
      let keywords: string[] = []
      let sentiment: SentimentType = "neutral"

      if (feedback.type === "text" && feedback.keywords) {
        keywords = feedback.keywords
        sentiment = feedback.sentiment || "neutral"
      } else if (feedback.type === "suggestion" && feedback.keywords) {
        keywords = feedback.keywords
        sentiment = feedback.sentiment || "neutral"
      }

      keywords.forEach((keyword) => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            count: 0,
            sentiments: { positive: 0, neutral: 0, negative: 0 },
          })
        }

        const keywordData = keywordMap.get(keyword)!
        keywordData.count++
        keywordData.sentiments[sentiment]++
      })
    })

    // 가장 흔한 키워드 추출
    analysis.commonKeywords = Array.from(keywordMap.entries())
      .map(([keyword, data]) => {
        // 가장 많은 감정 결정
        let dominantSentiment: SentimentType = "neutral"
        let maxCount = 0

        Object.entries(data.sentiments).forEach(([sentiment, count]) => {
          if (count > maxCount) {
            maxCount = count
            dominantSentiment = sentiment as SentimentType
          }
        })

        return {
          keyword,
          count: data.count,
          sentiment: dominantSentiment,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 시간별 트렌드 분석
    const dateMap = new Map<
      string,
      {
        ratings: number[]
        count: number
      }
    >()

    nodeFeedback.forEach((feedback) => {
      const dateKey = feedback.timestamp.toISOString().split("T")[0] // YYYY-MM-DD

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          ratings: [],
          count: 0,
        })
      }

      const dateData = dateMap.get(dateKey)!
      dateData.count++

      if (feedback.type === "rating") {
        dateData.ratings.push(feedback.rating)
      }
    })

    analysis.trends = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        feedbackCount: data.count,
        averageRating:
          data.ratings.length > 0 ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 제안 수집
    analysis.suggestions = nodeFeedback
      .filter((f): f is Feedback & { type: "suggestion"; suggestion: string } => f.type === "suggestion")
      .map((f) => ({
        text: f.suggestion,
        sentiment: f.sentiment || "neutral",
        timestamp: f.timestamp,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return analysis
  }

  // 피드백 기반 최적화 제안 생성
  public generateFeedbackBasedSuggestions(filters?: FeedbackFilterOptions): FeedbackBasedSuggestion[] {
    const suggestions: FeedbackBasedSuggestion[] = []
    const currentTree = treeOptimizerService.getCurrentTree()

    // 모든 노드에 대한 피드백 분석
    const nodeAnalysisMap = new Map<string, FeedbackAnalysis>()

    // 현재 트리의 모든 노드 ID 수집
    const nodeIds = this.collectNodeIds(currentTree)

    // 각 노드에 대한 피드백 분석
    nodeIds.forEach((nodeId) => {
      const analysis = this.analyzeNodeFeedback(nodeId, filters)
      if (analysis.feedbackCount > 0) {
        nodeAnalysisMap.set(nodeId, analysis)
      }
    })

    // 1. 낮은 평점을 가진 노드 개선 제안
    nodeAnalysisMap.forEach((analysis, nodeId) => {
      if (analysis.averageRating < 3 && analysis.feedbackCount >= 5) {
        const node = this.findNodeById(currentTree, nodeId)
        if (!node) return

        // 부정적 피드백 수집
        const negativeFeedback = this.getFeedbackList({
          ...filters,
          nodeIds: [nodeId],
          sentiments: ["negative"],
        })

        // 가장 흔한 부정적 키워드 기반 개선 제안
        const negativeKeywords = analysis.commonKeywords.filter((k) => k.sentiment === "negative")

        if (negativeKeywords.length > 0) {
          suggestions.push({
            nodeId,
            type: "modify",
            confidence: 0.7,
            impact: "high",
            description: `"${node.title}" 노드의 내용 개선 필요`,
            reasoning: `이 노드는 평균 평점 ${analysis.averageRating.toFixed(1)}점(5점 만점)으로, 주로 "${
              negativeKeywords[0].keyword
            }" 관련 부정적 피드백이 있습니다.`,
            supportingFeedback: negativeFeedback.slice(0, 3).map((f) => ({
              id: f.id,
              type: f.type,
              summary: this.getSummaryFromFeedback(f),
              sentiment: this.getSentimentFromFeedback(f),
            })),
          })
        }
      }
    })

    // 2. 혼란스러운 선택지가 있는 노드 개선 제안
    nodeAnalysisMap.forEach((analysis, nodeId) => {
      const clarityIssues = analysis.commonKeywords.filter(
        (k) => k.sentiment === "negative" && ["혼란", "이해", "명확", "모호"].some((term) => k.keyword.includes(term)),
      )

      if (clarityIssues.length > 0 && analysis.feedbackCount >= 3) {
        const node = this.findNodeById(currentTree, nodeId)
        if (!node) return

        // 명확성 관련 피드백 수집
        const clarityFeedback = this.getFeedbackList({
          ...filters,
          nodeIds: [nodeId],
          categories: ["clarity"],
        })

        suggestions.push({
          nodeId,
          type: "modify",
          confidence: 0.8,
          impact: "medium",
          description: `"${node.title}" 노드의 선택지 명확성 개선 필요`,
          reasoning: `이 노드에서 사용자들이 선택지나 설명이 명확하지 않다는 피드백을 제공했습니다. 주요 키워드: ${clarityIssues
            .map((k) => k.keyword)
            .join(", ")}`,
          supportingFeedback: clarityFeedback.slice(0, 3).map((f) => ({
            id: f.id,
            type: f.type,
            summary: this.getSummaryFromFeedback(f),
            sentiment: this.getSentimentFromFeedback(f),
          })),
        })
      }
    })

    // 3. 자주 건너뛰는 노드 재정렬 제안
    const sessionData = diagnosticsService.getSessions()
    const nodeSkipRates = new Map<string, number>()

    // 노드 건너뛰기 비율 계산
    sessionData.forEach((session) => {
      const steps = diagnosticsService.getSessionSteps(session.id)
      if (steps.length < 2) return

      for (let i = 0; i < steps.length - 1; i++) {
        const currentNodeId = steps[i].nodeId
        const nextNodeId = steps[i + 1].nodeId

        // 다음 단계로 빠르게 넘어간 경우 (3초 미만)
        if (steps[i + 1].timestamp.getTime() - steps[i].timestamp.getTime() < 3000) {
          if (!nodeSkipRates.has(currentNodeId)) {
            nodeSkipRates.set(currentNodeId, 0)
          }
          nodeSkipRates.set(currentNodeId, nodeSkipRates.get(currentNodeId)! + 1)
        }
      }
    })

    // 높은 건너뛰기 비율을 가진 노드 식별
    nodeSkipRates.forEach((skipCount, nodeId) => {
      const analysis = nodeAnalysisMap.get(nodeId)
      if (!analysis) return

      const totalVisits = sessionData.filter((s) =>
        diagnosticsService.getSessionSteps(s.id).some((step) => step.nodeId === nodeId),
      ).length
      const skipRate = skipCount / totalVisits

      if (skipRate > 0.5 && totalVisits >= 10) {
        const node = this.findNodeById(currentTree, nodeId)
        if (!node) return

        suggestions.push({
          nodeId,
          type: "reorder",
          confidence: 0.6,
          impact: "medium",
          description: `"${node.title}" 노드 위치 재고려 필요`,
          reasoning: `이 노드는 사용자의 ${Math.round(skipRate * 100)}%가 빠르게 건너뛰고 있습니다. 진단 흐름에서 위치 조정이 필요할 수 있습니다.`,
          supportingFeedback: [],
        })
      }
    })

    // 4. 사용자 제안 기반 새 노드 추가 제안
    const allSuggestionFeedback = this.getFeedbackList({
      ...filters,
      feedbackTypes: ["suggestion"],
      sentiments: ["positive"],
    })

    // 제안 텍스트에서 공통 패턴 찾기
    const suggestionPatterns = new Map<string, number>()
    allSuggestionFeedback.forEach((feedback) => {
      if (feedback.type !== "suggestion") return

      // 간단한 패턴 매칭 (실제로는 더 복잡한 NLP가 필요)
      const patterns = ["추가", "새로운", "옵션", "선택지", "기능", "단계", "질문", "정보", "설명", "예시"]

      patterns.forEach((pattern) => {
        if (feedback.suggestion.includes(pattern)) {
          const key = pattern
          suggestionPatterns.set(key, (suggestionPatterns.get(key) || 0) + 1)
        }
      })
    })

    // 가장 많이 요청된 패턴에 대한 제안 생성
    const topPatterns = Array.from(suggestionPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    topPatterns.forEach(([pattern, count]) => {
      if (count >= 3) {
        // 관련 제안 피드백 찾기
        const relatedFeedback = allSuggestionFeedback.filter(
          (f) => f.type === "suggestion" && f.suggestion.includes(pattern),
        )

        suggestions.push({
          nodeId: "root", // 루트 노드에 추가
          type: "add",
          confidence: 0.5,
          impact: "medium",
          description: `"${pattern}" 관련 새 노드 추가 고려`,
          reasoning: `${count}명의 사용자가 "${pattern}" 관련 기능이나 정보를 요청했습니다.`,
          supportingFeedback: relatedFeedback.slice(0, 3).map((f) => ({
            id: f.id,
            type: f.type,
            summary: this.getSummaryFromFeedback(f),
            sentiment: this.getSentimentFromFeedback(f),
          })),
        })
      }
    })

    // 5. 감정 분석 기반 노드 병합 제안
    const nodeSequences = new Map<string, { count: number; positiveRate: number }>()

    // 자주 함께 나타나는 노드 시퀀스 분석
    sessionData.forEach((session) => {
      const steps = diagnosticsService.getSessionSteps(session.id)
      if (steps.length < 2) return

      for (let i = 0; i < steps.length - 1; i++) {
        const sequence = `${steps[i].nodeId},${steps[i + 1].nodeId}`

        if (!nodeSequences.has(sequence)) {
          nodeSequences.set(sequence, { count: 0, positiveRate: 0 })
        }

        const data = nodeSequences.get(sequence)!
        data.count++

        // 긍정적 피드백이 있는지 확인
        const hasFeedback = this.feedbackData.some(
          (f) =>
            f.sessionId === session.id &&
            (f.nodeId === steps[i].nodeId || f.nodeId === steps[i + 1].nodeId) &&
            this.getSentimentFromFeedback(f) === "positive",
        )

        if (hasFeedback) {
          data.positiveRate = (data.positiveRate * (data.count - 1) + 1) / data.count
        } else {
          data.positiveRate = (data.positiveRate * (data.count - 1)) / data.count
        }
      }
    })

    // 자주 나타나고 긍정적 피드백이 낮은 시퀀스 식별
    Array.from(nodeSequences.entries())
      .filter(([_, data]) => data.count >= 10 && data.positiveRate < 0.3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([sequence, data]) => {
        const [nodeId1, nodeId2] = sequence.split(",")
        const node1 = this.findNodeById(currentTree, nodeId1)
        const node2 = this.findNodeById(currentTree, nodeId2)

        if (!node1 || !node2) return

        suggestions.push({
          nodeId: nodeId1,
          type: "merge",
          confidence: 0.6,
          impact: "medium",
          description: `"${node1.title}"와 "${node2.title}" 노드 병합 고려`,
          reasoning: `이 두 노드는 함께 ${data.count}번 나타났으며, 긍정적 피드백 비율이 ${Math.round(data.positiveRate * 100)}%로 낮습니다. 병합하여 사용자 경험을 개선할 수 있습니다.`,
          supportingFeedback: [],
        })
      })

    return suggestions
  }

  // 피드백에서 감정 추출
  private getSentimentFromFeedback(feedback: Feedback): SentimentType {
    if (feedback.type === "text" || feedback.type === "suggestion") {
      return feedback.sentiment || "neutral"
    } else if (feedback.type === "rating") {
      if (feedback.rating >= 4) return "positive"
      if (feedback.rating <= 2) return "negative"
      return "neutral"
    }
    return "neutral"
  }

  // 피드백에서 요약 추출
  private getSummaryFromFeedback(feedback: Feedback): string {
    switch (feedback.type) {
      case "rating":
        return `평점: ${feedback.rating}/5`
      case "text":
        return feedback.text.length > 50 ? `${feedback.text.substring(0, 50)}...` : feedback.text
      case "choice":
        return `${feedback.question}: ${feedback.selectedOption}`
      case "suggestion":
        return feedback.suggestion.length > 50 ? `${feedback.suggestion.substring(0, 50)}...` : feedback.suggestion
    }
  }

  // 트리에서 모든 노드 ID 수집
  private collectNodeIds(tree: TroubleshootingNode[]): string[] {
    const ids: string[] = []

    const collectIds = (nodes: TroubleshootingNode[]) => {
      nodes.forEach((node) => {
        ids.push(node.id)
        if (node.children) {
          collectIds(node.children)
        }
      })
    }

    collectIds(tree)
    return ids
  }

  // 트리에서 노드 찾기
  private findNodeById(tree: TroubleshootingNode[], nodeId: string): TroubleshootingNode | null {
    for (const node of tree) {
      if (node.id === nodeId) return node
      if (node.children) {
        const found = this.findNodeById(node.children, nodeId)
        if (found) return found
      }
    }
    return null
  }

  // 텍스트에서 키워드 추출 (간단한 구현)
  private extractKeywords(text: string): string[] {
    // 실제 구현에서는 NLP 라이브러리 사용 권장
    const stopWords = [
      "이",
      "그",
      "저",
      "것",
      "수",
      "를",
      "에",
      "은",
      "는",
      "이",
      "가",
      "와",
      "과",
      "으로",
      "로",
      "을",
      "를",
    ]

    // 텍스트 정제 및 토큰화
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.includes(word))

    // 빈도 계산
    const frequency: Record<string, number> = {}
    tokens.forEach((token) => {
      frequency[token] = (frequency[token] || 0) + 1
    })

    // 빈도 기준 상위 키워드 반환
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
  }

  // 텍스트 감정 분석 (간단한 구현)
  private analyzeSentiment(text: string): SentimentType {
    // 실제 구현에서는 NLP 라이브러리 사용 권장
    const positiveWords = ["좋", "만족", "도움", "감사", "편리", "쉽", "빠르", "정확", "유용", "추천"]
    const negativeWords = ["나쁨", "불만", "어려움", "복잡", "느림", "오류", "문제", "불편", "혼란", "실패"]

    let positiveScore = 0
    let negativeScore = 0

    positiveWords.forEach((word) => {
      if (text.includes(word)) positiveScore++
    })

    negativeWords.forEach((word) => {
      if (text.includes(word)) negativeScore++
    })

    if (positiveScore > negativeScore) return "positive"
    if (negativeScore > positiveScore) return "negative"
    return "neutral"
  }

  // 개발용 더미 피드백 생성
  private generateDummyFeedback() {
    const sessionIds = Array.from({ length: 20 }, (_, i) => `session_${i}`)
    const nodeIds = [
      "charging_issue",
      "payment_issue",
      "app_issue",
      "cable_connection_issue",
      "station_power_issue",
      "vehicle_battery_issue",
      "payment_method_issue",
      "app_connection_issue",
      "account_issue",
    ]

    const ratingFeedbackTexts = [
      "충전이 너무 느려요",
      "앱 연결이 자주 끊겨요",
      "결제 방법이 너무 복잡해요",
      "진단이 정확해서 좋았어요",
      "설명이 명확하지 않아요",
      "해결책이 도움이 되었어요",
      "더 많은 옵션이 있으면 좋겠어요",
      "단계가 너무 많아요",
      "문제가 빨리 해결되었어요",
      "사용하기 쉬웠어요",
    ]

    const suggestionTexts = [
      "충전소 위치 정보도 함께 보여주면 좋겠어요",
      "문제 해결 후 체크리스트를 추가해주세요",
      "더 자세한 이미지와 설명이 필요해요",
      "비슷한 문제에 대한 FAQ를 추가해주세요",
      "진단 과정을 더 간소화해주세요",
      "충전기 종류별 문제 해결 방법을 추가해주세요",
      "오류 코드 검색 기능이 있으면 좋겠어요",
      "차량 모델별 특화된 해결책이 필요해요",
      "문제 해결 후 피드백을 남길 수 있게 해주세요",
      "진단 결과를 저장하고 공유할 수 있으면 좋겠어요",
    ]

    const categories: FeedbackCategory[] = ["usability", "accuracy", "speed", "clarity", "completeness", "relevance"]

    // 평점 피드백 생성
    for (let i = 0; i < 100; i++) {
      const sessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)]
      const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
      const rating = 1 + Math.floor(Math.random() * 5)
      const category = categories[Math.floor(Math.random() * categories.length)]

      const feedback: RatingFeedback = {
        id: `dummy_rating_${i}`,
        type: "rating",
        sessionId,
        nodeId,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        rating,
        category,
      }

      this.feedbackData.push(feedback)
    }

    // 텍스트 피드백 생성
    for (let i = 0; i < 50; i++) {
      const sessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)]
      const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
      const text = ratingFeedbackTexts[Math.floor(Math.random() * ratingFeedbackTexts.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]

      const sentiment = this.analyzeSentiment(text)
      const keywords = this.extractKeywords(text)

      const feedback: TextFeedback = {
        id: `dummy_text_${i}`,
        type: "text",
        sessionId,
        nodeId,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        text,
        sentiment,
        keywords,
        category,
      }

      this.feedbackData.push(feedback)
    }

    // 제안 피드백 생성
    for (let i = 0; i < 30; i++) {
      const sessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)]
      const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
      const suggestion = suggestionTexts[Math.floor(Math.random() * suggestionTexts.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]

      const sentiment = this.analyzeSentiment(suggestion)
      const keywords = this.extractKeywords(suggestion)

      const feedback: SuggestionFeedback = {
        id: `dummy_suggestion_${i}`,
        type: "suggestion",
        sessionId,
        nodeId,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        suggestion,
        sentiment,
        keywords,
        category,
      }

      this.feedbackData.push(feedback)
    }

    // 선택형 피드백 생성
    const choiceQuestions = [
      "어떤 부분이 가장 도움이 되었나요?",
      "어떤 정보가 부족했나요?",
      "다음 중 개선이 필요한 부분은?",
      "이 해결책을 다른 사람에게 추천하시겠어요?",
    ]

    const choiceOptions = [
      ["상세한 설명", "시각적 가이드", "단계별 안내", "문제 진단"],
      ["기술적 세부사항", "이미지/다이어그램", "문제 원인 설명", "해결 단계"],
      ["사용자 인터페이스", "정보의 정확성", "진단 속도", "해결책 품질"],
      ["예, 매우 추천", "아마도", "잘 모르겠음", "아니오"],
    ]

    for (let i = 0; i < 40; i++) {
      const sessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)]
      const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
      const questionIndex = Math.floor(Math.random() * choiceQuestions.length)
      const question = choiceQuestions[questionIndex]
      const options = choiceOptions[questionIndex]
      const selectedOption = options[Math.floor(Math.random() * options.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]

      const feedback: ChoiceFeedback = {
        id: `dummy_choice_${i}`,
        type: "choice",
        sessionId,
        nodeId,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        question,
        options,
        selectedOption,
        category,
      }

      this.feedbackData.push(feedback)
    }
  }
}

// 서비스 인스턴스 내보내기
export const feedbackAnalysisService = FeedbackAnalysisService.getInstance()
