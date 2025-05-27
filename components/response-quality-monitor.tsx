"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Info, ThumbsDown, ThumbsUp } from "lucide-react"

type ResponseQualityData = {
  messageId: string
  userMessage: string
  botResponse: string
  intent: string
  confidence: number
  consistencyScore: number
  relevanceScore: number
  clarityScore: number
  issues?: string[]
  timestamp: string
}

export function ResponseQualityMonitor() {
  const [qualityData, setQualityData] = useState<ResponseQualityData[]>([])
  const [activeTab, setActiveTab] = useState("recent")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    averageConsistency: 0,
    averageRelevance: 0,
    averageClarity: 0,
    totalResponses: 0,
    issuesCount: 0,
  })

  // 데이터 로드 함수
  const loadQualityData = async () => {
    setLoading(true)
    try {
      // 실제 구현에서는 API 호출
      // const response = await fetch("/api/response-quality/data")
      // const data = await response.json()

      // 예시 데이터
      const mockData: ResponseQualityData[] = [
        {
          messageId: "msg_1",
          userMessage: "가장 가까운 충전소가 어디인가요?",
          botResponse:
            "현재 위치를 기준으로 가장 가까운 충전소는 강남역 2번 출구 앞 차지코리아 충전소입니다. 약 500m 거리에 있으며, 현재 2대의 급속 충전기와 4대의 완속 충전기가 운영 중입니다.",
          intent: "find_charger",
          confidence: 0.92,
          consistencyScore: 0.95,
          relevanceScore: 0.98,
          clarityScore: 0.9,
          timestamp: "2023-05-15T14:30:00Z",
        },
        {
          messageId: "msg_2",
          userMessage: "충전 요금은 얼마인가요?",
          botResponse:
            "차지코리아의 충전 요금은 다음과 같습니다. 급속 충전: kWh당 400원, 완속 충전: kWh당 250원입니다. 회원 등급에 따라 5-15% 할인이 적용될 수 있습니다.",
          intent: "pricing_inquiry",
          confidence: 0.88,
          consistencyScore: 0.92,
          relevanceScore: 0.95,
          clarityScore: 0.94,
          timestamp: "2023-05-15T15:20:00Z",
        },
        {
          messageId: "msg_3",
          userMessage: "충전기가 작동하지 않아요",
          botResponse:
            "충전기 이용에 불편을 드려 죄송합니다. 다음 단계를 시도해보세요: 1. 충전 케이블이 올바르게 연결되었는지 확인하세요. 2. 앱을 재시작하고 다시 시도하세요. 3. 다른 충전기를 이용해보세요. 문제가 지속되면 고객센터(1588-0000)로 연락주세요.",
          intent: "charger_issue",
          confidence: 0.85,
          consistencyScore: 0.88,
          relevanceScore: 0.9,
          clarityScore: 0.85,
          timestamp: "2023-05-15T16:45:00Z",
        },
        {
          messageId: "msg_4",
          userMessage: "앱에서 결제가 안 돼요",
          botResponse:
            "결제 문제가 발생하여 불편을 드려 죄송합니다. 다음 사항을 확인해보세요: 1. 앱이 최신 버전인지 확인하세요. 2. 등록된 카드 정보가 유효한지 확인하세요. 3. 네트워크 연결 상태를 확인하세요. 4. 앱을 재시작하고 다시 시도하세요.",
          intent: "payment_issue",
          confidence: 0.82,
          consistencyScore: 0.85,
          relevanceScore: 0.88,
          clarityScore: 0.8,
          issues: ["결제 실패의 구체적인 원인 분석 부족", "문제 지속 시 대안 제시 부족"],
          timestamp: "2023-05-15T17:30:00Z",
        },
        {
          messageId: "msg_5",
          userMessage: "테슬라 모델 3도 충전 가능한가요?",
          botResponse:
            "네, 테슬라 모델 3는 저희 충전소에서 충전 가능합니다. 차지코리아 충전소는 CCS 타입과 차데모 타입 커넥터를 모두 지원하며, 테슬라 모델 3는 CCS 타입을 사용합니다. 별도의 어댑터 없이 바로 이용 가능합니다.",
          intent: "vehicle_compatibility",
          confidence: 0.9,
          consistencyScore: 0.94,
          relevanceScore: 0.96,
          clarityScore: 0.92,
          timestamp: "2023-05-15T18:15:00Z",
        },
      ]

      setQualityData(mockData)

      // 통계 계산
      const totalResponses = mockData.length
      const avgConsistency = mockData.reduce((sum, item) => sum + item.consistencyScore, 0) / totalResponses
      const avgRelevance = mockData.reduce((sum, item) => sum + item.relevanceScore, 0) / totalResponses
      const avgClarity = mockData.reduce((sum, item) => sum + item.clarityScore, 0) / totalResponses
      const issuesCount = mockData.filter((item) => item.issues && item.issues.length > 0).length

      setStats({
        averageConsistency: avgConsistency,
        averageRelevance: avgRelevance,
        averageClarity: avgClarity,
        totalResponses,
        issuesCount,
      })
    } catch (error) {
      console.error("품질 데이터 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadQualityData()
  }, [])

  // 점수에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600"
    if (score >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  // 점수에 따른 배지 색상 결정
  const getScoreBadgeVariant = (score: number): "default" | "destructive" | "outline" | "secondary" | "success" => {
    if (score >= 0.9) return "success"
    if (score >= 0.7) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>응답 품질 모니터링</CardTitle>
          <CardDescription>AI 챗봇 응답의 품질을 실시간으로 모니터링합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">일관성 점수</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.averageConsistency)}`}>
                  {(stats.averageConsistency * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={stats.averageConsistency * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">관련성 점수</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.averageRelevance)}`}>
                  {(stats.averageRelevance * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={stats.averageRelevance * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">명확성 점수</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.averageClarity)}`}>
                  {(stats.averageClarity * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={stats.averageClarity * 100} className="h-2" />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                총 응답: {stats.totalResponses}
              </Badge>
              <Badge variant="outline" className="text-sm text-yellow-600">
                문제 감지: {stats.issuesCount}
              </Badge>
            </div>

            <Button size="sm" onClick={loadQualityData} disabled={loading}>
              {loading ? "로딩 중..." : "새로고침"}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">최근 응답</TabsTrigger>
              <TabsTrigger value="issues">문제 있는 응답</TabsTrigger>
              <TabsTrigger value="stats">통계</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <div className="space-y-4">
                {qualityData.map((item) => (
                  <Card key={item.messageId} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">사용자: {item.userMessage}</p>
                          <p className="text-xs text-gray-500">
                            인텐트: {item.intent} (신뢰도: {(item.confidence * 100).toFixed(1)}%)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant={getScoreBadgeVariant(item.consistencyScore)}>
                            일관성: {(item.consistencyScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md mt-2">
                        <p className="text-sm">{item.botResponse}</p>
                      </div>

                      {item.issues && item.issues.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-yellow-800">감지된 문제:</p>
                              <ul className="text-xs text-yellow-700 list-disc list-inside">
                                {item.issues.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end mt-2 gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">정확함</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">부정확함</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
              <div className="space-y-4">
                {qualityData
                  .filter((item) => item.issues && item.issues.length > 0)
                  .map((item) => (
                    <Card key={item.messageId} className="overflow-hidden border-yellow-300">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium">사용자: {item.userMessage}</p>
                            <p className="text-xs text-gray-500">
                              인텐트: {item.intent} (신뢰도: {(item.confidence * 100).toFixed(1)}%)
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant={getScoreBadgeVariant(item.consistencyScore)}>
                              일관성: {(item.consistencyScore * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md mt-2">
                          <p className="text-sm">{item.botResponse}</p>
                        </div>

                        <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-yellow-800">감지된 문제:</p>
                              <ul className="text-xs text-yellow-700 list-disc list-inside">
                                {item.issues?.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-2 gap-2">
                          <Button variant="outline" size="sm" className="h-7 px-2">
                            <span className="text-xs">수정 제안</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2">
                            <span className="text-xs">무시</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {qualityData.filter((item) => item.issues && item.issues.length > 0).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-lg font-medium">문제가 감지된 응답이 없습니다</h3>
                    <p className="text-sm text-gray-500 mt-1">모든 응답이 품질 기준을 충족합니다.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">응답 품질 통계</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">평균 일관성 점수</p>
                          <p className={`text-lg font-bold ${getScoreColor(stats.averageConsistency)}`}>
                            {(stats.averageConsistency * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">평균 관련성 점수</p>
                          <p className={`text-lg font-bold ${getScoreColor(stats.averageRelevance)}`}>
                            {(stats.averageRelevance * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">평균 명확성 점수</p>
                          <p className={`text-lg font-bold ${getScoreColor(stats.averageClarity)}`}>
                            {(stats.averageClarity * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">문제 감지율</p>
                          <p
                            className={`text-lg font-bold ${getScoreColor(1 - stats.issuesCount / stats.totalResponses)}`}
                          >
                            {((stats.issuesCount / stats.totalResponses) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">인텐트별 성능</h3>
                      <div className="space-y-2">
                        {Array.from(new Set(qualityData.map((item) => item.intent))).map((intent) => {
                          const intentItems = qualityData.filter((item) => item.intent === intent)
                          const avgConsistency =
                            intentItems.reduce((sum, item) => sum + item.consistencyScore, 0) / intentItems.length

                          return (
                            <div key={intent} className="flex items-center">
                              <span className="text-xs w-32 truncate">{intent}</span>
                              <div className="flex-1 mx-2">
                                <Progress value={avgConsistency * 100} className="h-2" />
                              </div>
                              <span className={`text-xs font-medium ${getScoreColor(avgConsistency)}`}>
                                {(avgConsistency * 100).toFixed(1)}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center mt-4">
                      <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2 max-w-md">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-blue-800">개선 제안</p>
                          <p className="text-xs text-blue-700 mt-1">
                            결제 문제와 관련된 응답의 일관성 점수가 상대적으로 낮습니다. 결제 문제 해결을 위한
                            프롬프트를 개선하고, 더 구체적인 문제 해결 단계를 제공하는 것이 좋겠습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
