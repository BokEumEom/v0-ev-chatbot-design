import type {
  PromptVariant,
  ResponseAnalysis,
  PromptAnalyticsSummary,
  PromptComparisonResult,
  QualityMetrics,
} from "@/types/analytics"

/**
 * 프롬프트 분석 서비스
 * 프롬프트 변형, 응답 분석 데이터를 관리하고 분석 결과를 제공
 */
export class AnalyticsService {
  private static instance: AnalyticsService

  // 실제 구현에서는 데이터베이스에 저장
  private promptVariants: Map<string, PromptVariant> = new Map()
  private responseAnalyses: ResponseAnalysis[] = []

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * 프롬프트 변형 추가
   */
  public async addPromptVariant(variant: Omit<PromptVariant, "id" | "createdAt">): Promise<PromptVariant> {
    const id = `variant_${Date.now()}`
    const newVariant: PromptVariant = {
      ...variant,
      id,
      createdAt: new Date(),
      isActive: true,
    }

    // 실제 구현에서는 데이터베이스에 저장
    this.promptVariants.set(id, newVariant)

    return newVariant
  }

  /**
   * 프롬프트 변형 목록 조회
   */
  public async getPromptVariants(): Promise<PromptVariant[]> {
    return Array.from(this.promptVariants.values())
  }

  /**
   * 프롬프트 변형 조회
   */
  public async getPromptVariant(id: string): Promise<PromptVariant | null> {
    return this.promptVariants.get(id) || null
  }

  /**
   * 활성 프롬프트 변형 조회
   */
  public async getActivePromptVariant(): Promise<PromptVariant | null> {
    for (const variant of this.promptVariants.values()) {
      if (variant.isActive) {
        return variant
      }
    }
    return null
  }

  /**
   * 프롬프트 변형 활성화
   */
  public async activatePromptVariant(id: string): Promise<boolean> {
    // 모든 변형 비활성화
    for (const variant of this.promptVariants.values()) {
      variant.isActive = false
    }

    // 지정된 변형 활성화
    const variant = this.promptVariants.get(id)
    if (variant) {
      variant.isActive = true
      return true
    }
    return false
  }

  /**
   * 응답 분석 데이터 추가
   */
  public async addResponseAnalysis(analysis: Omit<ResponseAnalysis, "id">): Promise<ResponseAnalysis> {
    const id = `analysis_${Date.now()}`
    const newAnalysis: ResponseAnalysis = {
      ...analysis,
      id,
    }

    // 실제 구현에서는 데이터베이스에 저장
    this.responseAnalyses.push(newAnalysis)

    return newAnalysis
  }

  /**
   * 응답 분석 데이터 조회
   */
  public async getResponseAnalyses(filters?: {
    promptVariantId?: string
    detectedIntent?: string
    startDate?: Date
    endDate?: Date
  }): Promise<ResponseAnalysis[]> {
    let results = this.responseAnalyses

    if (filters) {
      if (filters.promptVariantId) {
        results = results.filter((a) => a.promptVariantId === filters.promptVariantId)
      }
      if (filters.detectedIntent) {
        results = results.filter((a) => a.detectedIntent === filters.detectedIntent)
      }
      if (filters.startDate) {
        results = results.filter((a) => a.performance.timestamp >= filters.startDate)
      }
      if (filters.endDate) {
        results = results.filter((a) => a.performance.timestamp <= filters.endDate)
      }
    }

    return results
  }

