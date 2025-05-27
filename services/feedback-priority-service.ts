import type { Feedback } from "@/types/feedback"
import type {
  ClassifiedFeedback,
  ClassificationResult,
  PriorityCalculationConfig,
  PriorityLevel,
  PriorityResult,
} from "@/types/ml-feedback"
import { mlFeedbackClassificationService } from "./ml-feedback-classification-service"

export class FeedbackPriorityService {
  private static instance: FeedbackPriorityService
  private config: PriorityCalculationConfig

  private constructor() {
    // 기본 우선순위 계산 설정
    this.config = {
      weights: {
        urgency: 0.25, // 긴급성 가중치
        impact: 0.25, // 영향도 가중치
        effort: 0.15, // 노력 가중치
        userSegment: 0.15, // 사용자 세그먼트 가중치
        recency: 0.1, // 최신성 가중치
        frequency: 0.1, // 빈도 가중치
      },
      thresholds: {
        critical: 80, // 위기 수준 임계값
        high: 60, // 높음 수준 임계값
        medium: 40, // 중간 수준 임계값
        low: 20, // 낮음 수준 임계값
      },
      decayFactor: 0.05, // 시간 경과에 따른 감소 계수
      userSegmentMultipliers: {
        power_user: 1.5, // 파워 유저
        new_user: 1.3, // 신규 유저
        returning_user: 1.2, // 복귀 유저
        inactive_user: 0.8, // 비활성 유저
      },
    }
  }

  public static getInstance(): FeedbackPriorityService {
    if (!FeedbackPriorityService.instance) {
      FeedbackPriorityService.instance = new FeedbackPriorityService()
    }
    return FeedbackPriorityService.instance
  }

  // 피드백 우선순위 계산
  public calculatePriority(feedback: Feedback | ClassifiedFeedback): PriorityResult {
    // 분류 결과가 없는 경우 분류 수행
    let classification: ClassificationResult | undefined | null

    if ("classification" in feedback) {
      classification = feedback.classification
    } else {
      classification = mlFeedbackClassificationService.classifyFeedback(feedback)
    }

    // 긴급성 점수 계산 (0-100)
    const urgencyScore = this.calculateUrgencyScore(feedback, classification)

    // 영향도 점수 계산 (0-100)
    const impactScore = this.calculateImpactScore(feedback, classification)

    // 노력 점수 계산 (0-100, 낮을수록 우선순위 높음)
    const effortScore = this.calculateEffortScore(feedback, classification)

    // 사용자 세그먼트 점수 계산 (0-100)
    const userSegmentScore = this.calculateUserSegmentScore(feedback)

    // 최신성 점수 계산 (0-100)
    const recencyScore = this.calculateRecencyScore(feedback)

    // 빈도 점수 계산 (0-100)
    const frequencyScore = this.calculateFrequencyScore(feedback)

    // 가중 평균으로 최종 점수 계산
    const finalScore =
      urgencyScore * this.config.weights.urgency +
      impactScore * this.config.weights.impact +
      (100 - effortScore) * this.config.weights.effort + // 노력 점수는 역으로 계산
      userSegmentScore * this.config.weights.userSegment +
      recencyScore * this.config.weights.recency +
      frequencyScore * this.config.weights.frequency

    // 우선순위 레벨 결정
    let priorityLevel: PriorityLevel

    if (finalScore >= this.config.thresholds.critical) {
      priorityLevel = "critical"
    } else if (finalScore >= this.config.thresholds.high) {
      priorityLevel = "high"
    } else if (finalScore >= this.config.thresholds.medium) {
      priorityLevel = "medium"
    } else if (finalScore >= this.config.thresholds.low) {
      priorityLevel = "low"
    } else {
      priorityLevel = "trivial"
    }

    // 기여 요소 계산
    const factors = [
      {
        name: "긴급성",
        contribution: (urgencyScore * this.config.weights.urgency) / finalScore,
        description: `피드백의 긴급성 점수: ${Math.round(urgencyScore)}/100`,
      },
      {
        name: "영향도",
        contribution: (impactScore * this.config.weights.impact) / finalScore,
        description: `피드백의 영향도 점수: ${Math.round(impactScore)}/100`,
      },
      {
        name: "구현 용이성",
        contribution: ((100 - effortScore) * this.config.weights.effort) / finalScore,
        description: `구현 용이성 점수: ${Math.round(100 - effortScore)}/100`,
      },
      {
        name: "사용자 중요도",
        contribution: (userSegmentScore * this.config.weights.userSegment) / finalScore,
        description: `사용자 중요도 점수: ${Math.round(userSegmentScore)}/100`,
      },
      {
        name: "최신성",
        contribution: (recencyScore * this.config.weights.recency) / finalScore,
        description: `피드백 최신성 점수: ${Math.round(recencyScore)}/100`,
      },
      {
        name: "빈도",
        contribution: (frequencyScore * this.config.weights.frequency) / finalScore,
        description: `유사 피드백 빈도 점수: ${Math.round(frequencyScore)}/100`,
      },
    ]

    return {
      level: priorityLevel,
      score: Math.round(finalScore),
      factors: factors.sort((a, b) => b.contribution - a.contribution), // 기여도 내림차순 정렬
      calculationTime: new Date(),
    }
  }

