"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/analytics/charts"
import type { PromptVersionMetrics } from "@/types/prompt-management"

interface PromptPerformanceMetricsProps {
  metrics?: PromptVersionMetrics
}

export function PromptPerformanceMetrics({ metrics }: PromptPerformanceMetricsProps) {
  // 기본 데이터 생성 (metrics가 없을 경우)
  const defaultDailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toLocaleDateString(),
      accuracy: 0.7 + Math.random() * 0.2,
      latency: 200 + Math.random() * 100,
      satisfaction: 0.8 + Math.random() * 0.15,
    }
  }).reverse()

  const defaultIntentData = [
    { name: "충전소 찾기", value: 0.85 },
    { name: "충전 상태", value: 0.78 },
    { name: "요금 정보", value: 0.92 },
    { name: "문제 해결", value: 0.73 },
    { name: "예약", value: 0.81 },
  ]

  // metrics가 있으면 실제 데이터 사용, 없으면 기본 데이터 사용
  const dailyData = metrics?.dailyMetrics
    ? metrics.dailyMetrics.map((item) => ({
        date: new Date(item.date).toLocaleDateString(),
        accuracy: item.accuracy,
        latency: item.latency,
        satisfaction: item.satisfaction,
      }))
    : defaultDailyData

  const intentData = metrics?.intentMetrics
    ? Object.entries(metrics.intentMetrics).map(([intent, value]) => ({
        name: intent,
        value: value.accuracy,
      }))
    : defaultIntentData

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>성능 지표</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">일별 성능</TabsTrigger>
            <TabsTrigger value="intent">인텐트별 성능</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="h-[300px]">
            <LineChart data={dailyData} xKey="date" yKey="accuracy" />
          </TabsContent>
          <TabsContent value="intent" className="h-[300px]">
            <BarChart data={intentData} xKey="name" yKey="value" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
