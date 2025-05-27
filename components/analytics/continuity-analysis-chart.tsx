"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface ContinuityAnalysisChartProps {
  summary: ConversationAnalyticsSummary
}

export function ContinuityAnalysisChart({ summary }: ContinuityAnalysisChartProps) {
  const { continuityMetrics } = summary

  // 차트 데이터 준비
  const data = [
    {
      name: "평균 메시지 수",
      value: continuityMetrics.averageMessageCount,
      fill: "#8884d8",
    },
    {
      name: "중단율",
      value: continuityMetrics.abandonmentRate * 100, // 퍼센트로 변환
      fill: "#ff8042",
    },
    {
      name: "후속 질문 수락률",
      value: continuityMetrics.followUpAcceptanceRate * 100, // 퍼센트로 변환
      fill: "#82ca9d",
    },
    {
      name: "대화 재개율",
      value: continuityMetrics.conversationReengagementRate * 100, // 퍼센트로 변환
      fill: "#8dd1e1",
    },
    {
      name: "단일 메시지 대화율",
      value: continuityMetrics.singleMessageConversationRate * 100, // 퍼센트로 변환
      fill: "#a4de6c",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>대화 지속성 분석</CardTitle>
        <CardDescription>
          대화의 지속성과 관련된 주요 지표를 보여줍니다. 높은 후속 질문 수락률과 낮은 중단율이 이상적입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip
                formatter={(value: number) => {
                  return [`${value.toFixed(1)}${value === data[0].value ? "" : "%"}`, "값"]
                }}
              />
              <Legend />
              <Bar dataKey="value" name="값" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
