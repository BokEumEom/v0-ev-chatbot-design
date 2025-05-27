"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import type { Feedback, FeedbackFilterOptions } from "@/types/feedback"

interface FeedbackTrendsProps {
  filters: FeedbackFilterOptions
}

export function FeedbackTrends({ filters }: FeedbackTrendsProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)

      try {
        const feedbackList = feedbackAnalysisService.getFeedbackList(filters)
        setFeedbackList(feedbackList)
      } catch (error) {
        console.error("피드백 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 시간별 데이터 그룹화
  const getTimeSeriesData = () => {
    const timeMap = new Map<
      string,
      {
        count: number
        ratings: number[]
        positive: number
        neutral: number
        negative: number
      }
    >()

    feedbackList.forEach((feedback) => {
      const date = new Date(feedback.timestamp)
      let timeKey: string

      if (timeRange === "day") {
        timeKey = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else if (timeRange === "week") {
        // 주의 시작일 (일요일)로 설정
        const day = date.getDay()
        const diff = date.getDate() - day
        const weekStart = new Date(date)
        weekStart.setDate(diff)
        timeKey = weekStart.toISOString().split("T")[0]
      } else {
        // month
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, {
          count: 0,
          ratings: [],
          positive: 0,
          neutral: 0,
          negative: 0,
        })
      }

      const data = timeMap.get(timeKey)!
      data.count++

      // 평점 수집
      if (feedback.type === "rating") {
        data.ratings.push(feedback.rating)
      }

      // 감정 분류
      const sentiment = getSentimentFromFeedback(feedback)
      if (sentiment === "positive") {
        data.positive++
      } else if (sentiment === "neutral") {
        data.neutral++
      } else {
        data.negative++
      }
    })

    // 시계열 데이터 생성
    return Array.from(timeMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        averageRating:
          data.ratings.length > 0 ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length : 0,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 피드백에서 감정 추출
  const getSentimentFromFeedback = (feedback: Feedback): "positive" | "neutral" | "negative" => {
    if (feedback.type === "text" || feedback.type === "suggestion") {
      return feedback.sentiment || "neutral"
    } else if (feedback.type === "rating") {
      if (feedback.rating >= 4) return "positive"
      if (feedback.rating <= 2) return "negative"
      return "neutral"
    }
    return "neutral"
  }

  const timeSeriesData = getTimeSeriesData()

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(value: "day" | "week" | "month") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="시간 단위 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">일별</SelectItem>
            <SelectItem value="week">주별</SelectItem>
            <SelectItem value="month">월별</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="volume">
        <TabsList>
          <TabsTrigger value="volume">피드백 양</TabsTrigger>
          <TabsTrigger value="sentiment">감정 트렌드</TabsTrigger>
          <TabsTrigger value="rating">평점 트렌드</TabsTrigger>
        </TabsList>
        <TabsContent value="volume" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시간별 피드백 양</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "피드백 수",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" name="피드백 수" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sentiment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시간별 감정 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  positive: {
                    label: "긍정적",
                    color: "hsl(142.1, 76.2%, 36.3%)",
                  },
                  neutral: {
                    label: "중립적",
                    color: "hsl(215.4, 16.3%, 46.9%)",
                  },
                  negative: {
                    label: "부정적",
                    color: "hsl(0, 84.2%, 60.2%)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="var(--color-positive)" name="긍정적" />
                    <Bar dataKey="neutral" stackId="a" fill="var(--color-neutral)" name="중립적" />
                    <Bar dataKey="negative" stackId="a" fill="var(--color-negative)" name="부정적" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rating" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시간별 평균 평점</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  averageRating: {
                    label: "평균 평점",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="averageRating"
                      stroke="var(--color-averageRating)"
                      name="평균 평점"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
