"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/analytics/charts"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Users, Clock, TrendingUp, AlertCircle } from "lucide-react"
import type { ConversationDataSummary } from "@/types/conversation-data-processor"

interface ConversationDataSummaryViewProps {
  summary: ConversationDataSummary
}

export function ConversationDataSummaryView({ summary }: ConversationDataSummaryViewProps) {
  // 데이터 포맷팅 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  // 차트 데이터 준비
  const conversationsByDateData = {
    labels: summary.conversationsByDate.map((item) => item.date),
    datasets: [
      {
        label: "대화 수",
        data: summary.conversationsByDate.map((item) => item.count),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.2)",
      },
    ],
  }

  const topIntentsData = {
    labels: summary.topIntents.map((item) => item.intent),
    datasets: [
      {
        label: "빈도",
        data: summary.topIntents.map((item) => item.count),
        backgroundColor: [
          "hsl(var(--primary))",
          "hsl(var(--primary) / 0.8)",
          "hsl(var(--primary) / 0.6)",
          "hsl(var(--primary) / 0.4)",
          "hsl(var(--primary) / 0.2)",
        ],
        borderColor: "hsl(var(--background))",
        borderWidth: 2,
      },
    ],
  }

  const sentimentDistributionData = {
    labels: ["긍정", "중립", "부정"],
    datasets: [
      {
        label: "감정 분포",
        data: [
          summary.sentimentDistribution.positive,
          summary.sentimentDistribution.neutral,
          summary.sentimentDistribution.negative,
        ],
        backgroundColor: ["hsl(var(--success) / 0.7)", "hsl(var(--muted) / 0.7)", "hsl(var(--destructive) / 0.7)"],
        borderColor: "hsl(var(--background))",
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 대화</p>
                <h3 className="text-2xl font-bold mt-1">{formatNumber(summary.totalConversations)}</h3>
              </div>
              <MessageSquare className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.conversationTrend > 0 ? "+" : ""}
              {formatPercentage(summary.conversationTrend)} 지난 기간 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">고유 사용자</p>
                <h3 className="text-2xl font-bold mt-1">{formatNumber(summary.uniqueUsers)}</h3>
              </div>
              <Users className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              평균 {(summary.totalConversations / summary.uniqueUsers).toFixed(1)}회 대화/사용자
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">평균 대화 시간</p>
                <h3 className="text-2xl font-bold mt-1">{summary.averageConversationDuration}분</h3>
              </div>
              <Clock className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.durationTrend > 0 ? "+" : ""}
              {formatPercentage(summary.durationTrend)} 지난 기간 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">해결률</p>
                <h3 className="text-2xl font-bold mt-1">{formatPercentage(summary.resolutionRate)}</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.resolutionTrend > 0 ? "+" : ""}
              {formatPercentage(summary.resolutionTrend)} 지난 기간 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 및 상세 정보 */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="intents">의도 분석</TabsTrigger>
          <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일별 대화량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart data={conversationsByDateData} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>주요 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">평균 메시지 수/대화</p>
                    <p className="text-lg font-semibold">{summary.averageMessagesPerConversation.toFixed(1)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">평균 응답 시간</p>
                    <p className="text-lg font-semibold">{summary.averageResponseTime.toFixed(1)}초</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">최대 동시 대화</p>
                    <p className="text-lg font-semibold">{summary.peakConcurrentConversations}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">재방문율</p>
                    <p className="text-lg font-semibold">{formatPercentage(summary.returnRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>주요 이슈</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.topIssues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{issue.issue}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-muted-foreground">빈도: {issue.frequency}</p>
                          <Badge variant="outline" className="ml-2">
                            {formatPercentage(issue.percentage)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>상위 의도 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChart data={topIntentsData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>의도별 해결률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.intentResolutionRates.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{item.intent}</p>
                      <p className="text-sm font-medium">{formatPercentage(item.resolutionRate)}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${item.resolutionRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>감정 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PieChart data={sentimentDistributionData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>감정 추세</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">긍정적 감정 변화</p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold">
                        {summary.sentimentTrend.positive > 0 ? "+" : ""}
                        {formatPercentage(summary.sentimentTrend.positive)}
                      </p>
                      <Badge
                        variant={summary.sentimentTrend.positive >= 0 ? "outline" : "destructive"}
                        className="ml-2"
                      >
                        {summary.sentimentTrend.positive >= 0 ? "개선" : "악화"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">부정적 감정 변화</p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold">
                        {summary.sentimentTrend.negative > 0 ? "+" : ""}
                        {formatPercentage(summary.sentimentTrend.negative)}
                      </p>
                      <Badge
                        variant={summary.sentimentTrend.negative <= 0 ? "outline" : "destructive"}
                        className="ml-2"
                      >
                        {summary.sentimentTrend.negative <= 0 ? "개선" : "악화"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">감정 전환율</p>
                    <p className="text-lg font-semibold">{formatPercentage(summary.sentimentShiftRate)}</p>
                    <p className="text-xs text-muted-foreground mt-1">부정에서 긍정으로 전환된 대화의 비율</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>감정별 평균 대화 길이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">긍정적 대화</p>
                    <p className="text-sm font-medium">
                      {summary.averageConversationLengthBySentiment.positive.toFixed(1)} 메시지
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${(summary.averageConversationLengthBySentiment.positive / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">중립적 대화</p>
                    <p className="text-sm font-medium">
                      {summary.averageConversationLengthBySentiment.neutral.toFixed(1)} 메시지
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-gray-500 h-2.5 rounded-full"
                      style={{ width: `${(summary.averageConversationLengthBySentiment.neutral / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">부정적 대화</p>
                    <p className="text-sm font-medium">
                      {summary.averageConversationLengthBySentiment.negative.toFixed(1)} 메시지
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{ width: `${(summary.averageConversationLengthBySentiment.negative / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
