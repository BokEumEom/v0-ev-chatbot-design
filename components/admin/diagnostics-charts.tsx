"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DiagnosticsFilterOptions, TimeSeriesData } from "@/types/diagnostics"
import { diagnosticsService } from "@/services/diagnostics-service"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface DiagnosticsChartsProps {
  filters: DiagnosticsFilterOptions
}

export function DiagnosticsCharts({ filters }: DiagnosticsChartsProps) {
  const [timeInterval, setTimeInterval] = useState<"day" | "week" | "month">("day")
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 필터 또는 시간 간격 변경 시 데이터 다시 로드
  useEffect(() => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출
    const data = diagnosticsService.generateTimeSeriesData(timeInterval, filters)
    setTimeSeriesData(data)
    setIsLoading(false)
  }, [filters, timeInterval])

  // 차트 색상
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    if (timeInterval === "day") {
      return dateStr.slice(5) // MM-DD
    } else if (timeInterval === "week") {
      return `${dateStr.slice(5)} 주`
    } else {
      return dateStr // YYYY-MM
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Tabs
          value={timeInterval}
          onValueChange={(value) => setTimeInterval(value as "day" | "week" | "month")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="day">일별</TabsTrigger>
            <TabsTrigger value="week">주별</TabsTrigger>
            <TabsTrigger value="month">월별</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <ChartsLoadingSkeleton />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>진단 세션 추이</CardTitle>
                <CardDescription>시간에 따른 진단 세션 수</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString(), "세션 수"]}
                      labelFormatter={(label) => `날짜: ${formatDate(label)}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" name="세션 수" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>완료율 및 만족도</CardTitle>
                <CardDescription>시간에 따른 완료율과 사용자 만족도</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                      labelFormatter={(label) => `날짜: ${formatDate(label)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      name="완료율"
                      stroke="#00C49F"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="satisfactionRate"
                      name="만족도"
                      stroke="#FF8042"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>평균 단계 수</CardTitle>
              <CardDescription>시간에 따른 진단 세션당 평균 단계 수</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} 단계`, "평균 단계"]}
                    labelFormatter={(label) => `날짜: ${formatDate(label)}`}
                  />
                  <Legend />
                  <Bar dataKey="averageSteps" name="평균 단계 수" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ChartsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="h-80">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
