"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
} from "lucide-react"
import type { ConversationInsight, ConversationPattern } from "@/types/conversation-data-processor"

interface ConversationInsightsViewProps {
  insights: ConversationInsight[]
  patterns: ConversationPattern[]
}

export function ConversationInsightsView({ insights, patterns }: ConversationInsightsViewProps) {
  const [selectedInsight, setSelectedInsight] = useState<ConversationInsight | null>(null)

  // 인사이트 유형별 필터링
  const improvementInsights = insights.filter((insight) => insight.type === "improvement")
  const issueInsights = insights.filter((insight) => insight.type === "issue")
  const opportunityInsights = insights.filter((insight) => insight.type === "opportunity")
  const successInsights = insights.filter((insight) => insight.type === "success")

  // 인사이트 카드 렌더링 함수
  const renderInsightCard = (insight: ConversationInsight, index: number) => {
    // 인사이트 유형에 따른 아이콘 및 색상 설정
    const getIconAndColor = () => {
      switch (insight.type) {
        case "improvement":
          return { icon: <TrendingUp className="h-5 w-5" />, color: "text-blue-500 bg-blue-50" }
        case "issue":
          return { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-500 bg-red-50" }
        case "opportunity":
          return { icon: <Lightbulb className="h-5 w-5" />, color: "text-amber-500 bg-amber-50" }
        case "success":
          return { icon: <CheckCircle className="h-5 w-5" />, color: "text-green-500 bg-green-50" }
        default:
          return { icon: <MessageSquare className="h-5 w-5" />, color: "text-gray-500 bg-gray-50" }
      }
    }

    const { icon, color } = getIconAndColor()

    return (
      <Card
        key={index}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedInsight(insight)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${color}`}>{icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{insight.title}</h4>
                <Badge variant="outline">{insight.confidence.toFixed(0)}% 신뢰도</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <span>관련 패턴: {insight.relatedPatterns.length}</span>
                <span className="mx-2">•</span>
                <span>영향: {insight.impact}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 선택된 인사이트 상세 정보 렌더링
  const renderInsightDetails = () => {
    if (!selectedInsight) return null

    // 관련 패턴 찾기
    const relatedPatterns = patterns.filter((pattern) => selectedInsight.relatedPatterns.includes(pattern.id))

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{selectedInsight.title}</CardTitle>
            <Badge variant={selectedInsight.type === "issue" ? "destructive" : "outline"}>
              {selectedInsight.type.charAt(0).toUpperCase() + selectedInsight.type.slice(1)}
            </Badge>
          </div>
          <CardDescription>{selectedInsight.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">주요 지표</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">신뢰도</p>
                <p className="text-lg font-semibold">{selectedInsight.confidence}%</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">영향</p>
                <p className="text-lg font-semibold">{selectedInsight.impact}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">관련 패턴</p>
                <p className="text-lg font-semibold">{selectedInsight.relatedPatterns.length}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">권장 조치</h4>
            <div className="space-y-2">
              {selectedInsight.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">관련 대화 패턴</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {relatedPatterns.map((pattern, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">패턴 #{pattern.id}</p>
                      <p className="text-xs text-muted-foreground">빈도: {pattern.frequency}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs bg-muted p-2 rounded-md max-h-20 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{pattern.pattern}</pre>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedInsight(null)}>
              목록으로 돌아가기
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ThumbsDown className="h-4 w-4 mr-1" />
                거부
              </Button>
              <Button variant="default" size="sm">
                <ThumbsUp className="h-4 w-4 mr-1" />
                승인
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">전체 ({insights.length})</TabsTrigger>
            <TabsTrigger value="improvements">개선 ({improvementInsights.length})</TabsTrigger>
            <TabsTrigger value="issues">이슈 ({issueInsights.length})</TabsTrigger>
            <TabsTrigger value="opportunities">기회 ({opportunityInsights.length})</TabsTrigger>
            <TabsTrigger value="successes">성공 ({successInsights.length})</TabsTrigger>
          </TabsList>

          <div className="space-y-3">
            <TabsContent value="all" className="m-0">
              {insights.map(renderInsightCard)}
            </TabsContent>

            <TabsContent value="improvements" className="m-0">
              {improvementInsights.map(renderInsightCard)}
            </TabsContent>

            <TabsContent value="issues" className="m-0">
              {issueInsights.map(renderInsightCard)}
            </TabsContent>

            <TabsContent value="opportunities" className="m-0">
              {opportunityInsights.map(renderInsightCard)}
            </TabsContent>

            <TabsContent value="successes" className="m-0">
              {successInsights.map(renderInsightCard)}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div>
        {selectedInsight ? (
          renderInsightDetails()
        ) : (
          <Card className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">인사이트 세부 정보</h3>
              <p className="text-sm text-muted-foreground mt-1">왼쪽에서 인사이트를 선택하여 세부 정보를 확인하세요.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
