"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  userSegmentAnalysisService,
  type UserSegment,
  type SegmentAnalysisResult,
} from "@/services/user-segment-analysis"
import type { FeedbackFilterOptions } from "@/types/feedback"

interface SegmentAnalysisDashboardProps {
  filters: FeedbackFilterOptions
}

export function SegmentAnalysisDashboard({ filters }: SegmentAnalysisDashboardProps) {
  const [segmentResults, setSegmentResults] = useState<SegmentAnalysisResult[]>([])
  const [selectedSegment, setSelectedSegment] = useState<UserSegment>("new_user")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)

      try {
        const results = userSegmentAnalysisService.analyzeAllSegments(filters)
        setSegmentResults(results)

        // 가장 피드백이 많은 세그먼트를 기본 선택
        if (results.length > 0) {
          const mostFeedbackSegment = results.reduce((prev, current) => (prev.count > current.count ? prev : current))
          setSelectedSegment(mostFeedbackSegment.segment)
        }
      } catch (error) {
        console.error("세그먼트 분석 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 선택된 세그먼트 결과 가져오기
  const getSelectedSegmentResult = () => {
    return segmentResults.find((result) => result.segment === selectedSegment) || null
  }

  // 세그먼트 이름 변환
  const getSegmentDisplayName = (segment: UserSegment): string => {
    const segmentNames: Record<UserSegment, string> = {
      new_user: "신규 사용자",
      power_user: "파워 유저",
      occasional_user: "가끔 사용하는 유저",
      returning_user: "복귀 유저",
      churned_user: "이탈 유저",
      mobile_user: "모바일 사용자",
      desktop_user: "데스크톱 사용자",
      ev_owner: "전기차 소유자",
      ev_curious: "전기차 관심자",
      charging_station_operator: "충전소 운영자",
    }

    return segmentNames[segment] || segment
  }

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  const selectedResult = getSelectedSegmentResult()

  if (!selectedResult) {
    return <div>선택된 세그먼트에 대한 데이터가 없습니다.</div>
  }

  // 감정 분포 데이터 변환
  const sentimentData = [
    { name: "긍정적", value: selectedResult.feedbackDistribution.positive, color: "#4ade80" },
    { name: "중립적", value: selectedResult.feedbackDistribution.neutral, color: "#94a3b8" },
    { name: "부정적", value: selectedResult.feedbackDistribution.negative, color: "#f87171" },
  ]

  // 세그먼트 비교 데이터 변환
  const segmentComparisonData = segmentResults.map((result) => ({
    name: getSegmentDisplayName(result.segment),
    count: result.count,
    positive: (result.feedbackDistribution.positive / result.count) * 100 || 0,
    negative: (result.feedbackDistribution.negative / result.count) * 100 || 0,
    averageRating: result.averageRating,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">사용자 세그먼트 분석</h2>

        <Select value={selectedSegment} onValueChange={(value) => setSelectedSegment(value as UserSegment)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="세그먼트 선택" />
          </SelectTrigger>
          <SelectContent>
            {segmentResults.map((result) => (
              <SelectItem key={result.segment} value={result.segment}>
                {getSegmentDisplayName(result.segment)} ({result.count}명)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">세그먼트 사용자 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedResult.count}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedResult.averageRating.toFixed(1)}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">긍정적 피드백 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {selectedResult.count > 0
                ? `${Math.round((selectedResult.feedbackDistribution.positive / selectedResult.count) * 100)}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="issues">주요 이슈</TabsTrigger>
          <TabsTrigger value="keywords">주요 키워드</TabsTrigger>
          <TabsTrigger value="comparison">세그먼트 비교</TabsTrigger>
          <TabsTrigger value="trends">트렌드</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>감정 분포</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>세그먼트 특성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">세그먼트 설명</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSegment === "new_user" &&
                        "최근에 서비스를 시작한 사용자들입니다. 초기 경험과 온보딩에 집중하세요."}
                      {selectedSegment === "power_user" &&
                        "서비스를 자주 사용하는 충성도 높은 사용자들입니다. 고급 기능과 개인화에 집중하세요."}
                      {selectedSegment === "occasional_user" &&
                        "가끔 서비스를 사용하는 사용자들입니다. 재방문 유도와 가치 제안에 집중하세요."}
                      {selectedSegment === "mobile_user" &&
                        "모바일 기기로 서비스를 이용하는 사용자들입니다. 모바일 UX 최적화에 집중하세요."}
                      {selectedSegment === "desktop_user" &&
                        "데스크톱으로 서비스를 이용하는 사용자들입니다. 데스크톱 환경 최적화에 집중하세요."}
                      {selectedSegment === "ev_owner" &&
                        "전기차를 소유한 사용자들입니다. 충전 경험과 차량 관련 기능에 집중하세요."}
                      {selectedSegment === "ev_curious" &&
                        "전기차에 관심이 있는 사용자들입니다. 정보 제공과 교육에 집중하세요."}
                      {selectedSegment === "charging_station_operator" &&
                        "충전소를 운영하는 사용자들입니다. 관리 도구와 분석에 집중하세요."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">주요 특징</h3>
                    <ul className="space-y-2">
                      {selectedSegment === "new_user" && (
                        <>
                          <li className="text-sm">• 서비스 사용 기간이 짧음</li>
                          <li className="text-sm">• 기본 기능 위주로 사용</li>
                          <li className="text-sm">• 온보딩 관련 피드백이 많음</li>
                        </>
                      )}
                      {selectedSegment === "power_user" && (
                        <>
                          <li className="text-sm">• 서비스 사용 빈도가 높음</li>
                          <li className="text-sm">• 고급 기능 사용률이 높음</li>
                          <li className="text-sm">• 상세하고 구체적인 피드백 제공</li>
                        </>
                      )}
                      {selectedSegment === "mobile_user" && (
                        <>
                          <li className="text-sm">• 모바일 기기로 접속</li>
                          <li className="text-sm">• 짧은 세션 시간</li>
                          <li className="text-sm">• UI/UX 관련 피드백이 많음</li>
                        </>
                      )}
                      {selectedSegment === "ev_owner" && (
                        <>
                          <li className="text-sm">• 충전 관련 기능 사용 빈도 높음</li>
                          <li className="text-sm">• 실시간 정보에 관심이 많음</li>
                          <li className="text-sm">• 충전소 관련 피드백이 많음</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">추천 접근 방법</h3>
                    <ul className="space-y-2">
                      {selectedSegment === "new_user" && (
                        <>
                          <li className="text-sm">• 간결하고 직관적인 UI/UX 제공</li>
                          <li className="text-sm">• 단계별 온보딩 가이드 강화</li>
                          <li className="text-sm">• 기본 기능 사용성 최적화</li>
                        </>
                      )}
                      {selectedSegment === "power_user" && (
                        <>
                          <li className="text-sm">• 고급 기능 및 단축키 제공</li>
                          <li className="text-sm">• 개인화 옵션 강화</li>
                          <li className="text-sm">• 베타 테스트 참여 기회 제공</li>
                        </>
                      )}
                      {selectedSegment === "mobile_user" && (
                        <>
                          <li className="text-sm">• 모바일 최적화 UI 개선</li>
                          <li className="text-sm">• 오프라인 기능 강화</li>
                          <li className="text-sm">• 터치 인터페이스 최적화</li>
                        </>
                      )}
                      {selectedSegment === "ev_owner" && (
                        <>
                          <li className="text-sm">• 충전 경험 최적화</li>
                          <li className="text-sm">• 차량 연동 기능 강화</li>
                          <li className="text-sm">• 실시간 충전소 정보 정확도 향상</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>주요 이슈</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResult.topIssues.length > 0 ? (
                <div className="space-y-4">
                  {selectedResult.topIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{issue.issue}</h3>
                          <p className="text-sm text-muted-foreground">언급 횟수: {issue.count}회</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          issue.sentiment === "positive"
                            ? "success"
                            : issue.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {issue.sentiment === "positive"
                          ? "긍정적"
                          : issue.sentiment === "negative"
                            ? "부정적"
                            : "중립적"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">이슈 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>주요 키워드</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResult.topKeywords.length > 0 ? (
                <ChartContainer
                  config={{
                    count: {
                      label: "언급 횟수",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedResult.topKeywords} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="keyword" width={150} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" name="언급 횟수" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">키워드 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>세그먼트 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "피드백 수",
                    color: "hsl(var(--chart-1))",
                  },
                  positive: {
                    label: "긍정적 비율 (%)",
                    color: "hsl(var(--chart-2))",
                  },
                  negative: {
                    label: "부정적 비율 (%)",
                    color: "hsl(var(--chart-3))",
                  },
                  averageRating: {
                    label: "평균 평점",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" name="피드백 수" />
                    <Bar yAxisId="left" dataKey="positive" fill="var(--color-positive)" name="긍정적 비율 (%)" />
                    <Bar yAxisId="left" dataKey="negative" fill="var(--color-negative)" name="부정적 비율 (%)" />
                    <Bar yAxisId="right" dataKey="averageRating" fill="var(--color-averageRating)" name="평균 평점" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시간별 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResult.trends.length > 0 ? (
                <ChartContainer
                  config={{
                    count: {
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
                    <BarChart data={selectedResult.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" name="피드백 수" />
                      <Bar yAxisId="right" dataKey="averageRating" fill="var(--color-averageRating)" name="평균 평점" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">트렌드 데이터가 없습니다</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
