"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface AbandonmentAnalysisChartProps {
  summary: ConversationAnalyticsSummary
}

export function AbandonmentAnalysisChart({ summary }: AbandonmentAnalysisChartProps) {
  const { abandonmentPoints } = summary

  // 색상 배열
  const COLORS = ["#f87171", "#f59e0b", "#60a5fa", "#4ade80", "#a78bfa"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>대화 중단 지점 분석</CardTitle>
        <CardDescription>
          사용자가 대화를 중단한 단계를 보여줍니다. 이 데이터를 통해 사용자 이탈이 많은 지점을 파악할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={abandonmentPoints}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="stage"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {abandonmentPoints.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value}회`, props.payload.stage]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
