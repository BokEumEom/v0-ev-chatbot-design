import type { Feedback, FeedbackFilterOptions } from "@/types/feedback"
import { feedbackAnalysisService } from "./feedback-analysis-service"

// 사용자 세그먼트 타입
export type UserSegment =
  | "new_user" // 신규 사용자
  | "power_user" // 파워 유저
  | "occasional_user" // 가끔 사용하는 유저
  | "returning_user" // 복귀 유저
  | "churned_user" // 이탈 유저
  | "mobile_user" // 모바일 사용자
  | "desktop_user" // 데스크톱 사용자
  | "ev_owner" // 전기차 소유자
  | "ev_curious" // 전기차 관심자
  | "charging_station_operator" // 충전소 운영자

// 세그먼트별 피드백 분석 결과
export interface SegmentAnalysisResult {
  segment: UserSegment
  count: number
  feedbackDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  topIssues: {
    issue: string
    count: number
    sentiment: "positive" | "neutral" | "negative"
  }[]
  topKeywords: {
    keyword: string
    count: number
  }[]
  averageRating: number
  trends: {
    date: string
    count: number
    averageRating: number
  }[]
}

export class UserSegmentAnalysisService {
  private static instance: UserSegmentAnalysisService

  private constructor() {}

  public static getInstance(): UserSegmentAnalysisService {
    if (!UserSegmentAnalysisService.instance) {
      UserSegmentAnalysisService.instance = new UserSegmentAnalysisService()
    }
    return UserSegmentAnalysisService.instance
  }

  // 피드백에서 사용자 세그먼트 추론
  public inferSegmentFromFeedback(feedback: Feedback): UserSegment[] {
    const segments: UserSegment[] = []

    // 디바이스 정보 기반 세그먼트
    if (feedback.deviceInfo) {
      if (feedback.deviceInfo.type === "mobile") {
        segments.push("mobile_user")
      } else if (feedback.deviceInfo.type === "desktop") {
        segments.push("desktop_user")
      }
    }

    // 컨텍스트 기반 세그먼트
    if (feedback.context) {
      // 신규 사용자 (총 세션 시간이 짧은 경우)
      if (feedback.context.totalSessionTime && feedback.context.totalSessionTime < 300000) {
        // 5분 미만
        segments.push("new_user")
      }

      // 파워 유저 (시도 횟수가 많은 경우)
      if (feedback.context.attemptCount && feedback.context.attemptCount > 5) {
        segments.push("power_user")
      }
    }

    // 피드백 내용 기반 세그먼트 (텍스트 분석)
    if (feedback.type === "text") {
      const text = (feedback as any).text as string

      // 전기차 소유자 관련 키워드
      if (/내\s*차|소유|구매|충전\s*중|배터리\s*상태/.test(text)) {
        segments.push("ev_owner")
      }

      // 충전소 운영자 관련 키워드
      if (/운영|관리|설치|충전소\s*상태|충전기\s*고장/.test(text)) {
        segments.push("charging_station_operator")
      }

      // 전기차 관심자 관련 키워드
      if (/관심|궁금|구매\s*예정|비교|정보\s*필요/.test(text)) {
        segments.push("ev_curious")
      }
    }

    // 기본 세그먼트 (추론 불가능한 경우)
    if (segments.length === 0) {
      segments.push("occasional_user")
    }

    return segments
  }

  // 세그먼트별 피드백 분석
  public analyzeSegment(segment: UserSegment, filters?: FeedbackFilterOptions): SegmentAnalysisResult {
    // 해당 세그먼트의 피드백 필터링
    const allFeedback = feedbackAnalysisService.getFeedbackList(filters)

    // 세그먼트에 속하는 피드백만 필터링
    const segmentFeedback = allFeedback.filter((feedback) => {
      const inferredSegments = this.inferSegmentFromFeedback(feedback)
      return inferredSegments.includes(segment)
    })

    // 감정 분포 계산
    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    }

    segmentFeedback.forEach((feedback) => {
      const sentiment = this.getSentimentFromFeedback(feedback)
      sentimentDistribution[sentiment]++
    })

