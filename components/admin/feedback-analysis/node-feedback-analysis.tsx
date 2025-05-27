"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import { treeOptimizerService } from "@/services/tree-optimizer-service"
import type { FeedbackAnalysis, FeedbackFilterOptions } from "@/types/feedback"
import type { TroubleshootingNode } from "@/types/troubleshooting"

interface NodeFeedbackAnalysisProps {
  nodeId: string
  filters: FeedbackFilterOptions
}

export function NodeFeedbackAnalysis({ nodeId, filters }: NodeFeedbackAnalysisProps) {
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null)
  const [nodeInfo, setNodeInfo] = useState<TroubleshootingNode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)

      try {
        // 노드 정보 가져오기
        const currentTree = treeOptimizerService.getCurrentTree()
        const findNode = (nodes: TroubleshootingNode[]): TroubleshootingNode | null => {
          for (const node of nodes) {
            if (node.id === nodeId) return node
            if (node.children) {
              const found = findNode(node.children)
              if (found) return found
            }
          }
          return null
        }

        const node = findNode(currentTree)
        setNodeInfo(node)

        // 노드 피드백 분석 가져오기
        const nodeAnalysis = feedbackAnalysisService.analyzeNodeFeedback(nodeId, filters)
        setAnalysis(nodeAnalysis)
      } catch (error) {
        console.error("노드 피드백 분석 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [nodeId, filters])

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  if (!analysis) {
    return <div>분석 데이터를 찾을 수 없습니다.</div>
  }

  // 감정 분포 데이터 변환
  const sentimentData = [
    { name: "긍정적", value: analysis.sentimentDistribution.positive },
    { name: "중립적", value: analysis.sentimentDistribution.neutral },
    { name: "부정적", value: analysis.sentimentDistribution.negative },
  ]

  // 카테고리 분포 데이터 변환
  const categoryData = Object.entries(analysis.categoryDistribution).map(([category, count]) => ({
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>노드 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">ID:</span> {nodeId}
              </div>
              <div>
                <span className="font-medium">제목:</span> {nodeInfo?.title || "알 수 없음"}
              </div>
              <div>
                <span className="font-medium">유형:</span>{" "}
                <Badge>
                  {nodeInfo?.type === "question"
                    ? "질문"
                    : nodeInfo?.type === "solution"
                      ? "해결책"
                      : nodeInfo?.type || "알 수 없음"}
                </Badge>
              </div>
              {nodeInfo?.description && (
                <div>
                  <span className="font-medium">설명:</span> {nodeInfo.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>피드백 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">총 피드백 수</div>
                <div className="text-2xl font-bold">{analysis.feedbackCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">평균 평점</div>
                <div className="text-2xl font-bold">
                  {analysis.averageRating ? analysis.averageRating.toFixed(1) : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">긍정적 피드백 비율</div>
                <div className="text-2xl font-bold text-green-500">
                  {analysis.sentimentDistribution.positive +
                    analysis.sentimentDistribution.neutral +
                    analysis.sentimentDistribution.negative >
                  0
                    ? `${Math.round(
                        (analysis.sentimentDistribution.positive /
                          (analysis.sentimentDistribution.positive +
                            analysis.sentimentDistribution.neutral +
                            analysis.sentimentDistribution.negative)) *
                          100,
                      )}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sentiment">
        <TabsList>
          <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
          <TabsTrigger value="keywords">키워드 분석</TabsTrigger>
          <TabsTrigger value="trends">트렌드</TabsTrigger>
          <TabsTrigger value="suggestions">제안</TabsTrigger>
        </TabsList>
        <TabsContent value="sentiment" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>감정 분포</CardTitle>
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
                    <BarChart data={sentimentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" name="피드백 수" barSize={60} />
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
                      <Bar dataKey="value" fill="var(--color-value)" name="피드백 수" barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="keywords" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>주요 키워드</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.commonKeywords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analysis.commonKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge
                        variant={
                          keyword.sentiment === "positive"
                            ? "success"
                            : keyword.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {keyword.count}
                      </Badge>
                      <span className="font-medium">{keyword.keyword}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">키워드 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시간별 피드백 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.trends.length > 0 ? (
                <ChartContainer
                  config={{
                    feedbackCount: {
                      label: "피드백 수",
                      color: "hsl(var(--chart-1))",
                    },
                    averageRating: {
                      label: "평균 평점",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="feedbackCount"
                        stroke="var(--color-feedbackCount)"
                        name="피드백 수"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="averageRating"
                        stroke="var(--color-averageRating)"
                        name="평균 평점"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-4 text-muted-foreground">트렌드 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suggestions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 제안</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            suggestion.sentiment === "positive"
                              ? "success"
                              : suggestion.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {suggestion.sentiment === "positive"
                            ? "긍정적"
                            : suggestion.sentiment === "negative"
                              ? "부정적"
                              : "중립적"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(suggestion.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p>{suggestion.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">제안 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