  // 긴급성 점수 계산
  private calculateUrgencyScore(feedback: Feedback, classification: ClassificationResult | null | undefined): number {
    let score = 50 // 기본 점수

    // 분류 결과가 있는 경우
    if (classification) {
      // 카테고리별 점수 조정
      switch (classification.category) {
        case "accuracy":
          score += 20 // 정확성 문제는 더 긴급함
          break
        case "speed":
          score += 15 // 속도 문제도 중요함
          break
        case "usability":
          score += 10 // 사용성 문제는 중간 정도
          break
        default:
          break
      }

      // 주제별 점수 조정
      classification.topics.forEach(({ topic, confidence }) => {
        switch (topic) {
          case "payment_issues":
            score += 25 * confidence // 결제 문제는 매우 긴급함
            break
          case "connection_problems":
            score += 20 * confidence // 연결 문제도 매우 중요함
            break
          case "bug_report":
            score += 15 * confidence // 버그 신고도 중요함
            break
          case "performance":
            score += 10 * confidence // 성능 문제는 중간 정도
            break
          default:
            break
        }
      })

      // 신뢰도 수준에 따른 조정
      switch (classification.confidenceLevel) {
        case "high":
          score = score * 1.2 // 높은 신뢰도는 점수 증가
          break
        case "low":
          score = score * 0.8 // 낮은 신뢰도는 점수 감소
          break
        default:
          break
      }
    }

    // 피드백 유형별 점수 조정
    switch (feedback.type) {
      case "rating":
        if (feedback.rating <= 2) {
          score += 15 // 낮은 평점은 더 긴급함
        }
        break
      case "text":
        // 텍스트 길이가 길면 더 상세한 피드백일 가능성이 높음
        if (feedback.text.length > 200) {
          score += 10
        }
        break
      case "suggestion":
        // 제안은 일반적으로 덜 긴급함
        score -= 5
        break
      default:
        break
    }

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 영향도 점수 계산
  private calculateImpactScore(feedback: Feedback, classification: ClassificationResult | null | undefined): number {
    let score = 50 // 기본 점수

    // 분류 결과가 있는 경우
    if (classification) {
      // 카테고리별 점수 조정
      switch (classification.category) {
        case "usability":
          score += 15 // 사용성 문제는 많은 사용자에게 영향
          break
        case "accuracy":
          score += 20 // 정확성 문제는 신뢰도에 큰 영향
          break
        case "completeness":
          score += 10 // 완전성 문제는 중간 정도 영향
          break
        default:
          break
      }

      // 주제별 점수 조정
      classification.topics.forEach(({ topic, confidence }) => {
        switch (topic) {
          case "charging_speed":
            score += 20 * confidence // 충전 속도는 핵심 기능
            break
          case "station_availability":
            score += 25 * confidence // 충전소 가용성은 매우 중요
            break
          case "payment_issues":
            score += 25 * confidence // 결제 문제는 매우 중요
            break
          case "app_usability":
            score += 15 * confidence // 앱 사용성은 모든 사용자에게 영향
            break
          default:
            break
        }
      })
    }

    // 피드백 컨텍스트 정보가 있는 경우
    if (feedback.context) {
      // 여러 번 시도한 문제일수록 영향이 큼
      if (feedback.context.attemptCount && feedback.context.attemptCount > 2) {
        score += 15
      }

      // 오래 머문 노드일수록 문제가 복잡할 가능성이 높음
      if (feedback.context.timeSpentOnNode && feedback.context.timeSpentOnNode > 60000) {
        // 1분 이상
        score += 10
      }
    }

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 노력 점수 계산 (낮을수록 구현이 쉬움)
  private calculateEffortScore(feedback: Feedback, classification: ClassificationResult | null | undefined): number {
    let score = 50 // 기본 점수

    // 분류 결과가 있는 경우
    if (classification) {
      // 카테고리별 점수 조정
      switch (classification.category) {
        case "clarity":
          score -= 15 // 명확성 문제는 비교적 해결이 쉬움
          break
        case "completeness":
          score += 20 // 완전성 문제는 더 많은 작업 필요
          break
        case "accuracy":
          score += 15 // 정확성 문제는 복잡할 수 있음
          break
        default:
          break
      }

      // 주제별 점수 조정
      classification.topics.forEach(({ topic, confidence }) => {
        switch (topic) {
          case "documentation":
            score -= 20 * confidence // 문서화는 비교적 쉬움
            break
          case "ui_design":
            score -= 10 * confidence // UI 디자인은 중간 정도
            break
          case "feature_request":
            score += 25 * confidence // 새 기능 요청은 구현이 어려울 수 있음
            break
          case "performance":
            score += 20 * confidence // 성능 문제는 복잡할 수 있음
            break
          default:
            break
        }
      })
    }

    // 피드백 유형별 점수 조정
    switch (feedback.type) {
      case "suggestion":
        // 제안은 일반적으로 새로운 기능을 요구하므로 더 많은 노력 필요
        score += 15
        break
      case "rating":
        // 평점만 있는 피드백은 구체적인 문제를 파악하기 어려움
        score += 10
        break
      default:
        break
    }

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 사용자 세그먼트 점수 계산
  private calculateUserSegmentScore(feedback: Feedback): number {
    let score = 50 // 기본 점수

    // 사용자 ID가 있는 경우
    if (feedback.userId) {
      // 실제 구현에서는 사용자 세그먼트 정보를 데이터베이스에서 조회
      // 여기서는 간단한 예시로 사용자 ID 기반 더미 세그먼트 할당
      const userIdNum = Number.parseInt(feedback.userId.replace(/\D/g, "") || "0")

      // 더미 세그먼트 할당
      let userSegment: string
      if (userIdNum % 10 === 0) {
        userSegment = "power_user"
        score += 30
      } else if (userIdNum % 10 <= 3) {
        userSegment = "new_user"
        score += 20
      } else if (userIdNum % 10 <= 6) {
        userSegment = "returning_user"
        score += 15
      } else {
        userSegment = "inactive_user"
        score -= 10
      }

      // 세그먼트 승수 적용
      if (this.config.userSegmentMultipliers[userSegment]) {
        score = score * this.config.userSegmentMultipliers[userSegment]
      }
    }

    // 디바이스 정보가 있는 경우
    if (feedback.deviceInfo) {
      // 모바일 사용자는 더 중요하게 처리
      if (feedback.deviceInfo.type === "mobile") {
        score += 10
      }
    }

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 최신성 점수 계산
  private calculateRecencyScore(feedback: Feedback): number {
    const now = new Date()
    const feedbackTime = new Date(feedback.timestamp)

    // 피드백 제출 후 경과 시간 (일)
    const daysSinceSubmission = (now.getTime() - feedbackTime.getTime()) / (1000 * 60 * 60 * 24)

    // 시간 경과에 따른 점수 감소 (최신 피드백일수록 높은 점수)
    const score = 100 * Math.exp(-this.config.decayFactor * daysSinceSubmission)

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 빈도 점수 계산 (유사 피드백이 많을수록 높은 점수)
  private calculateFrequencyScore(feedback: Feedback): number {
    // 실제 구현에서는 유사 피드백 빈도를 데이터베이스에서 조회
    // 여기서는 간단한 예시로 더미 점수 반환

    // 피드백 유형별 기본 점수
    let score = 50

    switch (feedback.type) {
      case "rating":
        // 낮은 평점은 더 자주 발생할 가능성이 높음
        if (feedback.rating <= 2) {
          score += 20
        } else if (feedback.rating >= 4) {
          score -= 10
        }
        break
      case "text":
        // 텍스트 길이가 짧은 피드백은 더 일반적일 수 있음
        if (feedback.text.length < 50) {
          score += 10
        } else if (feedback.text.length > 200) {
          score -= 10 // 상세한 피드백은 더 독특할 수 있음
        }
        break
      case "suggestion":
        // 제안은 일반적으로 더 독특함
        score -= 15
        break
      default:
        break
    }

    // 노드 ID가 있는 경우
    if (feedback.nodeId) {
      // 특정 노드에 대한 피드백 빈도 시뮬레이션
      const nodeIdNum = Number.parseInt(feedback.nodeId.replace(/\D/g, "") || "0")

      // 자주 피드백이 발생하는 노드 시뮬레이션
      if (nodeIdNum % 5 === 0) {
        score += 25 // 매우 자주 발생
      } else if (nodeIdNum % 5 === 1) {
        score += 15 // 자주 발생
      } else if (nodeIdNum % 5 === 2) {
        score += 5 // 가끔 발생
      } else {
        score -= 10 // 드물게 발생
      }
    }

    // 최종 점수 범위 조정 (0-100)
    return Math.max(0, Math.min(100, score))
  }

  // 우선순위 계산 설정 업데이트
  public updateConfig(newConfig: Partial<PriorityCalculationConfig>): PriorityCalculationConfig {
    this.config = {
      ...this.config,
      ...newConfig,
      weights: {
        ...this.config.weights,
        ...(newConfig.weights || {}),
      },
      thresholds: {
        ...this.config.thresholds,
        ...(newConfig.thresholds || {}),
      },
      userSegmentMultipliers: {
        ...this.config.userSegmentMultipliers,
        ...(newConfig.userSegmentMultipliers || {}),
      },
    }

    return this.config
  }

  // 현재 우선순위 계산 설정 조회
  public getConfig(): PriorityCalculationConfig {
    return { ...this.config }
  }

  // 피드백 일괄 우선순위 계산
  public batchCalculatePriorities(feedbacks: Feedback[]): ClassifiedFeedback[] {
    return feedbacks.map((feedback) => {
      const classification = mlFeedbackClassificationService.classifyFeedback(feedback)
      const priority = this.calculatePriority(feedback)

      return {
        ...feedback,
        classification: classification || undefined,
        priority,
      }
    })
  }
}

// 서비스 인스턴스 내보내기
export const feedbackPriorityService = FeedbackPriorityService.getInstance()
