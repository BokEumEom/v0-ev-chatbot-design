import type { Feedback, FeedbackFilterOptions } from "@/types/feedback"
import { feedbackAnalysisService } from "./feedback-analysis-service"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// 예측 결과 타입
export interface FeedbackPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  trend: "increasing" | "decreasing" | "stable"
  confidence: number // 0-1 사이의 신뢰도
  factors: {
    factor: string
    impact: number // -1에서 1 사이의 영향도
  }[]
  timeframe: "day" | "week" | "month"
  nextActions: string[]
}

export class FeedbackPredictionService {
  private static instance: FeedbackPredictionService

  private constructor() {}

  public static getInstance(): FeedbackPredictionService {
    if (!FeedbackPredictionService.instance) {
      FeedbackPredictionService.instance = new FeedbackPredictionService()
    }
    return FeedbackPredictionService.instance
  }

  // 피드백 트렌드 예측
  public predictFeedbackTrends(
    metric: "volume" | "sentiment" | "rating",
    timeframe: "day" | "week" | "month" = "week",
    filters?: FeedbackFilterOptions,
  ): FeedbackPrediction {
    // 과거 데이터 가져오기
    const feedbackList = feedbackAnalysisService.getFeedbackList(filters)

    // 시간별 데이터 그룹화
    const timeSeriesData = this.groupFeedbackByTime(feedbackList, timeframe)

    // 현재 값 계산
    const currentValue = this.calculateCurrentValue(timeSeriesData, metric)

    // 트렌드 분석 및 예측
    const { predictedValue, trend, confidence } = this.analyzeTrendAndPredict(timeSeriesData, metric)

    // 영향 요인 분석
    const factors = this.analyzeFactors(feedbackList, metric)

    // 다음 액션 추천
    const nextActions = this.recommendNextActions(metric, trend, factors)

    return {
      metric,
      currentValue,
      predictedValue,
      trend,
      confidence,
      factors,
      timeframe,
      nextActions,
    }
  }

