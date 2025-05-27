"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface SatisfactionAnalysisChartProps {
  summary: ConversationAnalyticsSummary
  detailed?: boolean
}

export function SatisfactionAnalysisChart({ summary, detailed = false }: SatisfactionAnalysisChartProps) {
  const { satisfactionMetrics } = summary

  // 만족도 분포 데이터
  const distributionData = Object.entries(satisfactionMetrics.satisfactionDistribution).map(([score, count]) => ({
    score: `${score}점`,
    count,
    fill: getScoreColor(Number.parseInt(score)),
  }))

  // 이슈 타입별 만족도 데이터
  const issueTypeData = Object.entries(satisfactionMetrics.satisfactionByIssueType)
    .map(([issueType, score]) => ({
      name: formatIssueType(issueType),
      score,
      fill: getScoreColor(score),
    }))
    .sort((a, b) => b.score - a.score)

  // 해결 상태별 만족도 데이터
  const resolutionStatusData = [
    {
      name: "해결됨",
      score: satisfactionMetrics.satisfactionByResolutionStatus.resolved,
      fill: getScoreColor(satisfactionMetrics.satisfactionByResolutionStatus.resolved),
    },
    {
      name: "미해결",
      score: satisfactionMetrics.satisfactionByResolutionStatus.unresolved,
      fill: getScoreColor(satisfactionMetrics.satisfactionByResolutionStatus.unresolved),
    },
  ]

  // 점수에 따른 색상 반환
  function getScoreColor(score: number): string {
    if (score >= 4.5) return "#4ade80" // 초록색 (매우 좋음)
    if (score >= 3.5) return "#60a5fa" // 파란색 (좋음)
    if (score >= 2.5) return "#f59e0b" // 주황색 (보통)
    if (score >= 1.5) return "#f97316" // 주황-빨강색 (나쁨)
    return "#f87171" // 빨간색 (매우 나쁨)
  }

  // 이슈 타입 포맷팅
  function formatIssueType(issueType: string): string {
    const mapping: Record<string, string> = {
      charging_start: "충전 시작 문제",
      charging_error: "충전 오류",
      payment: "결제 문제",
      app_connection: "앱 연결 문제",
      charging_speed: "충전 속도 문제",
      account: "계정 문제",
      location: "위치 문제",
      reservation: "예약 문제",
    }
    return mapping[issueType] || issueType
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 만족도 분석</CardTitle>
        <CardDescription>
          {detailed ? "만족도 점수 분포와 이슈 타입별 만족도를 보여줍니다." : "사용자가 평가한 만족도 점수 분포입니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {detailed ? (
          <div className="space-y-6">
            <div className="h-[200px]">
              <h3 className="text-sm font-medium mb-2">만족도 점수 분포</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="응답 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
              <h3 className="text-sm font-medium mb-2">이슈 타입별 만족도</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}점`, "평균 만족도"]} />
                  <Bar dataKey="score" name="평균 만족도" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}점`, "평균 만족도"]} />
                <Legend />
                <Bar dataKey="score" name="평균 만족도" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