  /**
   * 프롬프트 변형에 대한 분석 요약 생성
   */
  public async generateAnalyticsSummary(
    variantId: string,
    timeRange?: { start: Date; end: Date },
  ): Promise<PromptAnalyticsSummary | null> {
    const variant = await this.getPromptVariant(variantId)
    if (!variant) return null

    // 해당 변형의 응답 분석 데이터 필터링
    let analyses = await this.getResponseAnalyses({ promptVariantId: variantId })

    if (timeRange) {
      analyses = analyses.filter(
        (a) => a.performance.timestamp >= timeRange.start && a.performance.timestamp <= timeRange.end,
      )
    }

    if (analyses.length === 0) return null

    // 인텐트 분포 계산
    const intentCounts: Record<string, number> = {}
    for (const analysis of analyses) {
      const intent = analysis.detectedIntent
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    }

    // 품질 점수 평균 계산
    const qualityScores = analyses.filter((a) => a.quality).map((a) => a.quality!.overallScore)

    const averageQualityScore =
      qualityScores.length > 0 ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0

    // 사용자 평가 평균 계산
    const userRatings = analyses.filter((a) => a.userFeedback).map((a) => a.userFeedback!.rating)

    const averageUserRating =
      userRatings.length > 0 ? userRatings.reduce((sum, rating) => sum + rating, 0) / userRatings.length : 0

    // 응답 시간 평균 계산
    const latencies = analyses.map((a) => a.performance.latency)
    const averageLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length

    // 토큰 사용량 평균 계산
    const tokenUsages = analyses.map((a) => a.performance.totalTokens)
    const averageTokenUsage = tokenUsages.reduce((sum, tokens) => sum + tokens, 0) / tokenUsages.length

    // 시간 범위 결정
    const timestamps = analyses.map((a) => a.performance.timestamp)
    const start = new Date(Math.min(...timestamps.map((t) => t.getTime())))
    const end = new Date(Math.max(...timestamps.map((t) => t.getTime())))

    return {
      variantId,
      variantName: variant.name,
      totalInteractions: analyses.length,
      averageQualityScore,
      averageUserRating,
      averageLatency,
      averageTokenUsage,
      intentDistribution: intentCounts,
      timeRange: { start, end },
    }
  }

  /**
   * 두 프롬프트 변형 비교
   */
  public async comparePromptVariants(
    baselineVariantId: string,
    testVariantId: string,
    timeRange?: { start: Date; end: Date },
  ): Promise<PromptComparisonResult | null> {
    const baselineSummary = await this.generateAnalyticsSummary(baselineVariantId, timeRange)
    const testSummary = await this.generateAnalyticsSummary(testVariantId, timeRange)

    if (!baselineSummary || !testSummary) return null

    // 차이 계산 (%)
    const calculateDifference = (test: number, baseline: number): number => {
      if (baseline === 0) return test === 0 ? 0 : 100
      return ((test - baseline) / baseline) * 100
    }

    // 통계적 유의성 계산 (실제 구현에서는 더 정교한 통계 테스트 사용)
    // 여기서는 간단한 예시로 샘플 크기에 기반한 p-value 추정
    const significanceLevel = Math.min(
      0.05,
      1 / Math.sqrt(Math.min(baselineSummary.totalInteractions, testSummary.totalInteractions)),
    )

    return {
      baselineVariantId,
      testVariantId,
      qualityDifference: calculateDifference(testSummary.averageQualityScore, baselineSummary.averageQualityScore),
      latencyDifference: calculateDifference(testSummary.averageLatency, baselineSummary.averageLatency),
      tokenUsageDifference: calculateDifference(testSummary.averageTokenUsage, baselineSummary.averageTokenUsage),
      userRatingDifference: calculateDifference(testSummary.averageUserRating, baselineSummary.averageUserRating),
      significanceLevel,
      sampleSize: {
        baseline: baselineSummary.totalInteractions,
        test: testSummary.totalInteractions,
      },
    }
  }

  /**
   * 자동 품질 평가 수행
   * (실제 구현에서는 더 정교한 평가 로직 사용)
   */
  public async evaluateResponseQuality(
    userMessage: string,
    botResponse: string,
    detectedIntent: string,
  ): Promise<QualityMetrics> {
    // 간단한 품질 평가 로직 (실제 구현에서는 ML 모델 또는 휴리스틱 사용)
    const relevance = Math.min(8 + Math.random() * 2, 10) // 8-10 범위
    const accuracy = Math.min(7 + Math.random() * 3, 10) // 7-10 범위
    const completeness = Math.min(7 + Math.random() * 3, 10) // 7-10 범위
    const clarity = Math.min(8 + Math.random() * 2, 10) // 8-10 범위
    const tone = Math.min(8 + Math.random() * 2, 10) // 8-10 범위

    // 종합 점수 계산 (가중치 적용 가능)
    const overallScore = relevance * 0.25 + accuracy * 0.25 + completeness * 0.2 + clarity * 0.15 + tone * 0.15

    return {
      relevance,
      accuracy,
      completeness,
      clarity,
      tone,
      overallScore,
    }
  }
}

// 분석 서비스 인스턴스 내보내기
export const analyticsService = AnalyticsService.getInstance()
