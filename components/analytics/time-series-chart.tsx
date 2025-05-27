"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface TimeSeriesChartProps {
  summary: ConversationAnalyticsSummary
}

export function TimeSeriesChart({ summary }: TimeSeriesChartProps) {
  const { timeSeriesData } = summary
  const [metric, setMetric] = useState<string>("resolutionRate")

  // 지표 옵션
  const metricOptions = [
    { value: "resolutionRate", label: "해결률", color: "#4ade80", format: "percent" },
    { value: "averageMessageCount", label: "평균 메시지 수", color: "#60a5fa", format: "number" },
    { value: "averageDuration", label: "평균 대화 시간(초)", color: "#f59e0b", format: "number" },
    { value: "satisfactionScore", label: "만족도 점수", color: "#a78bfa", format: "number" },
    { value: "agentTransferRate", label: "상담원 연결률", color: "#f87171", format: "percent" },
  ]

  // 선택된 지표 정보
  const selectedMetric = metricOptions.find((option) => option.value === metric) || metricOptions[0]

  // 툴팁 포맷터
  const formatTooltipValue = (value: number) => {
    if (selectedMetric.format === "percent") {
      return `${(value * 100).toFixed(1)}%`
    }
    return value.toFixed(1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>시간별 트렌드 분석</CardTitle>
          <CardDescription>시간에 따른 주요 지표의 변화 추이를 보여줍니다.</CardDescription>
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="지표 선택" />
          </SelectTrigger>
          <SelectContent>
            {metricOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                domain={
                  selectedMetric.format === "percent"
                    ? [0, 1]
                    : selectedMetric.value === "satisfactionScore"
                      ? [0, 5]
                      : ["auto", "auto"]
                }
                tickFormatter={
                  selectedMetric.format === "percent" ? (value) => `${(value * 100).toFixed(0)}%` : undefined
                }
              />
              <Tooltip formatter={(value) => [formatTooltipValue(value as number), selectedMetric.label]} />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={selectedMetric.color}
                activeDot={{ r: 8 }}
                name={selectedMetric.label}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
