"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import type { FeedbackFilterOptions } from "@/types/feedback"

interface FeedbackOverviewProps {
  filters: FeedbackFilterOptions
  onSelectNode: (nodeId: string) => void
}

export function FeedbackOverview({ filters, onSelectNode }: FeedbackOverviewProps) {
  const [feedbackData, setFeedbackData] = useState<any[]>([])
  const [sentimentData, setSentimentData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [nodeData, setNodeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 피드백 데이터 로드
    const loadData = () => {
      setLoading(true)

      try {
        // 피드백 목록 가져오기
        const feedbackList = feedbackAnalysisService.getFeedbackList(filters)

        // 피드백 유형 분포
        const typeCount: Record<string, number> = {
          rating: 0,
          text: 0,
          choice: 0,
          suggestion: 0,
        }

        feedbackList.forEach((feedback) => {
          typeCount[feedback.type]++
        })

        const typeData = Object.entries(typeCount).map(([type, count]) => ({
          name: type === "rating" ? "평점" : type === "text" ? "텍스트" : type === "choice" ? "선택형" : "제안",
          value: count,
        }))

        setFeedbackData(typeData)

        // 감정 분포
        const sentimentCount: Record<string, number> = {
          positive: 0,
          neutral: 0,
          negative: 0,
        }

        feedbackList.forEach((feedback) => {
          const sentiment =
            feedback.type === "text" || feedback.type === "suggestion"
              ? feedback.sentiment || "neutral"
              : feedback.type === "rating"
                ? feedback.rating >= 4
                  ? "positive"
                  : feedback.rating <= 2
                    ? "negative"
                    : "neutral"
                : "neutral"

          sentimentCount[sentiment]++
        })

        const sentimentData = Object.entries(sentimentCount).map(([sentiment, count]) => ({
          name: sentiment === "positive" ? "긍정적" : sentiment === "neutral" ? "중립적" : "부정적",
          value: count,
          color: sentiment === "positive" ? "#4ade80" : sentiment === "neutral" ? "#94a3b8" : "#f87171",
        }))

        setSentimentData(sentimentData)

        // 카테고리 분포
        const categoryCount: Record<string, number> = {
          usability: 0,
          accuracy: 0,
          speed: 0,
          clarity: 0,
          completeness: 0,
          relevance: 0,
          other: 0,
        }

        feedbackList.forEach((feedback) => {
          const category = feedback.category || "other"
          categoryCount[category]++
        })

        const categoryData = Object.entries(categoryCount).map(([category, count]) => ({
          name:
            category === "usability"
              ? "사용성"
              : category === "accuracy"
                ? "정확성"
                : category === "speed"
                  ? "속도"
                  : category === "clarity"
                    ? "명확성"
                    : category === "completeness"
                      ? "완전성"
                      : category === "relevance"
                        ? "관련성"
                        : "기타",
          value: count,
        }))

        setCategoryData(categoryData)

        // 노드별 피드백 수
        const nodeCount: Record<string, { count: number; positive: number; negative: number }> = {}

        feedbackList.forEach((feedback) => {
          if (!feedback.nodeId) return

          if (!nodeCount[feedback.nodeId]) {
            nodeCount[feedback.nodeId] = { count: 0, positive: 0, negative: 0 }
          }

          nodeCount[feedback.nodeId].count++

          const sentiment =
            feedback.type === "text" || feedback.type === "suggestion"
              ? feedback.sentiment || "neutral"
              : feedback.type === "rating"
                ? feedback.rating >= 4
                  ? "positive"
                  : feedback.rating <= 2
                    ? "negative"
                    : "neutral"
                : "neutral"

          if (sentiment === "positive") {
            nodeCount[feedback.nodeId].positive++
          } else if (sentiment === "negative") {
            nodeCount[feedback.nodeId].negative++
          }
        })

        const nodeData = Object.entries(nodeCount)
          .map(([nodeId, data]) => ({
            nodeId,
            count: data.count,
            positive: data.positive,
            negative: data.negative,
            ratio: data.positive / (data.positive + data.negative) || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setNodeData(nodeData)
      } catch (error) {
        console.error("피드백 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 피드백 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackData.reduce((sum, item) => sum + item.value, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">긍정적 피드백 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {sentimentData.length > 0
                ? `${Math.round(
                    ((sentimentData.find((d) => d.name === "긍정적")?.value || 0) /
                      sentimentData.reduce((sum, item) => sum + item.value, 0)) *
                      100,
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">부정적 피드백 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {sentimentData.length > 0
                ? `${Math.round(
                    ((sentimentData.find((d) => d.name === "부정적")?.value || 0) /
                      sentimentData.reduce((sum, item) => sum + item.value, 0)) *
                      100,
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">피드백이 가장 많은 노드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">
              {nodeData.length > 0 ? (
                <button onClick={() => onSelectNode(nodeData[0].nodeId)} className="text-blue-500 hover:underline">
                  {nodeData[0].nodeId}
                </button>
              ) : (
                "없음"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">피드백 분포</TabsTrigger>
          <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
          <TabsTrigger value="nodes">노드별 피드백</TabsTrigger>
        </TabsList>
        <TabsContent value="distribution" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>피드백 유형 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "피드백 수",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedbackData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>카테고리 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "피드백 수",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sentiment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>감정 분석 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nodes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>노드별 피드백 (상위 10개)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "총 피드백 수",
                    color: "hsl(var(--chart-1))",
                  },
                  positive: {
                    label: "긍정적 피드백",
                    color: "hsl(var(--chart-2))",
                  },
                  negative: {
                    label: "부정적 피드백",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nodeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="nodeId"
                      width={150}
                      tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={-3}
                            y={0}
                            dy={4}
                            textAnchor="end"
                            fill="#666"
                            className="text-xs cursor-pointer hover:font-bold"
                            onClick={() => onSelectNode(payload.value)}
                          >
                            {payload.value}
                          </text>
                        </g>
                      )}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="positive" fill="var(--color-positive)" stackId="a" />
                    <Bar dataKey="negative" fill="var(--color-negative)" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
