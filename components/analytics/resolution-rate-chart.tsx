"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface ResolutionRateChartProps {
  summary: ConversationAnalyticsSummary
  detailed?: boolean
}

export function ResolutionRateChart({ summary, detailed = false }: ResolutionRateChartProps) {
  const { resolutionMetrics } = summary

  // 기본 해결률 차트 데이터
  const basicData = [
    {
      name: "해결됨",
      value: resolutionMetrics.overallResolutionRate * 100,
      color: "#4ade80",
    },
    {
      name: "미해결",
      value: (1 - resolutionMetrics.overallResolutionRate) * 100,
      color: "#f87171",
    },
  ]

  // 상세 해결률 차트 데이터
  const detailedData = [
    {
      name: "첫 응답으로 해결",
      value: resolutionMetrics.firstResponseResolutionRate * 100,
      color: "#4ade80",
    },
    {
      name: "대화 중 해결",
      value: (resolutionMetrics.overallResolutionRate - resolutionMetrics.firstResponseResolutionRate) * 100,
      color: "#60a5fa",
    },
    {
      name: "상담원 연결",
      value: resolutionMetrics.agentTransferRate * 100,
      color: "#f59e0b",
    },
    {
      name: "미해결",
      value: (1 - resolutionMetrics.overallResolutionRate - resolutionMetrics.agentTransferRate) * 100,
      color: "#f87171",
    },
  ]

  // 사용할 데이터 선택
  const data = detailed ? detailedData : basicData

  return (
    <Card>
      <CardHeader>
        <CardTitle>문제 해결률</CardTitle>
        <CardDescription>
          {detailed
            ? "문제 해결 방식에 따른 상세 분석입니다. 첫 응답으로 해결된 비율이 높을수록 효율적입니다."
            : "AI 챗봇이 사용자 문제를 해결한 비율입니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