  // 시간별 피드백 그룹화
  private groupFeedbackByTime(
    feedbackList: Feedback[],
    timeframe: "day" | "week" | "month",
  ): Array<{ date: string; feedbacks: Feedback[] }> {
    const groupedData = new Map<string, Feedback[]>()

    feedbackList.forEach((feedback) => {
      const date = new Date(feedback.timestamp)
      let timeKey: string

      if (timeframe === "day") {
        timeKey = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else if (timeframe === "week") {
        // 주의 시작일 (일요일)로 설정
        const day = date.getDay()
        const diff = date.getDate() - day
        const weekStart = new Date(date)
        weekStart.setDate(diff)
        timeKey = weekStart.toISOString().split("T")[0]
      } else {
        // month
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!groupedData.has(timeKey)) {
        groupedData.set(timeKey, [])
      }

      groupedData.get(timeKey)!.push(feedback)
    })

    // 날짜순으로 정렬
    return Array.from(groupedData.entries())
      .map(([date, feedbacks]) => ({ date, feedbacks }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 현재 값 계산
  private calculateCurrentValue(
    timeSeriesData: Array<{ date: string; feedbacks: Feedback[] }>,
    metric: "volume" | "sentiment" | "rating",
  ): number {
    if (timeSeriesData.length === 0) return 0

    // 가장 최근 데이터 사용
    const latestData = timeSeriesData[timeSeriesData.length - 1]

    if (metric === "volume") {
      return latestData.feedbacks.length
    } else if (metric === "sentiment") {
      // 긍정적 피드백 비율 계산
      let positiveCount = 0

      latestData.feedbacks.forEach((feedback) => {
        const sentiment = this.getSentimentFromFeedback(feedback)
        if (sentiment === "positive") {
          positiveCount++
        }
      })

      return latestData.feedbacks.length > 0 ? (positiveCount / latestData.feedbacks.length) * 100 : 0
    } else if (metric === "rating") {
      // 평균 평점 계산
      let totalRating = 0
      let ratingCount = 0

      latestData.feedbacks.forEach((feedback) => {
        if (feedback.type === "rating") {
          totalRating += (feedback as any).rating
          ratingCount++
        }
      })

      return ratingCount > 0 ? totalRating / ratingCount : 0
    }

    return 0
  }

  // 트렌드 분석 및 예측
  private analyzeTrendAndPredict(
    timeSeriesData: Array<{ date: string; feedbacks: Feedback[] }>,
    metric: "volume" | "sentiment" | "rating",
  ): { predictedValue: number; trend: "increasing" | "decreasing" | "stable"; confidence: number } {
    if (timeSeriesData.length < 2) {
      return {
        predictedValue: 0,
        trend: "stable",
        confidence: 0,
      }
    }

    // 메트릭별 시계열 데이터 생성
    const metricValues: number[] = timeSeriesData.map((data) => {
      if (metric === "volume") {
        return data.feedbacks.length
      } else if (metric === "sentiment") {
        let positiveCount = 0
        data.feedbacks.forEach((feedback) => {
          const sentiment = this.getSentimentFromFeedback(feedback)
          if (sentiment === "positive") {
            positiveCount++
          }
        })
        return data.feedbacks.length > 0 ? (positiveCount / data.feedbacks.length) * 100 : 0
      } else if (metric === "rating") {
        let totalRating = 0
        let ratingCount = 0
        data.feedbacks.forEach((feedback) => {
          if (feedback.type === "rating") {
            totalRating += (feedback as any).rating
            ratingCount++
          }
        })
        return ratingCount > 0 ? totalRating / ratingCount : 0
      }
      return 0
    })

    // 간단한 선형 회귀를 사용한 예측 (실제로는 더 정교한 알고리즘 필요)
    const n = metricValues.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = metricValues

    // 평균 계산
    const xMean = x.reduce((sum, val) => sum + val, 0) / n
    const yMean = y.reduce((sum, val) => sum + val, 0) / n

    // 기울기 및 절편 계산
    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean)
      denominator += Math.pow(x[i] - xMean, 2)
    }

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean

    // 다음 값 예측
    const predictedValue = slope * n + intercept

    // 트렌드 결정
    let trend: "increasing" | "decreasing" | "stable"
    if (slope > 0.1) {
      trend = "increasing"
    } else if (slope < -0.1) {
      trend = "decreasing"
    } else {
      trend = "stable"
    }

    // 신뢰도 계산 (간단한 구현)
    // R-squared 계산
    let ssTotal = 0
    let ssResidual = 0

    for (let i = 0; i < n; i++) {
      ssTotal += Math.pow(y[i] - yMean, 2)
      const predicted = slope * x[i] + intercept
      ssResidual += Math.pow(y[i] - predicted, 2)
    }

    const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0
    const confidence = Math.max(0, Math.min(1, rSquared)) // 0-1 사이로 제한

    return {
      predictedValue: Math.max(0, predictedValue), // 음수 방지
      trend,
      confidence,
    }
  }

  // 영향 요인 분석
  private analyzeFactors(
    feedbackList: Feedback[],
    metric: "volume" | "sentiment" | "rating",
  ): { factor: string; impact: number }[] {
    // 실제 구현에서는 더 정교한 알고리즘 필요
    const factors: { factor: string; impact: number }[] = []

    // 피드백 유형 분포
    const typeDistribution: Record<string, number> = {
      rating: 0,
      text: 0,
      choice: 0,
      suggestion: 0,
    }

    feedbackList.forEach((feedback) => {
      typeDistribution[feedback.type]++
    })

    const totalFeedback = feedbackList.length

    if (totalFeedback > 0) {
      // 텍스트 피드백 비율이 높으면 영향 요인으로 추가
      const textRatio = typeDistribution.text / totalFeedback
      if (textRatio > 0.3) {
        factors.push({
          factor: "텍스트 피드백 비율",
          impact: 0.7 * textRatio,
        })
      }

      // 평점 피드백 비율이 높으면 영향 요인으로 추가
      const ratingRatio = typeDistribution.rating / totalFeedback
      if (ratingRatio > 0.3) {
        factors.push({
          factor: "평점 피드백 비율",
          impact: 0.6 * ratingRatio,
        })
      }
    }

    // 디바이스 유형 분석
    const deviceTypes: Record<string, number> = {
      mobile: 0,
      tablet: 0,
      desktop: 0,
    }

    feedbackList.forEach((feedback) => {
      if (feedback.deviceInfo?.type) {
        deviceTypes[feedback.deviceInfo.type]++
      }
    })

    if (totalFeedback > 0) {
      // 모바일 사용자 비율이 높으면 영향 요인으로 추가
      const mobileRatio = deviceTypes.mobile / totalFeedback
      if (mobileRatio > 0.5) {
        factors.push({
          factor: "모바일 사용자 비율",
          impact: 0.5 * mobileRatio,
        })
      }
    }

    // 감정 분석
    const sentiments: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    }

    feedbackList.forEach((feedback) => {
      const sentiment = this.getSentimentFromFeedback(feedback)
      sentiments[sentiment]++
    })

    if (totalFeedback > 0) {
      // 부정적 피드백 비율이 높으면 영향 요인으로 추가
      const negativeRatio = sentiments.negative / totalFeedback
      if (negativeRatio > 0.3) {
        factors.push({
          factor: "부정적 피드백 비율",
          impact: -0.8 * negativeRatio,
        })
      }

      // 긍정적 피드백 비율이 높으면 영향 요인으로 추가
      const positiveRatio = sentiments.positive / totalFeedback
      if (positiveRatio > 0.5) {
        factors.push({
          factor: "긍정적 피드백 비율",
          impact: 0.8 * positiveRatio,
        })
      }
    }

    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  }

  // 다음 액션 추천
  private recommendNextActions(
    metric: "volume" | "sentiment" | "rating",
    trend: "increasing" | "decreasing" | "stable",
    factors: { factor: string; impact: number }[],
  ): string[] {
    const actions: string[] = []

    // 메트릭별 추천 액션
    if (metric === "volume") {
      if (trend === "decreasing") {
        actions.push("피드백 수집 방법 다양화 (인앱 설문조사, 이메일 캠페인 등)")
        actions.push("피드백 제공 시 인센티브 도입 고려")
      } else if (trend === "stable") {
        actions.push("피드백 수집 UI/UX 개선")
        actions.push("사용자 참여 유도 메시지 최적화")
      }

      actions.push("피드백 수집 지점 분석 및 최적화")
    } else if (metric === "sentiment") {
      if (trend === "decreasing") {
        actions.push("부정적 피드백이 많은 영역 집중 개선")
        actions.push("사용자 불만 사항 우선 해결")
      } else if (trend === "stable" || trend === "increasing") {
        actions.push("긍정적 피드백 영역 강화")
        actions.push("성공 사례 분석 및 확대")
      }

      actions.push("감정 분석 결과 기반 제품 개선 로드맵 수립")
    } else if (metric === "rating") {
      if (trend === "decreasing") {
        actions.push("낮은 평점 원인 분석 및 개선")
        actions.push("평점 하락 영역 집중 개선")
      } else if (trend === "stable" || trend === "increasing") {
        actions.push("높은 평점 영역 강화")
        actions.push("사용자 만족도 유지 전략 수립")
      }

      actions.push("평점 기반 제품 개선 우선순위 설정")
    }

    // 영향 요인 기반 추천 액션
    factors.forEach((factor) => {
      if (factor.factor === "텍스트 피드백 비율" && factor.impact > 0) {
        actions.push("텍스트 피드백 분석 강화 및 키워드 추출 개선")
      } else if (factor.factor === "부정적 피드백 비율" && factor.impact < 0) {
        actions.push("부정적 피드백 집중 분석 및 개선 계획 수립")
      } else if (factor.factor === "모바일 사용자 비율" && factor.impact > 0) {
        actions.push("모바일 사용자 경험 최적화")
      }
    })

    // 중복 제거 및 최대 5개 액션 반환
    return [...new Set(actions)].slice(0, 5)
  }

  // 피드백에서 감정 추출 (간단한 구현)
  private getSentimentFromFeedback(feedback: Feedback): "positive" | "neutral" | "negative" {
    if (feedback.type === "text" || feedback.type === "suggestion") {
      return (feedback as any).sentiment || "neutral"
    } else if (feedback.type === "rating") {
      const rating = (feedback as any).rating
      return rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral"
    }

    return "neutral"
  }

  async generateSummary(feedbackList: Feedback[]): Promise<string> {
    const prompt = `다음 피드백 목록을 요약해주세요:\n${JSON.stringify(feedbackList)}`

    try {
      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.3,
      })
      return text
    } catch (error) {
      console.error("Error generating summary:", error)
      return "요약 생성에 실패했습니다."
    }
  }
}

export const feedbackPredictionService = FeedbackPredictionService.getInstance()
