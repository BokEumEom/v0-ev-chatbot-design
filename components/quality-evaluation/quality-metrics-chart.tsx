"use client"

import { BarChart } from "@/components/analytics/charts"
import type { EvaluationResult } from "@/types/quality-evaluation"

interface QualityMetricsChartProps {
  evaluationResults: EvaluationResult[]
}

export function QualityMetricsChart({ evaluationResults = [] }: QualityMetricsChartProps) {
  // 평가 결과가 없는 경우 빈 차트 표시
  if (!Array.isArray(evaluationResults) || evaluationResults.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">평가 결과가 없습니다.</p>
      </div>
    )
  }

  // 평균 지표 계산
  const metrics = {
    relevance: 0,
    accuracy: 0,
    completeness: 0,
    clarity: 0,
    helpfulness: 0,
    conciseness: 0,
    tone: 0,
    overallScore: 0,
  }

  evaluationResults.forEach((result) => {
    if (result.metrics) {
      metrics.relevance += result.metrics.relevance || 0
      metrics.accuracy += result.metrics.accuracy || 0
      metrics.completeness += result.metrics.completeness || 0
      metrics.clarity += result.metrics.clarity || 0
      metrics.helpfulness += result.metrics.helpfulness || 0
      metrics.conciseness += result.metrics.conciseness || 0
      metrics.tone += result.metrics.tone || 0
      metrics.overallScore += result.metrics.overallScore || 0
    }
  })

  const count = evaluationResults.length
  Object.keys(metrics).forEach((key) => {
    metrics[key as keyof typeof metrics] = metrics[key as keyof typeof metrics] / count
  })

  // 차트 데이터 생성
  const chartData = [
    { name: "관련성", value: metrics.relevance },
    { name: "정확성", value: metrics.accuracy },
    { name: "완전성", value: metrics.completeness },
    { name: "명확성", value: metrics.clarity },
    { name: "유용성", value: metrics.helpfulness },
    { name: "간결성", value: metrics.conciseness },
    { name: "어조", value: metrics.tone },
    { name: "종합 점수", value: metrics.overallScore },
  ]

  return (
    <div className="h-full">
      <BarChart data={chartData} xKey="name" yKey="value" />
    </div>
  )
}