    // 평점 평균 계산
    let totalRating = 0
    let ratingCount = 0

    segmentFeedback.forEach((feedback) => {
      if (feedback.type === "rating") {
        totalRating += (feedback as any).rating
        ratingCount++
      }
    })

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

    // 키워드 추출 및 이슈 분석
    const keywordMap = new Map<string, number>()
    const issueMap = new Map<string, { count: number; sentiment: "positive" | "neutral" | "negative" }>()

    segmentFeedback.forEach((feedback) => {
      if (feedback.type === "text") {
        const text = (feedback as any).text
        const keywords = this.extractKeywords(text)
        const sentiment = this.getSentimentFromFeedback(feedback)

        // 키워드 카운트
        keywords.forEach((keyword) => {
          keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1)
        })

        // 이슈 추출 (간단한 구현)
        const issues = this.extractIssues(text)
        issues.forEach((issue) => {
          if (!issueMap.has(issue)) {
            issueMap.set(issue, { count: 0, sentiment: "neutral" })
          }

          const issueData = issueMap.get(issue)!
          issueData.count++

          // 감정이 더 강한 쪽으로 업데이트
          if (sentiment === "negative") {
            issueData.sentiment = "negative"
          } else if (sentiment === "positive" && issueData.sentiment !== "negative") {
            issueData.sentiment = "positive"
          }
        })
      }
    })

    // 상위 키워드 추출
    const topKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    // 상위 이슈 추출
    const topIssues = Array.from(issueMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([issue, data]) => ({
        issue,
        count: data.count,
        sentiment: data.sentiment,
      }))

    // 시간별 트렌드 분석
    const dateMap = new Map<string, { count: number; totalRating: number; ratingCount: number }>()

    segmentFeedback.forEach((feedback) => {
      const date = feedback.timestamp.toISOString().split("T")[0] // YYYY-MM-DD

      if (!dateMap.has(date)) {
        dateMap.set(date, { count: 0, totalRating: 0, ratingCount: 0 })
      }

      const dateData = dateMap.get(date)!
      dateData.count++

      if (feedback.type === "rating") {
        dateData.totalRating += (feedback as any).rating
        dateData.ratingCount++
      }
    })

    const trends = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      segment,
      count: segmentFeedback.length,
      feedbackDistribution: sentimentDistribution,
      topIssues,
      topKeywords,
      averageRating,
      trends,
    }
  }

  // 모든 세그먼트 분석
  public analyzeAllSegments(filters?: FeedbackFilterOptions): SegmentAnalysisResult[] {
    const segments: UserSegment[] = [
      "new_user",
      "power_user",
      "occasional_user",
      "mobile_user",
      "desktop_user",
      "ev_owner",
      "ev_curious",
      "charging_station_operator",
    ]

    return segments.map((segment) => this.analyzeSegment(segment, filters))
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

  // 텍스트에서 이슈 추출 (간단한 구현)
  private extractIssues(text: string): string[] {
    // 실제 구현에서는 NLP 라이브러리 사용 권장
    const issues: string[] = []

    // 충전 관련 이슈
    if (/충전\s*(문제|오류|에러|실패|안\s*됨)/.test(text)) {
      issues.push("충전 문제")
    }

    // 앱 관련 이슈
    if (/앱\s*(문제|오류|에러|실패|안\s*됨|튕김|느림)/.test(text)) {
      issues.push("앱 문제")
    }

    // 결제 관련 이슈
    if (/결제\s*(문제|오류|에러|실패|안\s*됨)/.test(text)) {
      issues.push("결제 문제")
    }

    // 충전소 관련 이슈
    if (/충전소\s*(문제|오류|고장|찾기|위치)/.test(text)) {
      issues.push("충전소 문제")
    }

    // 사용성 관련 이슈
    if (/사용\s*(어려움|불편|복잡)/.test(text)) {
      issues.push("사용성 문제")
    }

    return issues
  }
}

export const userSegmentAnalysisService = UserSegmentAnalysisService.getInstance()
