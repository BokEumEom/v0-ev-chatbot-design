"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { feedbackPredictionService, type FeedbackPrediction } from "@/services/feedback-prediction-service"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react"
import type { FeedbackFilterOptions } from "@/types/feedback"

interface PredictionDashboardProps {
  filters: FeedbackFilterOptions
}

export function PredictionDashboard({ filters }: PredictionDashboardProps) {
  const [volumePrediction, setVolumePrediction] = useState<FeedbackPrediction | null>(null)
  const [sentimentPrediction, setSentimentPrediction] = useState<FeedbackPrediction | null>(null)
  const [ratingPrediction, setRatingPrediction] = useState<FeedbackPrediction | null>(null)
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)

      try {
        const volumePrediction = feedbackPredictionService.predictFeedbackTrends("volume", timeframe, filters)
        const sentimentPrediction = feedbackPredictionService.predictFeedbackTrends("sentiment", timeframe, filters)
        const ratingPrediction = feedbackPredictionService.predictFeedbackTrends("rating", timeframe, filters)

        setVolumePrediction(volumePrediction)
        setSentimentPrediction(sentimentPrediction)
        setRatingPrediction(ratingPrediction)
      } catch (error) {
        console.error("피드백 예측 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters, timeframe])

  // 트렌드 아이콘 반환
  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable", size = 16) => {
    if (trend === "increasing") {
      return <TrendingUpIcon size={size} className="text-green-500" />
    } else if (trend === "decreasing") {
      return <TrendingDownIcon size={size} className="text-red-500" />
    } else {
      return <ArrowRightIcon size={size} className="text-gray-500" />
    }
  }

  // 트렌드 배지 반환
  const getTrendBadge = (trend: "increasing" | "decreasing" | "stable", metric: "volume" | "sentiment" | "rating") => {
    let color: "success" | "destructive" | "secondary" = "secondary"
    let icon = <ArrowRightIcon className="h-4 w-4 mr-1" />

    if (trend === "increasing") {
      icon = <ArrowUpIcon className="h-4 w-4 mr-1" />
      color = metric === "volume" || metric === "sentiment" || metric === "rating" ? "success" : "destructive"
    } else if (trend === "decreasing") {
      icon = <ArrowDownIcon className="h-4 w-4 mr-1" />
      color = metric === "volume" || metric === "sentiment" || metric === "rating" ? "destructive" : "success"
    }

    return (
      <Badge variant={color} className="ml-2">
        <span className="flex items-center">
          {icon}
          {trend === "increasing" ? "증가" : trend === "decreasing" ? "감소" : "유지"}
        </span>
      </Badge>
    )
  }

  // 신뢰도 배지 반환
  const getConfidenceBadge = (confidence: number) => {
    let color: "success" | "warning" | "secondary" = "secondary"
    let text = "중간"

    if (confidence >= 0.7) {
      color = "success"
      text = "높음"
    } else if (confidence <= 0.3) {
      color = "warning"
      text = "낮음"
    }

    return (
      <Badge variant={color} className="ml-2">
        신뢰도: {text} ({Math.round(confidence * 100)}%)
      </Badge>
    )
  }

  // 영향 요인 아이콘 반환
  const getFactorIcon = (impact: number) => {
    if (impact > 0.5) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />
    } else if (impact < -0.5) {
      return <AlertTriangleIcon className="h-4 w-4 text-red-500" />
    } else {
      return <ArrowRightIcon className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  if (!volumePrediction || !sentimentPrediction || !ratingPrediction) {
    return <div>예측 데이터를 찾을 수 없습니다.</div>
  }

  // 예측 데이터 시각화
  const predictionData = [
    {
      name: "피드백 양",
      current: volumePrediction.currentValue,
      predicted: volumePrediction.predictedValue,
      trend: volumePrediction.trend,
      confidence: volumePrediction.confidence,
    },
    {
      name: "긍정적 피드백 비율",
      current: sentimentPrediction.currentValue,
      predicted: sentimentPrediction.predictedValue,
      trend: sentimentPrediction.trend,
      confidence: sentimentPrediction.confidence,
    },
    {
      name: "평균 평점",
      current: ratingPrediction.currentValue,
      predicted: ratingPrediction.predictedValue,
      trend: ratingPrediction.trend,
      confidence: ratingPrediction.confidence,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">피드백 예측 분석</h2>

        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "week" | "month")}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">피드백 양 예측</CardTitle>
              {getTrendBadge(volumePrediction.trend, "volume")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <div className="text-2xl font-bold">{Math.round(volumePrediction.predictedValue)}</div>
              <div className="text-sm text-muted-foreground mb-1">
                (현재: {Math.round(volumePrediction.currentValue)})
              </div>
            </div>
            <div className="mt-1 flex items-center">{getConfidenceBadge(volumePrediction.confidence)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">긍정적 피드백 비율 예측</CardTitle>
              {getTrendBadge(sentimentPrediction.trend, "sentiment")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <div className="text-2xl font-bold">{Math.round(sentimentPrediction.predictedValue)}%</div>
              <div className="text-sm text-muted-foreground mb-1">
                (현재: {Math.round(sentimentPrediction.currentValue)}%)
              </div>
            </div>
            <div className="mt-1 flex items-center">{getConfidenceBadge(sentimentPrediction.confidence)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">평균 평점 예측</CardTitle>
              {getTrendBadge(ratingPrediction.trend, "rating")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <div className="text-2xl font-bold">{ratingPrediction.predictedValue.toFixed(1)}/5</div>
              <div className="text-sm text-muted-foreground mb-1">
                (현재: {ratingPrediction.currentValue.toFixed(1)}/5)
              </div>
            </div>
            <div className="mt-1 flex items-center">{getConfidenceBadge(ratingPrediction.confidence)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions">
        <TabsList>
          <TabsTrigger value="predictions">예측 시각화</TabsTrigger>
          <TabsTrigger value="factors">영향 요인</TabsTrigger>
          <TabsTrigger value="actions">추천 액션</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>예측 시각화</CardTitle>
              <CardDescription>
                현재 값과 예측 값을 비교합니다. 예측은 과거 데이터 패턴을 기반으로 합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  current: {
                    label: "현재 값",
                    color: "hsl(var(--chart-1))",
                  },
                  predicted: {
                    label: "예측 값",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="current" fill="var(--color-current)" name="현재 값" />
                    <Bar dataKey="predicted" fill="var(--color-predicted)" name="예측 값" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>피드백 양 영향 요인</CardTitle>
              </CardHeader>
              <CardContent>
                {volumePrediction.factors.length > 0 ? (
                  <div className="space-y-4">
                    {volumePrediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getFactorIcon(factor.impact)}
                        <div>
                          <div className="font-medium">{factor.factor}</div>
                          <div className="text-sm text-muted-foreground">
                            영향도: {factor.impact > 0 ? "+" : ""}
                            {Math.round(factor.impact * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">영향 요인 데이터가 없습니다</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>긍정적 피드백 비율 영향 요인</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentPrediction.factors.length > 0 ? (
                  <div className="space-y-4">
                    {sentimentPrediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getFactorIcon(factor.impact)}
                        <div>
                          <div className="font-medium">{factor.factor}</div>
                          <div className="text-sm text-muted-foreground">
                            영향도: {factor.impact > 0 ? "+" : ""}
                            {Math.round(factor.impact * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">영향 요인 데이터가 없습니다</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>평균 평점 영향 요인</CardTitle>
              </CardHeader>
              <CardContent>
                {ratingPrediction.factors.length > 0 ? (
                  <div className="space-y-4">
                    {ratingPrediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getFactorIcon(factor.impact)}
                        <div>
                          <div className="font-medium">{factor.factor}</div>
                          <div className="text-sm text-muted-foreground">
                            영향도: {factor.impact > 0 ? "+" : ""}
                            {Math.round(factor.impact * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">영향 요인 데이터가 없습니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>피드백 양 개선 액션</CardTitle>
              </CardHeader>
              <CardContent>
                {volumePrediction.nextActions.length > 0 ? (
                  <div className="space-y-3">
                    {volumePrediction.nextActions.map((action, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {index + 1}
                          </div>
                          <div className="font-medium">{action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">추천 액션이 없습니다</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>긍정적 피드백 비율 개선 액션</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentPrediction.nextActions.length > 0 ? (
                  <div className="space-y-3">
                    {sentimentPrediction.nextActions.map((action, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {index + 1}
                          </div>
                          <div className="font-medium">{action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">추천 액션이 없습니다</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>평균 평점 개선 액션</CardTitle>
              </CardHeader>
              <CardContent>
                {ratingPrediction.nextActions.length > 0 ? (
                  <div className="space-y-3">
                    {ratingPrediction.nextActions.map((action, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {index + 1}
                          </div>
                          <div className="font-medium">{action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">추천 액션이 없습니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
